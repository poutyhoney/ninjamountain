import Anthropic, { APIError } from "@anthropic-ai/sdk";
import type { Completion, TriageProvider } from "./types";
import { withRetry } from "../retry";

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";

function isRetryable(err: unknown): boolean {
  if (!(err instanceof APIError)) return false;
  const status = err.status ?? 0;
  return status === 429 || status === 529 || status >= 500;
}

export function createAnthropicProvider(model = DEFAULT_ANTHROPIC_MODEL): TriageProvider {
  const client = new Anthropic();

  return {
    name: "anthropic",
    model,
    async complete(system: string, user: string): Promise<Completion> {
      return withRetry(
        async () => {
          const start = Date.now();
          const message = await client.messages.create({
            model,
            max_tokens:  1024,
            temperature: 0,
            system,
            messages:    [{ role: "user", content: user }],
          });

          const block = message.content[0];
          if (block.type !== "text") {
            throw new Error(`unexpected content block type "${block.type}"`);
          }

          return {
            text:      block.text,
            usage:     {
              inputTokens:  message.usage.input_tokens,
              outputTokens: message.usage.output_tokens,
            },
            latencyMs: Date.now() - start,
          };
        },
        { label: "anthropic", isRetryable }
      );
    },
  };
}