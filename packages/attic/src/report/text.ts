// The default, human-readable report.
//
// Layout: a header with the account and Flex UI version, a count line, one
// section per severity (critical first), SKIPPED, MANUAL CHECKS, then a
// footer saying nothing was changed. A pure function that returns a string,
// so tests can check it without capturing the console. cli.ts prints it.
import type { Finding, RuleOutcome } from "../findings";
import { readUiVersion } from "../flex-version";
import type { Snapshot } from "../snapshot";
import { MANUAL_CHECKS, SEVERITIES, summarize } from "./summary";

// Always the last line. The tool never runs a fix itself, and says so.
const FOOTER = "Nothing was changed. Review each command before you run it.";

export function textReport(
  snapshot: Snapshot,
  outcomes: RuleOutcome[],
): string {
  const { findings, skipped, counts } = summarize(outcomes);
  const version = readUiVersion(snapshot);
  // Builds the report as an array of lines, joined once at the end. "" in the
  // array becomes a blank line between sections.
  const lines = [
    // A nested template literal picks the version text inside the header.
    `Legacy Flex audit: ${shortSid(snapshot.accountSid)} (${version === null ? "Flex UI version unknown" : `Flex UI ${version}`})`,
    // Only "warning" needs a plural. "critical" and "info" read fine either
    // way.
    `${counts.critical} critical, ${counts.warning} warning${counts.warning === 1 ? "" : "s"}, ${counts.info} info, ${skipped.length} skipped`,
  ];

  // Said outright, so an empty report can't be mistaken for a broken one.
  if (findings.length === 0 && skipped.length === 0)
    lines.push("", "No findings.");

  // Fixed severity order. Empty groups are left out.
  for (const severity of SEVERITIES) {
    const group = findings.filter((f) => f.severity === severity);
    if (group.length === 0) continue;
    // formatFinding returns three lines per finding, and flatMap joins them
    // into one list. The spread (...) pushes each line separately.
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

// The Why and Fix lines are indented to line up under the title text, past
// the "  [R1] " prefix.
function formatFinding(finding: Finding): string[] {
  return [
    `  [${finding.ruleId}] ${finding.title}`,
    `       Why: ${finding.detail}`,
    `       Fix: ${finding.fix}`,
  ];
}

// "AC" + "..." + the last 4 characters. Only the header is shortened. Fix
// commands keep full SIDs, because people paste those.
function shortSid(sid: string): string {
  return `${sid.slice(0, 2)}...${sid.slice(-4)}`;
}
