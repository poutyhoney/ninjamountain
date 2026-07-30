// ─── Domain types ─────────────────────────────────────────────────────────────
// Ported from support-triage-assistant/ts/types.ts

export type Category = "bug" | "config" | "billing" | "how_to" | "feature_request";
export type Severity = "low" | "medium" | "high" | "critical";

export interface Ticket {
  subject: string;
  body:    string;
}

export interface TriageResult {
  category:                     Category;
  severity:                     Severity;
  summary:                      string;
  suggested_first_response:     string;
  needs_engineering_escalation: boolean;
  // KB article ids (see kb/*.md) the model actually drew on for
  // suggested_first_response — empty array if none of the retrieved
  // articles were relevant. Added in v2 (RAG).
  kb_citations:                 string[];
}

// ─── Return types (discriminated unions) ──────────────────────────────────────

export type TriageOutcome =
  | { ok: true;  result: TriageResult; attempts: number }
  | { ok: false; reason: "api_failure" | "unparseable" | "invalid_schema"; lastErrors: string[] };

export type ValidationResult =
  | { valid: true;  value: TriageResult }
  | { valid: false; errors: string[] };

// ─── Option types ─────────────────────────────────────────────────────────────

export interface CallTriageModelOptions {
  maxAPIRetries?: number;
  // Pre-formatted KB article snippets to prepend to the prompt (see retrieve.ts).
  // Empty/omitted means "no retrieval" — the model still returns kb_citations: [].
  kbContext?: string;
}

export interface TriageTicketOptions {
  maxOutputRetries?: number;
  // Set false to skip KB retrieval entirely (used by scripts/rag-eval.ts to
  // compare with/without retrieval on the same tickets). Defaults to true.
  useRetrieval?: boolean;
}
