// The contract between rules and reports.
//
// Every file in src/rules/ exports a Rule. runRules() in rules/index.ts turns
// each one into a RuleOutcome, and the files in src/report/ turn those into
// text or JSON. Rules and reports never import each other, only these types,
// so a new rule shows up in every report format without any report changes.
import type { Snapshot } from "./snapshot";

// A union of string literals. Order matters elsewhere: SEVERITIES in
// report/summary.ts lists them from most to least serious.
export type Severity = "critical" | "warning" | "info";

export interface Finding {
  // Which rule produced it, such as "R3".
  ruleId: string;
  severity: Severity;
  // One line for the report heading.
  title: string;
  // The SID of the thing to fix. With a real snapshot this is the real SID,
  // so the fix command can be copied as is.
  resourceSid: string;
  // Plain-language reason it matters.
  detail: string;
  // A command or Console step. The tool prints it and never runs it.
  fix: string;
}

// A discriminated union on status. "skipped" means the rule couldn't run
// because data was unavailable, which is a different answer from "ran and
// found nothing". Reports show the two differently.
export type RuleResult =
  | { status: "ran"; findings: Finding[] }
  | { status: "skipped"; reason: string };

export interface Rule {
  id: string;
  title: string;
  // A pure function: it reads the snapshot and returns a result, with no
  // network calls and no changes to its input. That's why every rule can be
  // tested offline against fixtures.
  run(snapshot: Snapshot): RuleResult;
}

// A rule's result with its id and title attached. A skipped result has no
// findings to carry those, and the report still needs to say what was
// skipped.
export interface RuleOutcome {
  ruleId: string;
  title: string;
  result: RuleResult;
}
