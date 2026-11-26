import type { Rule } from "../findings";
import { addressFlowMissing } from "./address-flow-missing";
import { draftStudioFlows } from "./draft-studio-flows";
import { ngrokTwimlApps } from "./ngrok-twiml-apps";

export const rules: Rule[] = [
  addressFlowMissing,
  ngrokTwimlApps,
  draftStudioFlows,
];
