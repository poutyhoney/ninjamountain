import type { Ticket, CallTriageModelOptions } from "./types";
import { SYSTEM_PROMPT, buildUserContent } from "./prompt";
import { getProvider } from "./providers";

export async function callTriageModel(
  ticket: Ticket,
  { kbContext = "" }: CallTriageModelOptions = {}
): Promise<string> {
  const provider = getProvider();
  const completion = await provider.complete(SYSTEM_PROMPT, buildUserContent(ticket, kbContext));
  return completion.text;
}