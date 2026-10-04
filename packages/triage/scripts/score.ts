/**
 * Scored accuracy report: runs the triage pipeline over every labeled ticket and
 * compares predictions against the gold labels in experiments/data/dataset.json.
 *
 *   npm run score                         # dev split, default provider
 *   npm run score -- --provider openai    # same tickets on OpenAI
 *   npm run score -- --test               # frozen test split (or --all for everything)
 *   npm run score -- --no-save            # print only, don't write runs/<runId>.json
 *
 * Reports category accuracy + per-class precision/recall/F1 + a confusion matrix,
 * and severity exact / off-by-one / mean-absolute-error (severity is ordinal).
 * Each run is saved to runs/ (see scripts/lib/runs.ts) for compare.ts and the dashboard.
 */
import "./load-env";

import { retrievalQuery, triageTicket } from "../src/index";
import { cachedEmbedQuery, warmEmbeddingCache } from "./lib/embed-cache";
import { CATEGORIES, loadDataset, type DatasetTicket, type Split } from "./lib/dataset";
import { chooseProvider } from "./lib/cli";
import { makeRunId, promptHash, summarizeRun, writeRunFile, type RunRow } from "./lib/runs";

const CONCURRENCY   = 5;
const USE_RETRIEVAL = true;

// Run async work over items with a fixed concurrency, preserving input order.
async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const idx = next++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function pct(n: number, d: number): string {
  return d === 0 ? "n/a" : `${n}/${d} (${Math.round((n / d) * 100)}%)`;
}

function pctOf(ratio: number, d: number): string {
  return pct(Math.round(ratio * d), d);
}

function fmt(x: number | null): string {
  return x === null ? "  — " : x.toFixed(2);
}

function pad(s: string, width: number): string {
  return s.length >= width ? s : s + " ".repeat(width - s.length);
}

