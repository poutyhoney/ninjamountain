// The rule registry: the one place that lists every rule.
//
// cli.ts, the report tests, and test/scenarios.test.ts all go through
// runRules(), so a rule missing from this array would be missed everywhere,
// and the scenario test would catch it. Adding a rule means writing its file
// in this folder and adding it here. Nothing in src/report/ changes.
import type { Rule, RuleOutcome } from "../findings";
import type { Snapshot } from "../snapshot";
import { addressFlowMissing } from "./address-flow-missing";
import { conversationTriggerMissing } from "./conversation-trigger-missing";
import { draftStudioFlows } from "./draft-studio-flows";
import { flexFlowsOn2x } from "./flex-flows-on-2x";
import { ngrokTwimlApps } from "./ngrok-twiml-apps";
import { smsUrlProxy } from "./sms-url-proxy";

// In rule ID order (R1, R2, R3, R4, R7, R10). Within each severity group,
// the reports list findings in this order.
export const rules: Rule[] = [
  smsUrlProxy,
  flexFlowsOn2x,
  addressFlowMissing,
  conversationTriggerMissing,
  ngrokTwimlApps,
  draftStudioFlows,
];

// Runs every rule against one snapshot. Each rule gets the same snapshot and
// none of them change it, so the order doesn't affect results.
export function runRules(snapshot: Snapshot): RuleOutcome[] {
  // Parentheses around the object literal: without them, the braces would be
  // read as a function body instead of a returned object.
  return rules.map((rule) => ({
    ruleId: rule.id,
    title: rule.title,
    result: rule.run(snapshot),
  }));
}
