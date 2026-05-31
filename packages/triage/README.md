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
}
```

The pipeline never throws — it always resolves to a typed `TriageOutcome` (success with
the result, or a failure with a reason and error details). It retries transient API
errors with backoff, and re-prompts the model when output fails to parse or validate.

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

```ts
import { triageTicket } from "@ninjamountain/triage";

const outcome = await triageTicket({
  subject: "Webhook not firing",
  body: "Our status callbacks stopped arriving yesterday…",
});

if (outcome.ok) {
  console.log(outcome.result.category, outcome.result.severity);
} else {
  console.error(outcome.reason, outcome.lastErrors);
}
```

Requires `ANTHROPIC_API_KEY` to be set in the environment.

## Consumers

- **`apps/web`** — exposes it at `/projects/triage` (UI) via the `POST /api/triage`
  route handler. The web app transpiles this package's TypeScript source directly
  (`transpilePackages` in `next.config.ts`), so there's no separate build step.

## Layout

```
src/
  index.ts      Public API (import from here)
  triage.ts     Orchestrator: retry + correction loop
  client.ts     Anthropic API call (typed errors, backoff)
  parse.ts      Extract JSON from model output
  validate.ts   Validate output against the TriageResult contract
  types.ts      Domain + return types
```
