/**
 * Compare two saved runs (see scripts/lib/runs.ts) ticket by ticket.
 *
 *   npm run compare -- runs/<a>.json runs/<b>.json
 */
import { loadRunFile, type RunFile, type RunRow } from "./lib/runs";

function pad(s: string, width: number): string {
  return s.length >= width ? s : s + " ".repeat(width - s.length);
}

function label(run: RunFile): string {
  return `${run.provider}:${run.model}`;
}

function catRight(row: RunRow | undefined): boolean {
  return !!row && row.ok && row.result.category === row.goldCat;
}

function verdict(row: RunRow | undefined): string {
  if (!row) return "(missing)";
  if (!row.ok) return `FAILED (${row.reason})`;
  const cat = row.result.category === row.goldCat ? "✓" : "✗";
  const sev = row.result.severity === row.goldSev ? "✓" : "✗";
  return `${row.result.category}/${row.result.severity} ${cat}${sev}`;
}

function main(): void {
  const [pathA, pathB] = process.argv.slice(2);
  if (!pathA || !pathB) {
    console.error("usage: npm run compare -- runs/<a>.json runs/<b>.json");
    process.exit(1);
  }

  const a = loadRunFile(pathA);
  const b = loadRunFile(pathB);
  const labelA = label(a);
  const labelB = label(b);
  const colWidth = Math.max(labelA.length, labelB.length, 28) + 2;

  if (a.promptHash !== b.promptHash) {
    console.warn(`⚠ prompts differ (${a.promptHash} vs ${b.promptHash}): this compares prompts as well as models`);
  }
  if (a.split !== b.split) {
    console.warn(`⚠ splits differ (${a.split} vs ${b.split}): only shared tickets are compared`);
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  const percent = (x: number) => `${Math.round(x * 100)}%`;
  const metrics: [string, string, string][] = [
    ["category accuracy", percent(a.summary.catAccuracy), percent(b.summary.catAccuracy)],
    ["severity exact",    percent(a.summary.sevExact),    percent(b.summary.sevExact)],
    ["severity MAE",      a.summary.sevMae.toFixed(2),    b.summary.sevMae.toFixed(2)],
    ["failed",            String(a.summary.failed),       String(b.summary.failed)],
    ["tokens in/out",
      `${a.summary.inputTokens}/${a.summary.outputTokens}`,
      `${b.summary.inputTokens}/${b.summary.outputTokens}`],
    ["median latency",
      `${(a.summary.p50LatencyMs / 1000).toFixed(1)}s`,
      `${(b.summary.p50LatencyMs / 1000).toFixed(1)}s`],
  ];

  console.log("\n" + pad("", 20) + pad(labelA, colWidth) + labelB);
  for (const [name, va, vb] of metrics) console.log(pad(name, 20) + pad(va, colWidth) + vb);

  // ── Category agreement ──────────────────────────────────────────────────────
  const rowsB = new Map(b.rows.map((r) => [r.id, r]));
  const shared = a.rows.filter((r) => rowsB.has(r.id));

  const buckets: Record<"both" | "onlyA" | "onlyB" | "neither", string[]> = {
    both: [], onlyA: [], onlyB: [], neither: [],
  };
  for (const ra of shared) {
    const rb = rowsB.get(ra.id);
    const key = catRight(ra) ? (catRight(rb) ? "both" : "onlyA") : (catRight(rb) ? "onlyB" : "neither");
    buckets[key].push(ra.id);
  }

  console.log(`\nCATEGORY on ${shared.length} shared tickets`);
  const bucketLines: [string, string[]][] = [
    ["both right",     buckets.both],
    [`only ${labelA}`, buckets.onlyA],
    [`only ${labelB}`, buckets.onlyB],
    ["both wrong",     buckets.neither],
  ];
  const nameWidth = Math.max(...bucketLines.map(([name]) => name.length)) + 2;
  for (const [name, ids] of bucketLines) {
    console.log(`  ${pad(name, nameWidth)}${pad(String(ids.length), 4)}${ids.join(" ")}`);
  }

  // ── Per-ticket disagreements ────────────────────────────────────────────────
  console.log(`\nDISAGREEMENTS (category or severity differ)`);
  console.log(`  ${pad("id", 6)}${pad("gold", 22)}${pad(labelA, colWidth)}${labelB}`);
  for (const ra of shared) {
    const rb = rowsB.get(ra.id);
    const same =
      ra.ok && rb?.ok &&
      ra.result.category === rb.result.category &&
      ra.result.severity === rb.result.severity;
    if (same) continue;
    console.log(`  ${pad(ra.id, 6)}${pad(`${ra.goldCat}/${ra.goldSev}`, 22)}${pad(verdict(ra), colWidth)}${verdict(rb)}`);
  }
  console.log();
}

main();