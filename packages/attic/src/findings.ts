import type { Snapshot } from "./snapshot";

export type Severity = "critical" | "warning" | "info";

export interface Finding {
  ruleId: string;
  severity: Severity;
  title: string;
  resourceSid: string;
  detail: string;
  fix: string;
}

export type RuleResult =
  | { status: "ran"; findings: Finding[] }
  | { status: "skipped"; reason: string };

export interface Rule {
  id: string;
  title: string;
  run(snapshot: Snapshot): RuleResult;
}
