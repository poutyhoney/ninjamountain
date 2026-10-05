// Anthropic adapter: wraps the Anthropic SDK in the TriageProvider contract
// (see types.ts). Everything Anthropic-specific lives here: the request shape,
// which errors are worth retrying, and where usage numbers come from.
import Anthropic, { APIError } from "@anthropic-ai/sdk";
import type { Completion, TriageProvider } from "./types";
import { withRetry } from "../retry";

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";

// Passed into withRetry (dependency injection): the shared retry loop knows
// nothing about Anthropic, so this function teaches it which failures are
// transient. 429 = rate limited, 529 = Anthropic-specific "overloaded",
// 5xx = server error. Anything else (400 bad request, 401 bad key) will fail
// the same way every time, so retrying only wastes calls.
function isRetryable(err: unknown): boolean {
  if (!(err instanceof APIError)) return false;
  const status = err.status ?? 0;
  return status === 429 || status === 529 || status >= 500;
}

// Factory function: returns an object literal that satisfies TriageProvider.
// `client` and `model` are captured in the closure, so the returned object can
// use them without a class. The SDK client is created here, on demand, not at
// module import, so importing the package (e.g. during `next build`) never
// constructs an API client.
export function createAnthropicProvider(model = DEFAULT_ANTHROPIC_MODEL): TriageProvider {
  const client = new Anthropic();

  return {
    name: "anthropic",
    model,
    async complete(system: string, user: string): Promise<Completion> {
      return withRetry(
        async () => {
          // Timed inside the retried function, so latencyMs measures the
          // successful attempt only, not the backoff waits before it.
          const start = Date.now();
          const message = await client.messages.create({
            model,
            max_tokens:  1024,
            // Deterministic output so eval scores reflect prompt changes, not
            // sampling noise. (OpenAI's gpt-5.5 rejects this; see openai.ts.)
            temperature: 0,
            // Anthropic takes the system prompt as a top-level field, not as
            // a message. Hiding differences like this is the adapter's job.
            system,
            messages:    [{ role: "user", content: user }],
          });

          // content is an array of typed blocks. Narrow to a text block
          // before reading .text (discriminated union on block.type).
          const block = message.content[0];
          if (block.type !== "text") {
            throw new Error(`unexpected content block type "${block.type}"`);
          }

          // Map the SDK's snake_case usage fields onto the shared Usage shape.
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
