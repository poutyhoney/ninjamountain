import type { Finding, RuleOutcome, Severity } from "../findings";
import type { Snapshot } from "../snapshot";

const SEVERITIES: Severity[] = ["critical", "warning", "info"];
const FOOTER = "Nothing was changed. Review each command before you run it.";

export function textReport(
  snapshot: Snapshot,
  outcomes: RuleOutcome[],
): string {
  const findings = outcomes.flatMap((o) =>
    o.result.status === "ran" ? o.result.findings : [],
  );
  const skipped = outcomes.flatMap((o) =>
    o.result.status === "skipped"
      ? [{ ruleId: o.ruleId, title: o.title, reason: o.result.reason }]
      : [],
  );

  const count = (severity: Severity) =>
    findings.filter((f) => f.severity === severity).length;
  const warnings = count("warning");
  const lines = [
    `Legacy Flex audit: ${shortSid(snapshot.accountSid)} (${flexVersion(snapshot)})`,
    `${count("critical")} critical, ${warnings} warning${warnings === 1 ? "" : "s"}, ${count("info")} info, ${skipped.length} skipped`,
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

function flexVersion(snapshot: Snapshot): string {
  const config = snapshot.flexConfiguration;
  if (!config.available || config.data.uiVersion === null)
    return "Flex UI version unknown";
  return `Flex UI ${config.data.uiVersion}`;
}
