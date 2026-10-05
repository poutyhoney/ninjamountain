// Public entry point for the shared support-triage package.
// Apps should import from "@ninjamountain/triage", never reach into ./src/* directly.

export { triageTicket } from "./triage";
export { callTriageModel } from "./client";
export { extractJson } from "./parse";
export { validateTriage } from "./validate";
export { retrievalQuery, retrieveRelevantArticles } from "./retrieve";
export { runTriageAgent } from "./agent";
export { getProvider } from "./providers";

export type {
  Category,
  Severity,
  Ticket,
  TriageResult,
  TriageOutcome,
  ValidationResult,
  CallTriageModelOptions,
  TriageTicketOptions,
  AgentOutcome,
  ToolCallLogEntry,
  ModelCall,
} from "./types";
export type { EmbedQuery, KbMatch } from "./retrieve";
export type { ProviderName, Usage } from "./providers";
export type { RunFile, RunRow, RunSummary } from "./run-file";