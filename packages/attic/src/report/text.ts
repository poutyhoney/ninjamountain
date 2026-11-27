import type { Finding, RuleOutcome } from "../findings";
import { readUiVersion } from "../flex-version";
import type { Snapshot } from "../snapshot";
import { MANUAL_CHECKS, SEVERITIES, summarize } from "./summary";

const FOOTER = "Nothing was changed. Review each command before you run it.";

export function textReport(
  snapshot: Snapshot,
  outcomes: RuleOutcome[],
): string {
  const { findings, skipped, counts } = summarize(outcomes);
  const version = readUiVersion(snapshot);
  const lines = [
    `Legacy Flex audit: ${shortSid(snapshot.accountSid)} (${version === null ? "Flex UI version unknown" : `Flex UI ${version}`})`,
    `${counts.critical} critical, ${counts.warning} warning${counts.warning === 1 ? "" : "s"}, ${counts.info} info, ${skipped.length} skipped`,
  ];

  if (findings.length === 0 && skipped.length === 0)
    lines.push("", "No findings.");

  for (const severity of SEVERITIES) {
    const group = findings.filter((f) => f.severity === severity);
    if (group.length === 0) continue;
    lines.push("", severity.toUpperCase(), ...group.flatMap(formatFinding));
  }

  if (skipped.length > 0) {
    lines.push(
      "",
      "SKIPPED",
      ...skipped.map((s) => `  [${s.ruleId}] ${s.title}: ${s.reason}`),
    );
  }

  lines.push(
    "",
    "MANUAL CHECKS",
    ...MANUAL_CHECKS.map((check) => `  - ${check}`),
  );
  lines.push("", FOOTER);
  return lines.join("\n");
}

function formatFinding(finding: Finding): string[] {
  return [
    `  [${finding.ruleId}] ${finding.title}`,
    `       Why: ${finding.detail}`,
    `       Fix: ${finding.fix}`,
  ];
}

function shortSid(sid: string): string {
  return `${sid.slice(0, 2)}...${sid.slice(-4)}`;
}
