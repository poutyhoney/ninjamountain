import type { Rule } from "../findings";
import { draftStudioFlows } from "./draft-studio-flows";
import { ngrokTwimlApps } from "./ngrok-twiml-apps";

export const rules: Rule[] = [ngrokTwimlApps, draftStudioFlows];
