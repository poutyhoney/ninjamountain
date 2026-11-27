// The JSON report, for `scan --format json`.
//
// For CI jobs, scripts (pipe it to jq), or attaching to a support ticket.
// Same data as the text report, through the same summarize() in summary.ts.
// cli.ts calls JSON.stringify on the result. This file only builds the object.
import type { Finding, RuleOutcome } from "../findings";
import { readUiVersion } from "../flex-version";
import type { Snapshot } from "../snapshot";
import type { Skipped } from "./summary";
import { MANUAL_CHECKS, summarize } from "./summary";

// The output shape is spelled out as an interface. Scripts that read this
// JSON depend on it, so a change here is a breaking change for them.
export interface JsonReport {
  // Lets a script that reads the output detect a future breaking change,
  // the same idea as the snapshot's schemaVersion.
  schemaVersion: 1;
  // The full SID, so the output is useful on a ticket. Combine with --redact
  // for a file you'll share.
  accountSid: string;
  collectedAt: string;
  flexUiVersion: string | null;
  summary: { critical: number; warning: number; info: number; skipped: number };
  findings: Finding[];
  skipped: Skipped[];
  manualChecks: string[];
}

// Returns an object, not a string. Tests can check fields directly, and only
// the CLI decides how to print it.
export function jsonReport(
  snapshot: Snapshot,
  outcomes: RuleOutcome[],
): JsonReport {
  const { findings, skipped, counts } = summarize(outcomes);
  return {
    schemaVersion: 1,
    accountSid: snapshot.accountSid,
    collectedAt: snapshot.collectedAt,
    flexUiVersion: readUiVersion(snapshot),
    // Spread the three severity counts, then add the skipped count alongside.
    summary: { ...counts, skipped: skipped.length },
    findings,
    skipped,
    manualChecks: MANUAL_CHECKS,
  };
}
