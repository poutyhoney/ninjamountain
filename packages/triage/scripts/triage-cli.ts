/**
 * Quick CLI for iterating on the triage pipeline without the web UI.
 *
 *   npm run triage                 # triage a built-in sample ticket
 *   npm run triage -- --id T01     # triage one ticket from the dataset by id
 *   npm run triage -- --all        # triage every ticket in the dataset
 *
 * Reads tickets from experiments/data/tickets.json. Requires ANTHROPIC_API_KEY
 * (loaded from packages/triage/.env via dotenv, or already set in your shell).
 */
import "./load-env";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { triageTicket } from "../src/index";
import type { Ticket, TriageOutcome } from "../src/index";

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
  console.log(`(triaged in ${outcome.attempts} attempt[s])`);
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
    const outcome = await triageTicket({ subject: ticket.subject, body: ticket.body });
    printOutcome(ticket, outcome);
  }
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
