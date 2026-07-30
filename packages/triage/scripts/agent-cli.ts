/**
 * Quick CLI for running the v3 tool-use agent without the web UI.
 *
 *   npm run agent                # run the agent on a built-in sample ticket
 *   npm run agent -- --id T01    # run the agent on one ticket from the dataset by id
 *
 * Reads tickets from experiments/data/tickets.json. Requires ANTHROPIC_API_KEY
 * and VOYAGE_API_KEY (search_kb calls retrieve.ts, which embeds the query).
 */
import "./load-env";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { runTriageAgent } from "../src/index";
import type { Ticket, AgentOutcome } from "../src/index";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(scriptDir, "../experiments/data/tickets.json");

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

function printOutcome(ticket: StoredTicket, outcome: AgentOutcome): void {
  const tag = ticket.id ? `[${ticket.id}] ` : "";
  console.log("\n" + "─".repeat(72));
  console.log(`${tag}${ticket.subject}`);
  console.log("─".repeat(72));

  console.log(`\ntool calls (${outcome.toolLog.length}):`);
  for (const entry of outcome.toolLog) {
    console.log(`  ${entry.iteration}. ${entry.tool}(${JSON.stringify(entry.input)})`);
    console.log(`     -> ${entry.output.slice(0, 160)}${entry.output.length > 160 ? "..." : ""}`);
  }

  if (!outcome.ok) {
    console.log(`\n✗ FAILED (${outcome.reason})`);
    for (const err of outcome.lastErrors) console.log(`  - ${err}`);
    return;
  }

  const r = outcome.result;
  console.log(`\ncategory : ${r.category}`);
  console.log(`severity : ${r.severity}`);
  console.log(`escalate : ${r.needs_engineering_escalation ? "yes" : "no"}`);
  console.log(`kb cited : ${r.kb_citations.join(", ") || "(none)"}`);
  console.log(`summary  : ${r.summary}`);
  console.log(`reply    : ${r.suggested_first_response}`);
  console.log(`(done in ${outcome.iterations} iteration[s])`);
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY is not set. Add it to packages/triage/.env or export it in your shell."
    );
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let tickets: StoredTicket[];

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

  for (const ticket of tickets) {
    const outcome = await runTriageAgent({ subject: ticket.subject, body: ticket.body });
    printOutcome(ticket, outcome);
  }
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
