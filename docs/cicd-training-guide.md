# CI/CD Training Guide — Ninja Mountain

## Why this exists

This is a hands-on training log for building real GitHub Actions experience, prompted by a job application question ("briefly describe your hands-on experience with CI/CD environments"). The honest answer going in was "no direct experience" — frontend dev + support-side debugging, but never authored a pipeline. This repo had **zero CI/CD** (no `.github` directory, no lint/test/build gate, deploys handled entirely by Vercel's dashboard git integration). The goal: build a real, working pipeline here, one step at a time, by typing and running every command myself — not by having it done for me — so the eventual interview answer is specific and true.

## How to use this guide

Each day has a **why** (what problem this step solves and why it matters for a real pipeline), the **command(s)** to type and run myself, and **what to check** before moving on. This doc gets filled in day by day as we actually do the work — it's a record of what happened, not a spec written in advance.

---

## Day 1 — Bootstrap: get the repo to a state CI can actually gate on

**The point of Day 1:** a CI job that lints/typechecks/builds is only meaningful if a clean checkout can pass it. Wiring up Actions before fixing pre-existing errors just means the very first run is red for reasons that have nothing to do with CI. So Day 1 is entirely local — no `.github` folder yet.

### Step 1 — See the problem: run the linter

```bash
npm run lint --workspace apps/web
```

This runs ESLint against `apps/web` using its `eslint.config.mjs`. Result: **60 errors, 1 warning**, all `react/no-unescaped-entities` across `app/trails/**/page.tsx`.

### Step 2 — Read one error precisely

Example:
```
apps/web/app/trails/apis-integrations/api-integration-design/page.tsx
  105:39  error  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities
```
`105:39` = line 105, column 39. On that line, column 39 is the apostrophe in `else's` (verified with `awk 'NR==105' <file> | cut -c39`).

**The rule:** `react/no-unescaped-entities` flags a raw `'` or `"` in JSX *text content* (not inside a string or attribute) because it's ambiguous/unsafe in JSX text — React's lint config wants `&apos;` / `&quot;` instead.

### Step 3 — Fix all 60 efficiently, using ESLint's own structured output

Hand-fixing 59 more of the identical edit teaches nothing new. Better approach, and a generally useful technique: ask the tool for **machine-readable** output instead of scraping text, then script the fix at the exact reported coordinates.

**3a. Generate a JSON report of every error:**
```bash
cd apps/web && npx eslint "app/trails/**/*.tsx" --format json > /tmp/lint-report.json
```
`--format json` gives an array of `{filePath, messages: [{ruleId, line, column, ...}]}` — same errors, parseable.

**3b. Write a script that trusts those exact coordinates.** This is plain JavaScript — save *only* the code below (no shell wrapper) as a `.js` file, e.g. via a text editor:

```javascript
const fs = require("fs");
const report = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

for (const file of report) {
  const entityMsgs = file.messages.filter(m => m.ruleId === "react/no-unescaped-entities");
  if (!entityMsgs.length) continue;

  const lines = fs.readFileSync(file.filePath, "utf8").split("\n");
  const byLine = new Map();
  for (const m of entityMsgs) {
    if (!byLine.has(m.line)) byLine.set(m.line, []);
    byLine.get(m.line).push(m);
  }

  for (const [lineNo, msgs] of byLine) {
    // right-to-left, so fixing one column doesn't shift the next one on the same line
    msgs.sort((a, b) => b.column - a.column);
    let line = lines[lineNo - 1];
    for (const m of msgs) {
      const idx = m.column - 1;
      const ch = line[idx];
      const replacement = ch === "'" ? "&apos;" : ch === '"' ? "&quot;" : null;
      if (!replacement) { console.error(`unexpected char at ${file.filePath}:${lineNo}:${m.column}`); continue; }
      line = line.slice(0, idx) + replacement + line.slice(idx + 1);
    }
    lines[lineNo - 1] = line;
  }

  fs.writeFileSync(file.filePath, lines.join("\n"));
  console.log(`fixed ${entityMsgs.length} in ${file.filePath}`);
}
```

The one non-obvious bit: `msgs.sort((a, b) => b.column - a.column)`. If a line has errors at columns 10 and 39, and you insert `&apos;` (5 extra characters) at column 10 first, column 39 is no longer where ESLint said it was. Fixing right-to-left avoids that.

> **Gotcha hit while doing this:** if you copy a fenced command block that looks like `cat > file.js << 'EOF' ... EOF`, the `cat > ... << 'EOF'` and closing `EOF` are a *shell heredoc wrapper* for writing a file from the terminal — not part of the file's contents. Pasting the whole block into a text editor and saving it produces a `.js` file whose first line is literally `cat > ...`, which is a syntax error when you try to run it with `node`. When typing a script into an editor by hand, only the code between the markers goes in the file.

**3c. Run it, then verify:**
```bash
node <path-to-your-script>/fix-entities.js /tmp/lint-report.json
cd /Users/tomdecarlo/NinjaMountain/dotblack/ninjamountain
npm run lint --workspace apps/web
```
Expect 19 `fixed N in ...` lines (one per file with errors), then a clean lint run (0 errors — 1 pre-existing unrelated `no-unused-vars` warning on `NAV_LINKS` is fine, warnings don't fail CI).

**Done** — confirmed `0 errors`, 1 unrelated pre-existing warning.

### Step 4 — Pin the Node version

**Why:** nothing in the repo currently pins a Node version (no `.nvmrc`, no `engines` field). Locally it happens to be v22.14.0, but a CI runner has no way to know that unless we say so explicitly — otherwise `actions/setup-node` picks an arbitrary default.

```bash
node --version
```
Then add a `.nvmrc` file (content: `22`) and an `"engines": { "node": ">=22" }` field to the root `package.json`.

**Done** — `.nvmrc` created (`22`), `engines` field added and validated with `python3 -m json.tool package.json`.

### Step 5 — Add a standalone `typecheck` script to `apps/web`

**Why:** `next build` type-checks implicitly, but that means a type error only surfaces after paying for a full build. A dedicated `"typecheck": "tsc --noEmit"` script fails fast and cheap — useful as its own CI step.

```bash
npm run typecheck --workspace apps/web
```
(after adding the script to `apps/web/package.json`)

**Done** — script added, JSON validated, `tsc --noEmit` ran clean (no output = no type errors).

### Step 6 — Add root-level convenience scripts

**Why:** so CI (and I) can run one short command instead of remembering `--workspace <path>` every time.

```json
"lint:web": "npm run lint --workspace apps/web",
"typecheck:web": "npm run typecheck --workspace apps/web",
"typecheck:triage": "npm run typecheck --workspace packages/triage"
```

> **Scope change (2026-07-24):** `typecheck:gamma-prep` was deliberately dropped from this list. The job that motivated `packages/gamma-prep/` fell through, and it's slated for archival rather than active maintenance — see the reminder task flagged for removing it. No point wiring CI around something on its way out.

**Done** — three scripts added and smoke-tested individually (`lint:web`, `typecheck:web`, `typecheck:triage` all pass clean). Learned along the way: `npm run typecheck triage` (space) ≠ `npm run typecheck:triage` (colon) — the colon is just part of the script's literal name, a naming convention, not special npm syntax; a space after the script name is parsed as an argument passed to that script.

### Step 7 — Add a root `.env.example`

**Why:** documents required/optional env vars, so it's clear to CI and future contributors what's **not** required to lint/typecheck/build.

**Scope change (2026-07-24):** only `ANTHROPIC_API_KEY` documented here — `GAMMA_API_KEY` deliberately left out since gamma-prep is being archived (see Step 6 note).

**Done** — `.env.example` created at repo root, confirmed not shadowed by `.gitignore` (only `.env`/`.env.local` are ignored, `.env.example` is safe to commit), content verified with `cat`.

### Day 1 checkpoint

By the end of Day 1 I should be able to explain: what `react/no-unescaped-entities` checks and why; how to read an ESLint error's file:line:column; why machine-readable (`--format json`) output beats scraping text when scripting a fix; why Node-version pinning matters for CI; and why a standalone typecheck script is faster-failing than relying on the build.

**Day 1 complete (2026-07-24).** Final combined sanity check, all green:
```bash
npm run lint:web        # 0 errors, 1 unrelated pre-existing warning
npm run typecheck:web   # clean
npm run typecheck:triage # clean
npm run build:web       # ✓ Compiled successfully, ✓ Finished TypeScript, 44/44 pages generated
```
The repo now has a genuinely clean baseline — nothing left for a future CI job to fail on that isn't a real, newly-introduced problem. Note: `/api/gamma-generate` and `/projects/gamma-prep` still built successfully as part of this — they're still wired into the live app pending the separate archival task flagged earlier.

---

## Day 2 — `.github/workflows/ci.yml`: the core Node/web pipeline

Goal: a real GitHub Actions workflow, triggered on PRs and pushes to `main`, with jobs for `web` (lint/typecheck/build) and `packages` (typecheck triage, plus the local-only `dataset:validate`). Deliberately excludes `packages/triage`'s live-Anthropic-API scripts (`generate`/`score`/`triage`) from running automatically — those cost money and shouldn't fire on every push. `gamma-prep` is excluded entirely (see Day 1 scope-change note — slated for archival).

### Step 1 — the `.github/workflows/` convention

**Why:** GitHub Actions needs no registration step or dashboard config — it auto-discovers any `.yml`/`.yaml` file placed in `.github/workflows/` at the repo root and runs it as a separate workflow.

```bash
mkdir -p .github/workflows
```
Then create `.github/workflows/ci.yml` in an editor.

**Done** — directory + empty file created.

### Step 2 — the trigger block, and the YAML "Norway problem"

**Why:** a workflow needs an `on:` block telling GitHub Actions which events should run it. Ours: any pull request, plus pushes specifically to `main`.

```yaml
name: CI

"on":
  pull_request:
  push:
    branches: [main]
```

Validate it parses:
```bash
python3 -c "import yaml, sys; print(yaml.safe_load(open('.github/workflows/ci.yml')))"
```

> **Gotcha hit while doing this — the YAML "Norway problem":** an unquoted `on:` key gets parsed by standard YAML 1.1 tools as the *boolean* `True`, not the string `"on"` — because bare unquoted words like `on`/`off`/`yes`/`no`/`true` are auto-converted to booleans in YAML 1.1. First run of the validation command above printed `{'name': 'CI', True: {...}}` — proof the key had silently become a boolean. This is a well-known enough quirk to have a name (the country code "NO" for Norway suffers the same fate, hence the nickname). **GitHub Actions' own parser handles unquoted `on:` correctly** (it specifically expects a trigger key), so this wouldn't have actually broken the workflow on GitHub's servers — but quoting it as `"on":` removes the ambiguity entirely and is the standard fix, which is why we did it.

**Done** — quoted `"on":`, re-validated, key now comes back as the string `'on'` instead of the boolean `True`.

### Step 3 — the `web` job

**Why:** a workflow is one or more jobs, each on its own fresh VM. This job installs Node, installs deps, and reuses the exact `lint:web`/`typecheck:web`/`build:web` scripts from Day 1.

```yaml
jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run lint:web
      - run: npm run typecheck:web
      - run: npm run build:web
```

Key concepts: `runs-on` picks the VM image; `uses:` pulls a pre-built reusable action (`actions/checkout` clones the repo — without it the VM starts empty; `actions/setup-node` installs Node and, via `cache: npm`, caches `node_modules` by lockfile hash); `run:` executes a raw shell command; `npm ci` (vs `npm install`) installs exact lockfile versions and fails loudly if `package.json`/`package-lock.json` disagree.

> **Gotchas hit while typing this by hand:** (1) `run-on` instead of `runs-on` — easy typo, GitHub wouldn't recognize the key. (2) `- uses actions/checkout@v4` (missing the colon after `uses`) parsed as a bare *string* step instead of a `{uses: ...}` mapping — caught by noticing it was the only list item that didn't come back as a dict when every sibling did. Useful diagnostic in general: when validating parsed YAML/JSON, compare the *shape* of sibling items, not just whether the whole thing parses.

**Done** — both typos fixed, re-validated: every step now a consistent mapping, `runs-on` correct. Reminder: this only proves the YAML is syntactically valid, not that GitHub Actions will accept the schema — real proof comes when we actually push and watch it run (Step 5).

### Step 4 — the `packages` job

**Why:** a sibling job (same indentation as `web:` under `jobs:`) for `packages/triage` — typecheck plus the local-only `dataset:validate`. GitHub Actions runs jobs **in parallel** on separate VMs by default (no `needs:` here), which is both correct (no real dependency between them) and faster than one long sequential job. Each job gets its own fresh VM, so it needs its own `checkout`/`setup-node`/`npm ci` even though it's in the same workflow file as `web`.

```yaml
  packages:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run typecheck:triage
      - run: npm run dataset:validate --workspace packages/triage
```

> **Gotcha hit while typing this by hand:** wrote `npm typecheck:triage` and `npm dataset:validate ...` — missing the word `run` after `npm`. This is a different category of bug than the earlier YAML typos: the YAML itself was perfectly valid (`run:` is a real key, the value a real string), so `yaml.safe_load` couldn't catch it at all — `npm typecheck:triage` isn't a real `npm` subcommand and would fail on the CI VM with "Unknown command." Local YAML validation only proves *syntax*; it can't catch wrong shell commands inside a `run:` string. That category of mistake only surfaces by actually executing it — which is the whole reason Step 5 (a real Actions run) matters, not just local parsing.

**Done** — both `run` keywords added, re-validated, full two-job workflow structure confirmed correct.

## Day 3 — Python CI for `apps/api` *(not started)*

Goal: generate a real `requirements.txt` (none exists today — only a local `.venv`), write a few `pytest` tests against the FastAPI routes (zero tests exist now), add `ruff` for linting, and wire a new `api` job into `ci.yml`.

## Day 4 — Deploy gate via branch protection *(not started)*

Goal: a GitHub branch protection rule on `main` requiring the CI jobs to pass before merge. Since Vercel deploys from `main`, this becomes a real gate on production without touching Vercel's config at all.

## Day 5 (stretch) — Actions-driven preview deploy *(not started)*

Goal: a `deploy-preview` job on pull requests, gated on CI passing, using the Vercel CLI + a token to produce a preview URL. Deliberately scoped to *preview* deploys only — production stays on Vercel's existing git-integration path, since replacing that would mean changing Vercel's dashboard settings, which carries real risk to the currently-working deploy.

---

## What I should be able to say after this week

"I built a GitHub Actions pipeline for a personal monorepo — separate jobs for lint/typecheck/build across a Next.js app and two internal packages, a Python/FastAPI service with pytest + ruff, caching via setup-node, and branch protection so nothing merges to main without passing CI. I also added a PR preview-deploy job using the Vercel CLI, gated on the pipeline passing." Specific, verifiable, not inflated.
