import { getProvider } from "../../src/index";
import type { ProviderName } from "../../src/index";

const API_KEY_ENV: Record<ProviderName, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai:    "OPENAI_API_KEY",
};

export interface ProviderChoice {
  name:  ProviderName;
  model: string;
}

export function parseProviderFlag(args: string[]): ProviderName | undefined {
  const idx = args.indexOf("--provider");
  if (idx === -1) return undefined;
  const value = args[idx + 1];
  if (value === "anthropic" || value === "openai") return value;
  console.error(`--provider must be "anthropic" or "openai" (got "${value ?? ""}")`);
  process.exit(1);
}

export function chooseProvider(args: string[]): ProviderChoice {
  const { name, model } = getProvider(parseProviderFlag(args));
  const keyVar = API_KEY_ENV[name];
  if (!process.env[keyVar]) {
    console.error(`${keyVar} is not set. Add it to packages/triage/.env or export it in your shell.`);
    process.exit(1);
  }
  return { name, model };
}