// Saved scoring runs: helpers to name, summarize, write, and read the JSON
// files in packages/triage/runs/.
//
// score.ts writes one file per run; compare.ts reads two; the apps/web
// dashboard reads them all at build time. The file *shape* (RunFile and
// friends) lives in src/run-file.ts so apps/web can import the types. The
// file-system code stays here in scripts/, because src/ must not touch disk.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { ProviderName, RunFile, RunRow, RunSummary } from "../../src/index";
import { SYSTEM_PROMPT } from "../../src/prompt";
import { SEV_RANK } from "./dataset";

// Re-exported so score.ts and compare.ts keep importing types from
// "./lib/runs" after the types moved into src/ (move code without breaking
// its importers).
export type { RunFile, RunRow, RunSummary };

// import.meta.url is this file's location on disk, so the path works no matter
// which directory the script is run from.
export const RUNS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../runs");

// A fingerprint of the system prompt: first 12 hex chars of its SHA-256 hash.
// Change one character of the prompt and the hash changes. compare.ts and the
// dashboard use it to warn when two runs used different prompts, so a prompt
// change is never mistaken for a model difference. Same idea as a git hash.
export function promptHash(): string {
  return createHash("sha256").update(SYSTEM_PROMPT).digest("hex").slice(0, 12);
}

// e.g. "2026-10-04T17-20-37-316Z-anthropic-claude-sonnet-4-6". ISO timestamps
// sort correctly as plain strings, so `ls runs/` lists runs in time order.
// ":" and "." are swapped for "-" to keep the id safe as a file name.
export function makeRunId(provider: ProviderName, model: string, at = new Date()): string {
  const stamp = at.toISOString().replace(/[:.]/g, "-");
  return `${stamp}-${provider}-${model}`;
}

// Median rather than mean for latency: one slow outlier (a retry, a long
// reasoning pass) would drag a mean up, while the median shows a typical call.
// [...values] copies first, because .sort() mutates the array in place.
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// The headline numbers for a run. Pure function (rows in, numbers out, no
// I/O), so the console report and the saved file read the same object and
// can never disagree. Rates are fractions 0..1, formatted by whoever displays
// them.
export function summarizeRun(rows: RunRow[]): RunSummary {
  // Type narrowing through filter: RunRow is a discriminated union on `ok`,
  // so after this filter TypeScript knows every row has `result` and `usage`
  // (TS 5.5+ infers the type predicate). No `!` assertions needed.
  const ok = rows.filter((r) => r.ok);
  const n = ok.length;
  // Divide-by-zero guard: a run where every ticket failed reports 0, not NaN.
  const ratio = (count: number) => (n === 0 ? 0 : count / n);
  // Severity is ordinal (low < medium < high < critical), so "how far off"
  // is the distance between ranks. (typeof ok)[number] = "one element of ok".
  const sevDiff = (r: (typeof ok)[number]) =>
    Math.abs(SEV_RANK[r.result.severity] - SEV_RANK[r.goldSev]);

  return {
    scored:       rows.length,
    ok:           n,
    failed:       rows.length - n,
    catAccuracy:  ratio(ok.filter((r) => r.result.category === r.goldCat).length),
    sevExact:     ratio(ok.filter((r) => r.result.severity === r.goldSev).length),
    sevWithin1:   ratio(ok.filter((r) => sevDiff(r) <= 1).length),
    // Mean absolute error = total distance / count, so ratio() works here too.
    sevMae:       ratio(ok.reduce((sum, r) => sum + sevDiff(r), 0)),
    // Totals only include successful rows; failed rows carry no usage.
    inputTokens:  ok.reduce((sum, r) => sum + r.usage.inputTokens, 0),
    outputTokens: ok.reduce((sum, r) => sum + r.usage.outputTokens, 0),
    p50LatencyMs: median(ok.map((r) => r.latencyMs)),
  };
}

// Pretty-printed (2-space indent) so run files diff readably in git and PRs.
// Returns the path so score.ts can print where the run was saved.
export function writeRunFile(run: RunFile): string {
  mkdirSync(RUNS_DIR, { recursive: true });
  const path = resolve(RUNS_DIR, `${run.runId}.json`);
  writeFileSync(path, JSON.stringify(run, null, 2) + "\n");
  return path;
}

// `as RunFile` is a trust decision: JSON.parse returns `any`, and we trust
// these files because score.ts wrote them. Data from users or other systems
// would get runtime validation instead (like validate.ts does for model output).
export function loadRunFile(path: string): RunFile {
  return JSON.parse(readFileSync(path, "utf8")) as RunFile;
}