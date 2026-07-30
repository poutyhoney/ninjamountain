// Day 9 — qualitative RAG eval: same tickets, with vs. without retrieval.
// Not a scored metric like score.ts (category/severity don't depend on RAG) —
// this is for reading suggested_first_response side by side and judging whether
// retrieval actually helped, was neutral, or made things worse.
import "./load-env";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { triageTicket } from "../src/index";

const here = dirname(fileURLToPath(import.meta.url));
const tickets = JSON.parse(
  readFileSync(resolve(here, "../experiments/data/tickets.json"), "utf8")
) as { id: string; subject: string; body: string }[];

// Deliberate mix: three tickets that should have an on-topic KB article,
// two that likely don't (feature request; a how-to with no matching article).
const EVAL_IDS = ["T04", "T13", "T19", "T07", "T16"];

async function main() {
  for (const id of EVAL_IDS) {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) { console.error(`${id}: not found, skipping`); continue; }

    const [withoutRag, withRag] = await Promise.all([
      triageTicket(ticket, { useRetrieval: false }),
      triageTicket(ticket, { useRetrieval: true }),
    ]);

    console.log(`\n${"=".repeat(70)}\n[${id}] ${ticket.subject}\n${"=".repeat(70)}`);

    console.log(`\n--- WITHOUT retrieval ---`);
    console.log(withoutRag.ok ? withoutRag.result.suggested_first_response : `FAILED: ${withoutRag.reason}`);

    console.log(`\n--- WITH retrieval ---`);
    if (withRag.ok) {
      console.log(`kb_citations: ${JSON.stringify(withRag.result.kb_citations)}`);
      console.log(withRag.result.suggested_first_response);
    } else {
      console.log(`FAILED: ${withRag.reason}`);
    }
  }
}

main();
