import type { Rule, RuleOutcome } from "../findings";
import type { Snapshot } from "../snapshot";
import { addressFlowMissing } from "./address-flow-missing";
import { conversationTriggerMissing } from "./conversation-trigger-missing";
import { draftStudioFlows } from "./draft-studio-flows";
import { flexFlowsOn2x } from "./flex-flows-on-2x";
import { ngrokTwimlApps } from "./ngrok-twiml-apps";
import { smsUrlProxy } from "./sms-url-proxy";

export const rules: Rule[] = [
  smsUrlProxy,
  flexFlowsOn2x,
  addressFlowMissing,
  conversationTriggerMissing,
  ngrokTwimlApps,
  draftStudioFlows,
];

export function runRules(snapshot: Snapshot): RuleOutcome[] {
  return rules.map((rule) => ({
    ruleId: rule.id,
    title: rule.title,
    result: rule.run(snapshot),
  }));
}
