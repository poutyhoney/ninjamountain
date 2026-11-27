import type { Finding, RuleOutcome } from "../findings";
import { readUiVersion } from "../flex-version";
import type { Snapshot } from "../snapshot";
import type { Skipped } from "./summary";
import { summarize } from "./summary";

export interface JsonReport {
  schemaVersion: 1;
  accountSid: string;
  collectedAt: string;
  flexUiVersion: string | null;
  summary: { critical: number; warning: number; info: number; skipped: number };
  findings: Finding[];
  skipped: Skipped[];
}

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
    summary: { ...counts, skipped: skipped.length },
    findings,
    skipped,
  };
}
