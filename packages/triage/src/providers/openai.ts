import OpenAI, { APIError } from "openai";
import type { Completion, TriageProvider } from "./types";
import { withRetry } from "../retry";

export const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.5";

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
          const response = await client.chat.completions.create({
            model,
            max_completion_tokens: 4096,
            messages: [
              { role: "system", content: system },
              { role: "user",   content: user },
            ],
          });

          const text = response.choices[0]?.message?.content;
          if (!text) {
            const reason = response.choices[0]?.finish_reason ?? "no choices";
            throw new Error(`empty response (finish_reason: ${reason})`);
          }

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