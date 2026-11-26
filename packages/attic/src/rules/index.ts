import type { Rule } from "../findings";
import { smsUrlProxy } from "./sms-url-proxy";
import { addressFlowMissing } from "./address-flow-missing";
import { flexFlowsOn2x } from "./flex-flows-on-2x";
import { conversationTriggerMissing } from "./conversation-trigger-missing";
import { draftStudioFlows } from "./draft-studio-flows";
import { ngrokTwimlApps } from "./ngrok-twiml-apps";

export const rules: Rule[] = [
  smsUrlProxy,
  flexFlowsOn2x,
  addressFlowMissing,
  conversationTriggerMissing,
  ngrokTwimlApps,
  draftStudioFlows,
];
