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
which is what `npm -w @ninjamountain/triage run agent` prints (see the
[Command reference](#command-reference)).

Requires `ANTHROPIC_API_KEY` in the environment for both entry points, plus
`VOYAGE_API_KEY` for KB retrieval (v2+, since `search_kb` embeds the query).

## Command reference

Run everything from the **repo root**. The pattern is:

```bash
npm -w @ninjamountain/triage run <script> -- <flags>
```

`-w` picks the triage workspace. The `--` passes the flags to the script
instead of to npm. Scripts that call a model need API keys in
`packages/triage/.env` (see [Environment variables](#environment-variables)).

### Try a ticket

**`triage`**: run the v1/v2 pipeline (with retrieval) on tickets.

```bash
npm -w @ninjamountain/triage run triage                         # the built-in sample ticket
npm -w @ninjamountain/triage run triage -- --id T02             # one ticket by id
npm -w @ninjamountain/triage run triage -- --all                # every ticket
npm -w @ninjamountain/triage run triage -- --provider openai    # use OpenAI (also works with --id / --all)
```

`--id` and `--all` read the original v1 ticket set in
[`experiments/data/tickets.json`](./experiments/data/tickets.json), not
`dataset.json`.

You'll see: `Using <provider> (<model>)`, then a block per ticket with
`category`, `severity`, `escalate`, `summary`, `reply`, and `cites`. A ticket
that fails validation shows `✗ FAILED (<reason>)` and the errors.

**`agent`**: run the v3/v4 tool-use agent. Anthropic only. Needs
`ANTHROPIC_API_KEY` and `VOYAGE_API_KEY`.

```bash
npm -w @ninjamountain/triage run agent                  # the built-in sample ticket
npm -w @ninjamountain/triage run agent -- --id T01      # one ticket from tickets.json
```

You'll see: a `tool calls (<n>)` list (each tool, its input, and the start of
its output), then the result block, ending with `(done in <n> iteration[s])`.

### Measure accuracy

**`score`**: run every labeled ticket in a split through the v1/v2 pipeline
and compare with the gold labels in `dataset.json`. Use it to catch
regressions after changing the prompt or retrieval. Defaults to the **dev**
split, so the frozen test split stays unseen.

```bash
npm -w @ninjamountain/triage run score                          # dev split, default provider
npm -w @ninjamountain/triage run score -- --test                # frozen test split
npm -w @ninjamountain/triage run score -- --all                 # every labeled ticket
npm -w @ninjamountain/triage run score -- --provider openai     # same tickets on OpenAI
npm -w @ninjamountain/triage run score -- --no-save             # print only, no run file
```

You'll see: category accuracy, per-class precision/recall/F1, a confusion
matrix, and severity exact / off-by-one / mean absolute error (severity is
ordinal: `low < medium < high < critical`). Unless you pass `--no-save`, the run
is saved to `packages/triage/runs/<timestamp>-<provider>-<model>.json`, with the
summary metrics and the full output for every ticket. Saved runs are also
browsable at `/projects/triage/runs` in `apps/web`.

There's no flag to limit how many tickets `score` runs. For one ticket, use
`triage -- --id <id>`.

**`compare`**: diff two saved runs, ticket by ticket.

```bash
ls packages/triage/runs/                                        # find run files (sorted by time)
npm -w @ninjamountain/triage run compare -- runs/<run-a>.json runs/<run-b>.json
```

You'll see: the two runs' metrics side by side, category results on the
tickets both runs share, and a **DISAGREEMENTS** list (tickets where category
or severity differ, with the gold label).

**Comparing providers.** `score` and `triage` run on Anthropic (default) or
OpenAI. Choose with `--provider anthropic|openai`, or set `TRIAGE_PROVIDER` in
`.env`. A typical comparison:

```bash
npm -w @ninjamountain/triage run score                          # Anthropic run, saved
npm -w @ninjamountain/triage run score -- --provider openai     # OpenAI run, saved
ls packages/triage/runs/                                        # the two newest files
npm -w @ninjamountain/triage run compare -- runs/<anthropic-run>.json runs/<openai-run>.json
```

Good to know:

- Query embeddings are cached in `packages/triage/.cache/` (gitignored), so
  only the first run calls Voyage, and both providers retrieve the same KB
  articles.
- Claude runs at temperature 0. `gpt-5.5` only supports its default
  temperature, so OpenAI runs vary from run to run.

**`rag:eval`**: the same few tickets with and without retrieval, for reading
the suggested replies side by side. Not a score.

```bash
npm -w @ninjamountain/triage run rag:eval
```

You'll see: for each ticket, a `WITHOUT retrieval` reply and a `WITH retrieval`
reply with its `kb_citations`. See LEARNINGS.md section 10 for how to read the
results.

### Build the dataset

New tickets go through three steps: **generate** candidates, **verify** them
blind, then **validate** the dataset.

**`generate`**: create candidate tickets in a staging file
(`candidates.json`). Never writes `dataset.json` and never sets a gold label.

```bash
npm -w @ninjamountain/triage run generate -- --fill-gaps --dry-run              # plan + sample prompt, no API calls
npm -w @ninjamountain/triage run generate -- --fill-gaps                        # 8 candidates for the thinnest cells
npm -w @ninjamountain/triage run generate -- --fill-gaps -n 4                   # 4 instead of 8
npm -w @ninjamountain/triage run generate -- --cell "flex/taskrouter·bug·high"  # 3 for one cell
npm -w @ninjamountain/triage run generate -- --cell "flex/taskrouter·bug·high" --twist question_framed
```

Other flags: `--out <file>` (default `candidates.json`), `--seed <number>` (repeat
the same random picks). `--count` is the long form of `-n`. Use `--fill-gaps` or
`--cell`, not both.

**Start with `--dry-run`.** It shows what would be generated without spending
API calls.

**`verify`**: review pending candidates one at a time **without** seeing the
generator's intended label. Your read becomes the gold label.

```bash
npm -w @ninjamountain/triage run verify                         # review all pending candidates
npm -w @ninjamountain/triage run verify -- --filter flex        # only matching product, cell, or twist
npm -w @ninjamountain/triage run verify -- --stats              # agreement summary, no review
npm -w @ninjamountain/triage run verify -- --assign-splits      # give dev/test to records without a split
```

Other flags: `--in <file>` (default `candidates.json`), `--reviewer <name>`
(default: your `git config user.name`), `--show-intended` (reveal the
generator's label, which breaks the blind review).

You'll see: each candidate's text and prompts for category and severity. Before
writing, the result runs through the same checks as `dataset:validate`; if any
fail, nothing is written. With nothing pending: `No pending candidates to review.`

**`dataset:report`**: how many tickets each cell has versus its target.
Read-only.

```bash
npm -w @ninjamountain/triage run dataset:report
```

You'll see: a `PRODUCT / SUB-SURFACE  cur  tgt  gap` table, then the category,
severity, and real/synthetic mix.

**`dataset:validate`**: check `dataset.json` against the schema rules. CI runs
it on every PR.

```bash
npm -w @ninjamountain/triage run dataset:validate
```

You'll see: the record count, then either `✓ all invariants hold.` or a list
of violations (and a non-zero exit).

**`dataset:migrate`**: one-time conversion of the old two-file dataset into
`dataset.json`. You shouldn't need it again.

```bash
npm -w @ninjamountain/triage run dataset:migrate                # refuses if dataset.json exists
npm -w @ninjamountain/triage run dataset:migrate -- --force     # overwrite
```

### Knowledge base and other

**`kb:embed`**: re-embed `kb/*.md` into `kb/embeddings.json`. Run it after
editing any KB article. Needs `VOYAGE_API_KEY`.

```bash
npm -w @ninjamountain/triage run kb:embed
```

You'll see: `Embedding <n> KB articles...` then `Wrote <n> embeddings to ...`.

**`mcp:server`**: run the MCP server on its own. The agent normally starts and
stops it for you.

```bash
npm -w @ninjamountain/triage run mcp:server
npx @modelcontextprotocol/inspector tsx packages/triage/src/mcp-server.ts   # list and call its tools by hand
```

**`learnings:pdf`**: build `LEARNINGS.pdf` from `LEARNINGS.md` (needs Python 3).

```bash
npm -w @ninjamountain/triage run learnings:pdf
```

### Environment variables

Set these in `packages/triage/.env` (gitignored).

| Variable | Used for |
|---|---|
| `ANTHROPIC_API_KEY` | Claude calls |
| `OPENAI_API_KEY` | OpenAI calls |
| `OPENAI_MODEL` | OpenAI model (default `gpt-5.5`) |
| `TRIAGE_PROVIDER` | Default provider. `--provider` overrides it |
| `VOYAGE_API_KEY` | KB embeddings for retrieval |

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
  score.ts          Accuracy report vs gold labels (see Command reference)
  embed.ts           Regenerate kb/embeddings.json after editing kb/*.md
  rag-eval.ts        With/without-retrieval qualitative comparison
  load-env.ts        Loads .env for the CLIs
experiments/    Frozen Python/JS reference ports (not built)
```
