// Shared logic for both report formats.
//
// text.ts and json.ts both call summarize(), so the counts in a text report
// and a JSON report for the same scan always agree. cli.ts uses isSeverity()
// to check the --fail-on value and meetsThreshold() to pick the exit code.
import type { Finding, RuleOutcome, Severity } from "../findings";

// Most serious first. Used for report section order and as a ranking: a
// lower index means more serious.
export const SEVERITIES: Severity[] = ["critical", "warning", "info"];

// Checks no key this tool supports can do. Standard and Restricted keys get
// error 70004 on /Accounts and /Keys, so the report asks for them to be done
// by hand until a --main-key mode exists (R11 in PLAN.md).
export const MANUAL_CHECKS = [
  "API keys: this tool can't list them (error 70004). In the Console, open API keys & tokens and delete keys you don't recognize.",
  "Subaccounts: this tool can't list them either. In the Console, look for suspended or closed subaccounts you no longer need.",
];

export interface Skipped {
  ruleId: string;
  title: string;
  reason: string;
}

export interface Summary {
  findings: Finding[];
  skipped: Skipped[];
  // Record<Severity, number> requires a key for every severity. If a fourth
  // level is ever added, the counts literal below stops compiling until it's
  // handled.
  counts: Record<Severity, number>;
}

// Splits rule outcomes into all findings and all skipped rules.
export function summarize(outcomes: RuleOutcome[]): Summary {
  // flatMap filters and unwraps in one pass: return [] to drop an outcome,
  // or an array to add its items. Checking o.result.status narrows o.result
  // inside the same expression, so .findings and .reason typecheck.
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

// A type predicate that turns a raw CLI string into a Severity.
export function isSeverity(value: string): value is Severity {
  // The cast widens the array to string[]. .includes on a Severity[] won't
  // accept a plain string argument.
  return (SEVERITIES as string[]).includes(value);
}

// True if any finding is at the threshold or more serious. Array position is
// the rank, so --fail-on warning also fails on critical (index 0 <= 1).
export function meetsThreshold(
  findings: Finding[],
  threshold: Severity,
): boolean {
  const limit = SEVERITIES.indexOf(threshold);
  return findings.some(
    (finding) => SEVERITIES.indexOf(finding.severity) <= limit,
  );
}
