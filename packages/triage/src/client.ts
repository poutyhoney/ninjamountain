import type { Ticket, CallTriageModelOptions, ModelCall } from "./types";
import { SYSTEM_PROMPT, buildUserContent } from "./prompt";
import { getProvider } from "./providers";

export async function callTriageModel(
  ticket: Ticket,
  { kbContext = "", provider, model }: CallTriageModelOptions = {}
): Promise<ModelCall> {
  const llm = getProvider(provider, model);
  const completion = await llm.complete(SYSTEM_PROMPT, buildUserContent(ticket, kbContext));
  return { ...completion, provider: llm.name, model: llm.model };
}