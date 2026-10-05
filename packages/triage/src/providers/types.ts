// The provider contract: the one shape every model backend must fit.
//
// triage.ts and client.ts depend only on these types, never on a vendor SDK.
// Each SDK lives behind its own adapter (anthropic.ts, openai.ts), and
// getProvider() in index.ts picks one. This is the adapter / strategy pattern:
// adding a provider means writing one new adapter, not touching the pipeline.

// A union of string literal types. Used as a key in Record<ProviderName, ...>
// tables and exhaustive switches, so adding a name here makes the compiler
// point at every place that needs a matching case.
export type ProviderName = "anthropic" | "openai";

// Token counts as reported by each provider. Not comparable across providers:
// each one uses its own tokenizer, and OpenAI's outputTokens include hidden
// reasoning tokens that never appear in the text.
export interface Usage {
	inputTokens: number;
	outputTokens: number;
}

// What one model call returns. usage and latencyMs ride along with the text so
// score.ts can record cost and speed per ticket.
export interface Completion {
	text: string;
	usage: Usage;
	latencyMs: number;
}

// An interface, not a class: any object with these members is a provider
// (structural typing). The factories in anthropic.ts and openai.ts return plain
// object literals that satisfy it.
export interface TriageProvider {
	name: ProviderName;
	model: string;
	complete(system: string, user: string): Promise<Completion>;
}
