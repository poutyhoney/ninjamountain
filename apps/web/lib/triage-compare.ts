import type { Category, ProviderName, RunFile, RunSummary, Severity } from "@ninjamountain/triage";

import { when } from "./format";

export interface CompareRow {
  id:      string;
  goldCat: Category;
  goldSev: Severity;
  cat:     Category | null;
  sev:     Severity | null;
}

export interface CompareRun {
  runId:      string;
  createdAt:  string;
  provider:   ProviderName;
  model:      string;
  split:      RunFile["split"];
  promptHash: string;
  summary:    RunSummary;
  rows:       CompareRow[];
}

export function toCompareRun(run: RunFile): CompareRun {
  return {
    runId:      run.runId,
    createdAt:  run.createdAt,
    provider:   run.provider,
    model:      run.model,
    split:      run.split,
    promptHash: run.promptHash,
    summary:    run.summary,
    rows: run.rows.map((r) => ({
      id:      r.id,
      goldCat: r.goldCat,
      goldSev: r.goldSev,
      cat:     r.ok ? r.result.category : null,
      sev:     r.ok ? r.result.severity : null,
    })),
  };
}

export function runLabel(run: CompareRun): string {
  return `${run.provider} · ${run.model} · ${when(run.createdAt)}`;
}