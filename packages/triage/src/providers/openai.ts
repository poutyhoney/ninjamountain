// OpenAI adapter: the same TriageProvider contract as anthropic.ts, backed by
// the OpenAI SDK's Chat Completions API. Comparing the two files side by side
// shows exactly where the vendors differ.
import OpenAI, { APIError } from "openai";
import type { Completion, TriageProvider } from "./types";
import { withRetry } from "../retry";

// Overridable from .env without a code change, so trying another OpenAI model
// is a config edit.
export const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.5";

// Same idea as anthropic.ts, minus 529 (that status code is Anthropic's).
// A 400 like "Unsupported value: 'temperature'" is not retryable, which is why
// the first OpenAI run failed after 1 attempt instead of 3.
function isRetryable(err: unknown): boolean {
  if (!(err instanceof APIError)) return false;
  const status = err.status ?? 0;
  return status === 429 || status >= 500;
}

export function createOpenAIProvider(model = DEFAULT_OPENAI_MODEL): TriageProvider {
  const client = new OpenAI();

  return {
    name: "openai",
    model,
    async complete(system: string, user: string): Promise<Completion> {
      return withRetry(
        async () => {
          const start = Date.now();
          // No `temperature` here on purpose: gpt-5.5 is a reasoning model and
          // only accepts the default (1). So OpenAI runs are nondeterministic,
          // a caveat that belongs in any comparison with Claude.
          const response = await client.chat.completions.create({
            model,
            // Larger than Anthropic's 1024 because reasoning tokens spend the
            // same budget. Too small and the model runs out before writing
            // any visible text (finish_reason "length", empty content).
            max_completion_tokens: 4096,
            // OpenAI takes the system prompt as the first message, unlike
            // Anthropic's top-level `system` field.
            messages: [
              { role: "system", content: system },
              { role: "user",   content: user },
            ],
          });

          // content can be null (refusal, or the token budget ran out).
          // Optional chaining (?.) guards each step. The thrown Error is not
          // an APIError, so isRetryable says no and it fails fast.
          const text = response.choices[0]?.message?.content;
          if (!text) {
            const reason = response.choices[0]?.finish_reason ?? "no choices";
            throw new Error(`empty response (finish_reason: ${reason})`);
          }

          // usage is optional in the SDK types, hence the ?? 0 fallbacks.
          return {
            text,
            usage: {
              inputTokens:  response.usage?.prompt_tokens ?? 0,
              outputTokens: response.usage?.completion_tokens ?? 0,
            },
            latencyMs: Date.now() - start,
          };
        },
        { label: "openai", isRetryable }
      );
    },
  };
}
