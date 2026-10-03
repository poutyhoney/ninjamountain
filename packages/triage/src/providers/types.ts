export type ProviderName = "anthropic" | "openai";

export interface Usage {
	inputTokens: number;
	outputTokens: number;
}

export interface Completion {
	text: string;
	usage: Usage;
	latencyMs: number;
}

export interface TriageProvider {
	name: ProviderName;
	model: string;
	complete(system: string, user: string): Promise<Completion>;
}