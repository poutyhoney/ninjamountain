import type { Category, Severity, TriageResult, ValidationResult } from "./types";

const VALID_CATEGORIES: readonly Category[] = [
  "bug", "config", "billing", "how_to", "feature_request",
];
const VALID_SEVERITIES: readonly Severity[] = [
  "low", "medium", "high", "critical",
];

/**
 * Validates an unknown parsed value against the TriageResult contract.
 * Returns a discriminated union — does NOT throw.
 * The caller decides whether to retry or escalate.
 *
 * Ported from support-triage-assistant/ts/validate.ts
 */
export function validateTriage(obj: unknown): ValidationResult {
  if (typeof obj !== "object" || obj === null) {
    return { valid: false, errors: ["result is not an object"] };
  }

  // Cast to a loose record so we can inspect fields without type errors.
  // We validate every field before trusting the shape.
  const record = obj as Record<string, unknown>;
  const errors: string[] = [];

  if (!VALID_CATEGORIES.includes(record.category as Category)) {
    errors.push(
      `category: expected one of ${VALID_CATEGORIES.join("|")}, got ${JSON.stringify(record.category)}`
    );
  }

  if (!VALID_SEVERITIES.includes(record.severity as Severity)) {
    errors.push(
      `severity: expected one of ${VALID_SEVERITIES.join("|")}, got ${JSON.stringify(record.severity)}`
    );
  }

  if (typeof record.summary !== "string" || record.summary.trim() === "") {
    errors.push("summary: expected non-empty string");
  }

  if (
    typeof record.suggested_first_response !== "string" ||
    record.suggested_first_response.trim() === ""
  ) {
    errors.push("suggested_first_response: expected non-empty string");
  }

  if (typeof record.needs_engineering_escalation !== "boolean") {
    errors.push(
      `needs_engineering_escalation: expected boolean, got ${typeof record.needs_engineering_escalation}`
    );
  }

  if (
    !Array.isArray(record.kb_citations) ||
    !record.kb_citations.every((c) => typeof c === "string")
  ) {
    errors.push(
      `kb_citations: expected string[], got ${JSON.stringify(record.kb_citations)}`
    );
  }

  return errors.length === 0
    ? { valid: true, value: obj as TriageResult }
    : { valid: false, errors };
}
