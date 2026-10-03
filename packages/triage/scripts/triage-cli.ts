/**
 * Quick CLI for iterating on the triage pipeline without the web UI.
 *
 *   npm run triage                          # triage a built-in sample ticket
 *   npm run triage -- --id T01              # triage one ticket from the dataset by id
 *   npm run triage -- --all                 # triage every ticket in the dataset
 *   npm run triage -- --provider openai     # use OpenAI instead of Anthropic
 *
 * Reads tickets from experiments/data/tickets.json. Requires the API key for the
 * chosen provider (loaded from packages/triage/.env via dotenv, or already set in your shell).
 */
import "./load-env";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { getProvider, triageTicket } from "../src/index";
import type { ProviderName, Ticket, TriageOutcome } from "../src/index";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(scriptDir, "../experiments/data/tickets.json");

const API_KEY_ENV: Record<ProviderName, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai:    "OPENAI_API_KEY",
};

type StoredTicket = Ticket & { id?: string };

const SAMPLE: StoredTicket = {
  id: "SAMPLE",
  subject: "Outbound SMS webhooks not firing",
  body:
    "Since yesterday our outbound SMS messages send fine (customers receive them) but " +
    "we get no status callback webhooks for delivered/failed events. Our endpoint hasn't " +
    "changed. This is affecting our reporting dashboard.",
};

function loadDataset(): StoredTicket[] {
  try {
    const parsed = JSON.parse(readFileSync(DATA_PATH, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseProviderFlag(args: string[]): ProviderName | undefined {
  const idx = args.indexOf("--provider");
  if (idx === -1) return undefined;
  const value = args[idx + 1];
  if (value === "anthropic" || value === "openai") return value;
  console.error(`--provider must be "anthropic" or "openai" (got "${value ?? ""}")`);
  process.exit(1);
}

function printOutcome(ticket: StoredTicket, outcome: TriageOutcome): void {
  const tag = ticket.id ? `[${ticket.id}] ` : "";
  console.log("\n" + "─".repeat(72));
  console.log(`${tag}${ticket.subject}`);
  console.log("─".repeat(72));

  if (!outcome.ok) {
    console.log(`✗ FAILED (${outcome.reason})`);
    for (const err of outcome.lastErrors) console.log(`  - ${err}`);
    return;
  }

  const r = outcome.result;
  console.log(`category : ${r.category}`);
  console.log(`severity : ${r.severity}`);
  console.log(`escalate : ${r.needs_engineering_escalation ? "yes" : "no"}`);
  console.log(`summary  : ${r.summary}`);
  console.log(`reply    : ${r.suggested_first_response}`);
  console.log(`cites    : ${r.kb_citations.length ? r.kb_citations.join(", ") : "(none)"}`);
  console.log(
    `(${outcome.provider} · ${outcome.model} · ` +
    `${outcome.usage.inputTokens} in / ${outcome.usage.outputTokens} out tokens · ` +
    `${(outcome.latencyMs / 1000).toFixed(1)}s · ${outcome.attempts} attempt[s])`
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const provider = parseProviderFlag(args);

  const { name, model } = getProvider(provider);
  const keyVar = API_KEY_ENV[name];
  if (!process.env[keyVar]) {
    console.error(`${keyVar} is not set. Add it to packages/triage/.env or export it in your shell.`);
    process.exit(1);
  }
  console.log(`Using ${name} (${model})`);

  let tickets: StoredTicket[];

  if (args.includes("--all")) {
    tickets = loadDataset();
    if (tickets.length === 0) {
      console.error(`No tickets found at ${DATA_PATH}`);
      process.exit(1);
    }
  } else {
    const idFlag = args.indexOf("--id");
    if (idFlag !== -1) {
      const id = args[idFlag + 1];
      const match = loadDataset().find((t) => t.id === id);
      if (!match) {
        console.error(`No ticket with id "${id}" found in the dataset.`);
        process.exit(1);
      }
      tickets = [match];
    } else {
      tickets = [SAMPLE];
    }
  }

  for (const ticket of tickets) {
    const outcome = await triageTicket({ subject: ticket.subject, body: ticket.body }, { provider });
    printOutcome(ticket, outcome);
  }
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});