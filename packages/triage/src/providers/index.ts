import type { ProviderName, TriageProvider } from "./types";
import { createAnthropicProvider } from "./anthropic";
import { createOpenAIProvider } from "./openai";

export type { ProviderName, TriageProvider, Usage, Completion } from "./types";

function parseProviderName(value: string | undefined): ProviderName | undefined {
  if (value === undefined || value === "") return undefined;
  if (value === "anthropic" || value === "openai") return value;
  throw new Error(`Unknown provider "${value}". Use "anthropic" or "openai".`);
}

export function getProvider(name?: ProviderName, model?: string): TriageProvider {
  const chosen = name ?? parseProviderName(process.env.TRIAGE_PROVIDER) ?? "anthropic";

  switch (chosen) {
    case "anthropic":
      return createAnthropicProvider(model);
    case "openai":
      return createOpenAIProvider(model);
  }
}