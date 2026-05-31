// Public entry point for the shared support-triage package.
// Apps should import from "@ninjamountain/triage", never reach into ./src/* directly.

export { triageTicket } from "./triage";
export { callTriageModel } from "./client";
export { extractJson } from "./parse";
export { validateTriage } from "./validate";

export type {
  Category,
  Severity,
  Ticket,
  TriageResult,
  TriageOutcome,
  ValidationResult,
  CallTriageModelOptions,
  TriageTicketOptions,
} from "./types";
