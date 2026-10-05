import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { ProviderName, RunFile, RunRow, RunSummary } from "../../src/index";
import { SYSTEM_PROMPT } from "../../src/prompt";
import { SEV_RANK } from "./dataset";

export type { RunFile, RunRow, RunSummary };

export const RUNS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../runs");

export function promptHash(): string {
  return createHash("sha256").update(SYSTEM_PROMPT).digest("hex").slice(0, 12);
}

export function makeRunId(provider: ProviderName, model: string, at = new Date()): string {
  const stamp = at.toISOString().replace(/[:.]/g, "-");
  return `${stamp}-${provider}-${model}`;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function summarizeRun(rows: RunRow[]): RunSummary {
  const ok = rows.filter((r) => r.ok);
  const n = ok.length;
  const ratio = (count: number) => (n === 0 ? 0 : count / n);
  const sevDiff = (r: (typeof ok)[number]) =>
    Math.abs(SEV_RANK[r.result.severity] - SEV_RANK[r.goldSev]);

  return {
    scored:       rows.length,
    ok:           n,
    failed:       rows.length - n,
    catAccuracy:  ratio(ok.filter((r) => r.result.category === r.goldCat).length),
    sevExact:     ratio(ok.filter((r) => r.result.severity === r.goldSev).length),
    sevWithin1:   ratio(ok.filter((r) => sevDiff(r) <= 1).length),
    sevMae:       ratio(ok.reduce((sum, r) => sum + sevDiff(r), 0)),
    inputTokens:  ok.reduce((sum, r) => sum + r.usage.inputTokens, 0),
    outputTokens: ok.reduce((sum, r) => sum + r.usage.outputTokens, 0),
    p50LatencyMs: median(ok.map((r) => r.latencyMs)),
  };
}

export function writeRunFile(run: RunFile): string {
  mkdirSync(RUNS_DIR, { recursive: true });
  const path = resolve(RUNS_DIR, `${run.runId}.json`);
  writeFileSync(path, JSON.stringify(run, null, 2) + "\n");
  return path;
}

export function loadRunFile(path: string): RunFile {
  return JSON.parse(readFileSync(path, "utf8")) as RunFile;
}