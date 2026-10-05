// Provider selection: the one place that maps a provider name to an adapter.
// Callers (client.ts, the CLI scripts) ask for a TriageProvider and never
// import an SDK directly.
import type { ProviderName, TriageProvider } from "./types";
import { createAnthropicProvider } from "./anthropic";
import { createOpenAIProvider } from "./openai";

// Re-exported so the rest of the package can import from "./providers".
export type { ProviderName, TriageProvider, Usage, Completion } from "./types";

// Runtime validation at a trust boundary: an env var is just a string, so a
// cast (`as ProviderName`) would hide a typo like "opneai" until something
// failed far away. The === checks narrow `value` from string to the union.
function parseProviderName(value: string | undefined): ProviderName | undefined {
  if (value === undefined || value === "") return undefined;
  if (value === "anthropic" || value === "openai") return value;
  throw new Error(`Unknown provider "${value}". Use "anthropic" or "openai".`);
}

// Precedence: explicit argument (e.g. a --provider flag), then the
// TRIAGE_PROVIDER env var, then the default. The default stays Anthropic so
// apps/web keeps its original behavior without passing anything.
export function getProvider(name?: ProviderName, model?: string): TriageProvider {
  const chosen = name ?? parseProviderName(process.env.TRIAGE_PROVIDER) ?? "anthropic";

  // Exhaustive switch: every ProviderName has a case, so there is no default
  // branch. Add a name to ProviderName without a case here and typecheck fails
  // ("not all code paths return a value").
  switch (chosen) {
    case "anthropic":
      return createAnthropicProvider(model);
    case "openai":
      return createOpenAIProvider(model);
  }
}
