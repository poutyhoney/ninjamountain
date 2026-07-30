# @ninjamountain/triage

Support ticket triage pipeline powered by Claude. Given a ticket (`subject` + `body`),
it returns a structured `TriageResult`:

```ts
{
  category:                     "bug" | "config" | "billing" | "how_to" | "feature_request",
  severity:                     "low" | "medium" | "high" | "critical",
  summary:                      string,
  suggested_first_response:     string,
  needs_engineering_escalation: boolean,
  kb_citations:                 string[], // KB article ids actually cited (v2+)
}
```

The pipeline never throws — every entry point resolves to a typed outcome (success with
the result, or a failure with a reason and error details). It retries transient API
errors with backoff, and re-prompts the model when output fails to parse or validate.

Built in four stages, each one a working, independently-runnable version — see
[LEARNINGS.md](./LEARNINGS.md) for the full day-by-day story:

| Version | What it adds | Entry point |
|---|---|---|
| **v1 — baseline** | Single model call, retry + correction loop | `triageTicket()` |
| **v2 — RAG** | Retrieves relevant KB articles (Voyage embeddings, cosine similarity) and grounds the response in them | `triageTicket()` (retrieval on by default) |
| **v3 — tool-use agent** | The model decides which tools to call (KB search, account lookup, ticket history, escalation) before answering, in a capped loop | `runTriageAgent()` |
| **v4 — MCP** | The account/ticket/escalation tools move behind a real MCP server (stdio transport); the agent discovers and calls them over the protocol instead of in-process | `runTriageAgent()` (same signature — MCP is transparent to the caller) |

## Canonical source

**This package is the single source of truth for the triage logic.** Any app in this
monorepo that needs triage should import from `@ninjamountain/triage` — do not copy the
modules elsewhere.

It was ported from the standalone experiment repo
[`poutyhoney/support-triage-assistant`](https://github.com/poutyhoney/support-triage-assistant),
which is now **archived** (kept for history); active development happens here. The original
parallel **Python** and **JavaScript** ports plus learning notes were pulled in under
[`experiments/`](./experiments) as frozen reference snapshots — they are not wired into the
build.

## Usage

### v1/v2 — triageTicket()

```ts
import { triageTicket } from "@ninjamountain/triage";

const outcome = await triageTicket({
  subject: "Webhook not firing",
  body: "Our status callbacks stopped arriving yesterday…",
});

if (outcome.ok) {
  console.log(outcome.result.category, outcome.result.severity, outcome.result.kb_citations);
} else {
  console.error(outcome.reason, outcome.lastErrors);
}
```

KB retrieval (v2) runs by default — pass `{ useRetrieval: false }` to get v1 behavior
(no KB context, always `kb_citations: []`).

### v3/v4 — runTriageAgent()

```ts
import { runTriageAgent } from "@ninjamountain/triage";

const outcome = await runTriageAgent({
  subject: "Webhook not firing",
  body: "Our status callbacks stopped arriving yesterday. Account: +15551234567.",
});

if (outcome.ok) {
  console.log(outcome.result, outcome.iterations, outcome.toolLog);
} else {
  console.error(outcome.reason, outcome.lastErrors, outcome.toolLog); // toolLog survives failure too
}
```

`runTriageAgent()` spawns the MCP server (`src/mcp-server.ts`) as a subprocess for the
duration of the call and tears it down afterward — no separate process to manage
yourself. `outcome.toolLog` records every tool call made (or attempted) during the run,
which is what the CLI below prints.

Requires `ANTHROPIC_API_KEY` in the environment for both entry points, plus
`VOYAGE_API_KEY` for KB retrieval (v2+, since `search_kb` embeds the query).

## CLI (fast iteration loop)

Run from anywhere in the monorepo:

```bash
npm --workspace @ninjamountain/triage run triage             # v1/v2: built-in sample ticket
npm --workspace @ninjamountain/triage run triage -- --id T02 # v1/v2: one dataset ticket by id
npm --workspace @ninjamountain/triage run triage -- --all    # v1/v2: every ticket in the dataset

npm --workspace @ninjamountain/triage run agent               # v3/v4: built-in sample ticket
npm --workspace @ninjamountain/triage run agent -- --id T01   # v3/v4: one dataset ticket by id

npm --workspace @ninjamountain/triage run mcp:server          # run the MCP server standalone
```

Tickets come from [`experiments/data/tickets.json`](./experiments/data/tickets.json).
Both CLIs read `ANTHROPIC_API_KEY` (and `VOYAGE_API_KEY`) from `packages/triage/.env`
(gitignored) or your shell.

To inspect the MCP server directly — list its tools and call them by hand, outside the
agent loop — run:

```bash
npx @modelcontextprotocol/inspector tsx src/mcp-server.ts
```

## Scored accuracy report

Evaluate the (v1/v2) pipeline against the gold labels in
[`experiments/data/labels.json`](./experiments/data/labels.json):

```bash
npm --workspace @ninjamountain/triage run score
```

Runs every labeled ticket and reports **category** accuracy + per-class
precision/recall/F1 + a confusion matrix, and **severity** exact / off-by-one /
mean-absolute-error (severity is ordinal: `low < medium < high < critical`). Use it
to catch regressions and find weak spots as you iterate on the prompt or RAG.

`scripts/rag-eval.ts` does a qualitative with/without-retrieval comparison on a handful
of tickets — see LEARNINGS.md section 10 for the results and how to read them.

## Consumers

- **`apps/web`** — exposes it at `/projects/triage` (UI) via the `POST /api/triage`
  route handler. The web app transpiles this package's TypeScript source directly
  (`transpilePackages` in `next.config.ts`), so there's no separate build step.

## Layout

```
kb/
  kb-*.md            15 knowledge base articles (frontmatter: id, title)
  embeddings.json    Pre-computed Voyage embeddings for kb/*.md (npm run kb:embed)
src/
  index.ts            Public API (import from here)
  triage.ts            v1/v2 orchestrator: retrieval + retry + correction loop
  agent.ts             v3/v4 orchestrator: tool-use loop, spawns the MCP server
  client.ts             Anthropic API call for triageTicket (typed errors, backoff)
  embeddings-client.ts  Shared Voyage embeddings call (typed errors, backoff)
  retrieve.ts           v2: cosine-similarity KB search over kb/embeddings.json
  tools.ts              v3/v4: the one in-process tool (search_kb)
  mock-data.ts          v3/v4: mock account/ticket-history data
  mcp-server.ts         v4: MCP server exposing account/ticket/escalation tools
  mcp-client.ts          v4: spawns + talks to mcp-server.ts over stdio
  parse.ts              Extract JSON from model output
  validate.ts            Validate output against the TriageResult contract
  types.ts                Domain + return types (TriageOutcome, AgentOutcome, ...)
scripts/
  triage-cli.ts   Fast terminal loop for triageTicket (v1/v2)
  agent-cli.ts     Fast terminal loop for runTriageAgent (v3/v4)
  score.ts          Scored accuracy report vs gold labels
  embed.ts           Regenerate kb/embeddings.json after editing kb/*.md
  rag-eval.ts        With/without-retrieval qualitative comparison
  load-env.ts        Loads .env for the CLIs
experiments/    Frozen Python/JS reference ports (not built)
```
