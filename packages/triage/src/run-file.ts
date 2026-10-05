import type { Category, Severity, TriageResult } from "./types";
import type { ProviderName, Usage } from "./providers/types";

interface RunRowBase {
  id:      string;
  goldCat: Category;
  goldSev: Severity;
}

export type RunRow =
  | (RunRowBase & { ok: true;  result: TriageResult; attempts: number; usage: Usage; latencyMs: number })
  | (RunRowBase & { ok: false; reason: string; errors: string[] });

export interface RunSummary {
  scored:       number;
  ok:           number;
  failed:       number;
  catAccuracy:  number;
  sevExact:     number;
  sevWithin1:   number;
  sevMae:       number;
  inputTokens:  number;
  outputTokens: number;
  p50LatencyMs: number;
}

export interface RunFile {
  version:      1;
  runId:        string;
  createdAt:    string;
  provider:     ProviderName;
  model:        string;
  promptHash:   string;
  useRetrieval: boolean;
  split:        "dev" | "test" | "all";
  summary:      RunSummary;
  rows:         RunRow[];
}