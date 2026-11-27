import type { Finding, RuleOutcome, Severity } from "../findings";

export const SEVERITIES: Severity[] = ["critical", "warning", "info"];

export interface Skipped {
  ruleId: string;
  title: string;
  reason: string;
}

export interface Summary {
  findings: Finding[];
  skipped: Skipped[];
  counts: Record<Severity, number>;
}

export function summarize(outcomes: RuleOutcome[]): Summary {
  const findings = outcomes.flatMap((o) =>
    o.result.status === "ran" ? o.result.findings : [],
  );
  const skipped = outcomes.flatMap((o) =>
    o.result.status === "skipped"
      ? [{ ruleId: o.ruleId, title: o.title, reason: o.result.reason }]
      : [],
  );
  const counts: Record<Severity, number> = { critical: 0, warning: 0, info: 0 };
  for (const finding of findings) counts[finding.severity] += 1;
  return { findings, skipped, counts };
}

export function isSeverity(value: string): value is Severity {
  return (SEVERITIES as string[]).includes(value);
}

export function meetsThreshold(
  findings: Finding[],
  threshold: Severity,
): boolean {
  const limit = SEVERITIES.indexOf(threshold);
  return findings.some(
    (finding) => SEVERITIES.indexOf(finding.severity) <= limit,
  );
}
