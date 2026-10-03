import Anthropic, { APIError } from "@anthropic-ai/sdk";
import type { Ticket, CallTriageModelOptions } from "./types";
import { SYSTEM_PROMPT, buildUserContent } from "./prompt";

const client = new Anthropic();
const MODEL  = "claude-sonnet-4-6";

export async function callTriageModel(
  ticket: Ticket,
  { maxAPIRetries = 3, kbContext = "" }: CallTriageModelOptions = {}
): Promise<string> {
  let lastError: APIError | undefined;

  const userContent = buildUserContent(ticket, kbContext);

  for (let attempt = 1; attempt <= maxAPIRetries; attempt++) {
    try {
      const message = await client.messages.create({
        model:       MODEL,
        max_tokens:  1024,
        temperature: 0,
        system:      SYSTEM_PROMPT,
        messages:   [
          {
            role:    "user",
            content: userContent,
          },
        ],
      });

      const block = message.content[0];
      if (block.type !== "text") {
        throw new Error(`callTriageModel: unexpected content block type "${block.type}"`);
      }
      return block.text;

    } catch (err) {
      if (err instanceof APIError) {
        lastError = err;
        const retryable = err.status === 429 || err.status === 529 || (err.status ?? 0) >= 500;

        if (!retryable || attempt === maxAPIRetries) {
          throw new Error(
            `callTriageModel: API call failed after ${attempt} attempt(s): ${err.message}`
          );
        }
        const backoffMs = 1000 * 2 ** (attempt - 1);
        console.warn(`API error (status ${err.status}), retry ${attempt}/${maxAPIRetries} in ${backoffMs}ms`);
        await new Promise((r) => setTimeout(r, backoffMs));
      } else {
        throw err;
      }
    }
  }

  throw lastError ?? new Error("callTriageModel: exhausted retries");
}