function countTo(pairs: string[]): [string, number][] {
  const m = new Map<string, number>();
  for (const k of pairs) m.set(k, (m.get(k) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const { name, model } = chooseProvider(args);
  const save = !args.includes("--no-save");

  // Scope: default to the dev split so routine iteration never touches the frozen test set.
  const scope: Split | null = args.includes("--test") ? "test"
    : args.includes("--all") ? null
    : "dev";
  const inScope = (t: DatasetTicket) => scope === null || t.split === scope;

  const { tickets } = loadDataset();
  const scored = tickets.filter((t) => t.gold != null && inScope(t));
  const skipped = tickets.filter((t) => t.gold == null && inScope(t));

  if (scored.length === 0) {
    console.error(`No labeled tickets in scope (${scope ?? "all"}). Run dataset:migrate / verify first.`);
    process.exit(1);
  }

  console.log(
    `Triaging ${scored.length} labeled tickets [scope: ${scope ?? "all"}] ` +
    `with ${name} (${model}), concurrency ${CONCURRENCY}…`
  );

  if (USE_RETRIEVAL) {
    await warmEmbeddingCache(scored.map((t) => retrievalQuery(t)));
  }

  const startedAt = new Date();
  const rows = await mapPool(scored, CONCURRENCY, async (t): Promise<RunRow> => {
    const gold = t.gold!;
    const base = { id: t.id, goldCat: gold.category, goldSev: gold.severity };
    const outcome = await triageTicket(
      { subject: t.subject, body: t.body },
      { provider: name, model, useRetrieval: USE_RETRIEVAL, embedQuery: cachedEmbedQuery }
    );
    if (!outcome.ok) {
      return { ...base, ok: false, reason: outcome.reason, errors: outcome.lastErrors };
    }
    return {
      ...base,
      ok:        true,
      result:    outcome.result,
      attempts:  outcome.attempts,
      usage:     outcome.usage,
      latencyMs: outcome.latencyMs,
    };
  });

  const summary = summarizeRun(rows);
  const ok = rows.filter((r) => r.ok);
  const failed = rows.filter((r) => !r.ok);
  const n = ok.length;

  // ── Category ────────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(64));
  console.log("CATEGORY");
  console.log("═".repeat(64));
  console.log(`  accuracy: ${pctOf(summary.catAccuracy, n)}`);
  console.log(`  ${pad("class", 16)} ${pad("P", 5)} ${pad("R", 5)} ${pad("F1", 5)} support`);
  for (const c of CATEGORIES) {
    const tp = ok.filter((r) => r.result.category === c && r.goldCat === c).length;
    const fp = ok.filter((r) => r.result.category === c && r.goldCat !== c).length;
    const fn = ok.filter((r) => r.result.category !== c && r.goldCat === c).length;
    const support = ok.filter((r) => r.goldCat === c).length;
    const prec = tp + fp === 0 ? null : tp / (tp + fp);
    const rec = tp + fn === 0 ? null : tp / (tp + fn);
    const f1 = prec !== null && rec !== null && prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : null;
    console.log(`  ${pad(c, 16)} ${fmt(prec)}  ${fmt(rec)}  ${fmt(f1)}  ${support}`);
  }

  const catMistakes = countTo(
    ok.filter((r) => r.result.category !== r.goldCat).map((r) => `${r.goldCat} → ${r.result.category}`)
  );
  console.log("\n  confusion (actual → predicted):");
  if (catMistakes.length === 0) console.log("    (no category mistakes)");
  for (const [k, v] of catMistakes) console.log(`    ${pad(k, 28)} ×${v}`);

  // ── Severity (ordinal) ──────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(64));
  console.log("SEVERITY (ordinal: low < medium < high < critical)");
  console.log("═".repeat(64));
  console.log(`  exact:        ${pctOf(summary.sevExact, n)}`);
  console.log(`  off-by-one:   ${pctOf(summary.sevWithin1, n)}`);
  console.log(`  mean abs err: ${summary.sevMae.toFixed(2)}  (0 = perfect)`);

  const sevMistakes = countTo(
    ok.filter((r) => r.result.severity !== r.goldSev).map((r) => `${r.goldSev} → ${r.result.severity}`)
  );
  console.log("\n  confusion (actual → predicted):");
  if (sevMistakes.length === 0) console.log("    (no severity mistakes)");
  for (const [k, v] of sevMistakes) console.log(`    ${pad(k, 28)} ×${v}`);

  // ── Per-ticket mistakes ─────────────────────────────────────────────────────
  const wrong = ok.filter((r) => r.result.category !== r.goldCat || r.result.severity !== r.goldSev);
  console.log("\n" + "═".repeat(64));
  console.log(`PER-TICKET MISTAKES (${wrong.length})`);
  console.log("═".repeat(64));
  for (const r of wrong) {
    const cat = r.result.category === r.goldCat ? "✓" : `✗ ${r.goldCat}→${r.result.category}`;
    const sev = r.result.severity === r.goldSev ? "✓" : `✗ ${r.goldSev}→${r.result.severity}`;
    console.log(`  ${pad(r.id, 5)} cat ${pad(cat, 22)} sev ${sev}`);
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(64));
  console.log(`triaged ok: ${n}/${scored.length}` + (failed.length ? `  | FAILED: ${failed.length}` : ""));
  for (const r of failed) console.log(`  ✗ ${r.id}: ${r.reason}`);
  if (skipped.length) console.log(`unlabeled (skipped): ${skipped.map((t) => t.id).join(", ")}`);
  console.log(
    `tokens: ${summary.inputTokens} in / ${summary.outputTokens} out · ` +
    `median latency: ${(summary.p50LatencyMs / 1000).toFixed(1)}s`
  );

  if (save) {
    const runId = makeRunId(name, model, startedAt);
    const path = writeRunFile({
      version:      1,
      runId,
      createdAt:    startedAt.toISOString(),
      provider:     name,
      model,
      promptHash:   promptHash(),
      useRetrieval: USE_RETRIEVAL,
      split:        scope ?? "all",
      summary,
      rows,
    });
    console.log(`saved: ${path}`);
  }
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});