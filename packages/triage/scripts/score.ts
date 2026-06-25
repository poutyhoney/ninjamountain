/**
 * Scored accuracy report: runs the triage pipeline over every labeled ticket and
 * compares predictions against the gold labels in experiments/data/labels.json.
 *
 *   npm run score
 *
 * Reports category accuracy + per-class precision/recall/F1 + a confusion matrix,
 * and severity exact / off-by-one / mean-absolute-error (severity is ordinal).
 */
import "./load-env";

import { triageTicket } from "../src/index";
import type { Category, Severity } from "../src/index";
import { CATEGORIES, SEV_RANK, loadDataset, type DatasetTicket, type Split } from "./lib/dataset";

const CONCURRENCY = 5;

type Row = {
  id: string;
  goldCat: Category;
  goldSev: Severity;
  predCat?: Category;
  predSev?: Severity;
  failed?: string;
};

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
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Add it to packages/triage/.env or export it.");
    process.exit(1);
  }

  // Scope: default to the dev split so routine iteration never touches the frozen test set.
  const scope: Split | null = process.argv.includes("--test") ? "test"
    : process.argv.includes("--all") ? null
    : "dev";
  const inScope = (t: DatasetTicket) => scope === null || t.split === scope;

  const { tickets } = loadDataset();
  const scored = tickets.filter((t) => t.gold != null && inScope(t));
  const skipped = tickets.filter((t) => t.gold == null && inScope(t));

  if (scored.length === 0) {
    console.error(`No labeled tickets in scope (${scope ?? "all"}). Run dataset:migrate / verify first.`);
    process.exit(1);
  }

  console.log(`Triaging ${scored.length} labeled tickets [scope: ${scope ?? "all"}] (concurrency ${CONCURRENCY})…`);

  const rows: Row[] = await mapPool(scored, CONCURRENCY, async (t) => {
    const gold = t.gold!;
    const outcome = await triageTicket({ subject: t.subject, body: t.body });
    if (!outcome.ok) {
      return { id: t.id, goldCat: gold.category, goldSev: gold.severity, failed: outcome.reason };
    }
    return {
      id: t.id,
      goldCat: gold.category,
      goldSev: gold.severity,
      predCat: outcome.result.category,
      predSev: outcome.result.severity,
    };
  });

  const ok = rows.filter((r) => !r.failed && r.predCat && r.predSev);
  const failed = rows.filter((r) => r.failed);
  const n = ok.length;

  // ── Category ────────────────────────────────────────────────────────────────
  const catCorrect = ok.filter((r) => r.predCat === r.goldCat).length;

  console.log("\n" + "═".repeat(64));
  console.log("CATEGORY");
  console.log("═".repeat(64));
  console.log(`  accuracy: ${pct(catCorrect, n)}`);
  console.log(`  ${pad("class", 16)} ${pad("P", 5)} ${pad("R", 5)} ${pad("F1", 5)} support`);
  for (const c of CATEGORIES) {
    const tp = ok.filter((r) => r.predCat === c && r.goldCat === c).length;
    const fp = ok.filter((r) => r.predCat === c && r.goldCat !== c).length;
    const fn = ok.filter((r) => r.predCat !== c && r.goldCat === c).length;
    const support = ok.filter((r) => r.goldCat === c).length;
    const prec = tp + fp === 0 ? null : tp / (tp + fp);
    const rec = tp + fn === 0 ? null : tp / (tp + fn);
    const f1 = prec !== null && rec !== null && prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : null;
    console.log(`  ${pad(c, 16)} ${fmt(prec)}  ${fmt(rec)}  ${fmt(f1)}  ${support}`);
  }

  const catMistakes = countTo(
    ok.filter((r) => r.predCat !== r.goldCat).map((r) => `${r.goldCat} → ${r.predCat}`)
  );
  console.log("\n  confusion (actual → predicted):");
  if (catMistakes.length === 0) console.log("    (no category mistakes)");
  for (const [k, v] of catMistakes) console.log(`    ${pad(k, 28)} ×${v}`);

  // ── Severity (ordinal) ──────────────────────────────────────────────────────
  const sevExact = ok.filter((r) => r.predSev === r.goldSev).length;
  const sevWithin1 = ok.filter(
    (r) => Math.abs(SEV_RANK[r.predSev!] - SEV_RANK[r.goldSev]) <= 1
  ).length;
  const mae = ok.reduce((s, r) => s + Math.abs(SEV_RANK[r.predSev!] - SEV_RANK[r.goldSev]), 0) / n;

  console.log("\n" + "═".repeat(64));
  console.log("SEVERITY (ordinal: low < medium < high < critical)");
  console.log("═".repeat(64));
  console.log(`  exact:        ${pct(sevExact, n)}`);
  console.log(`  off-by-one:   ${pct(sevWithin1, n)}`);
  console.log(`  mean abs err: ${mae.toFixed(2)}  (0 = perfect)`);

  const sevMistakes = countTo(
    ok.filter((r) => r.predSev !== r.goldSev).map((r) => `${r.goldSev} → ${r.predSev}`)
  );
  console.log("\n  confusion (actual → predicted):");
  if (sevMistakes.length === 0) console.log("    (no severity mistakes)");
  for (const [k, v] of sevMistakes) console.log(`    ${pad(k, 28)} ×${v}`);

  // ── Per-ticket mistakes ─────────────────────────────────────────────────────
  const wrong = ok.filter((r) => r.predCat !== r.goldCat || r.predSev !== r.goldSev);
  console.log("\n" + "═".repeat(64));
  console.log(`PER-TICKET MISTAKES (${wrong.length})`);
  console.log("═".repeat(64));
  for (const r of wrong) {
    const cat = r.predCat === r.goldCat ? "✓" : `✗ ${r.goldCat}→${r.predCat}`;
    const sev = r.predSev === r.goldSev ? "✓" : `✗ ${r.goldSev}→${r.predSev}`;
    console.log(`  ${pad(r.id, 5)} cat ${pad(cat, 22)} sev ${sev}`);
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(64));
  console.log(`triaged ok: ${n}/${scored.length}` + (failed.length ? `  | FAILED: ${failed.length}` : ""));
  for (const r of failed) console.log(`  ✗ ${r.id}: ${r.failed}`);
  if (skipped.length) console.log(`unlabeled (skipped): ${skipped.map((t) => t.id).join(", ")}`);
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
