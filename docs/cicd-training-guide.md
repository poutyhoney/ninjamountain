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

### Step 5 — commit, push, open a PR, watch a real run

**Detour before committing:** discovered the old branch (`triage-dataset-v2-pipeline`) was already merged into `origin/main` via PR #1 — confirmed with `git merge-base --is-ancestor HEAD origin/main` and `git diff HEAD origin/main --stat` (empty, meaning identical trees). Branched fresh off `origin/main` instead of building on a closed branch:
```bash
git checkout -b add-cicd-pipeline origin/main
```

**Scoping decision:** the working tree had a lot of unrelated uncommitted work mixed in (pre-existing edits to `apps/api/main.py`, `next.config.ts`, triage dataset JSON, plus the untracked `gamma-prep` files slated for archival). Chose to stage and commit **only** what Day 1/2 actually touched, leaving everything else uncommitted:
```bash
git add package.json apps/web/package.json .nvmrc .env.example .github/ docs/ \
  apps/web/app/trails/apis-integrations/ apps/web/app/trails/applied-ai-ml/ \
  apps/web/app/trails/cloud-native-essentials/ apps/web/app/trails/data-engineering-trail/ \
  apps/web/app/trails/modern-web-foundations/ apps/web/app/trails/tse-onboarding/
git status --short   # checkpoint: confirm only intended files staged
git commit -m "Add GitHub Actions CI pipeline (lint, typecheck, build)"
git push -u origin add-cicd-pipeline
gh pr create --title "Add GitHub Actions CI pipeline" --base main --body "..."
```
Along the way, clarified that `.gitignore` isn't for "not part of this commit" — it's for permanently untracked things (secrets, build output, caches). Untracked files left out of this commit stay untracked, not gitignored; they're still legitimate work for later.

PR: https://github.com/poutyhoney/ninjamountain/pull/2

**Watched it run for real:**
```bash
gh pr checks 2 --watch
```
```
✓  CI/web (pull_request)       48s
✓  CI/packages (pull_request)  22s
```
Both jobs green on the first real attempt, running in parallel on separate GitHub-hosted VMs, alongside Vercel's own preview-deploy checks (confirming Actions and Vercel's git-integration deploy coexist without conflict, as scoped).

**Day 2 complete (2026-07-24).**

## Day 3 — Python CI for `apps/api`

Goal: generate a real `requirements.txt` (none exists today — only a local `.venv`), write a few `pytest` tests against the FastAPI routes (zero tests exist now), add `ruff` for linting, and wire a new `api` job into `ci.yml`.

### Step 1 — a curated `requirements.txt`

**Why:** `apps/api` has no manifest at all — a fresh clone has nothing to `pip install` from, only a local gitignored `.venv`. Diagnostic check first (read-only, ruff run against the file directly): `main.py` already passes ruff's default rule set clean, nothing to fix there.

Installed the new tooling into the existing venv (`pytest`, `ruff` weren't there yet, only `fastapi`/`uvicorn` from whatever originally set it up):
```bash
cd apps/api && source .venv/bin/activate
pip install pytest ruff
pip freeze | grep -iE "^(fastapi|uvicorn|httpx|pytest|ruff)=="
```

Wrote `apps/api/requirements.txt` with only *direct* dependencies, pinned to exact installed versions — deliberately not a full `pip freeze` dump, since pip already resolves `fastapi`'s own transitive dependencies (pydantic, starlette, anyio, ...) correctly on its own; pinning them all just adds noise and makes future upgrades harder to reason about:
```
fastapi==0.136.3
uvicorn==0.48.0
httpx==0.28.1
pytest==9.1.1
ruff==0.16.0
```
(`httpx` is required under the hood by FastAPI's `TestClient`, used in Step 2; `uvicorn` isn't needed for tests but is needed for the existing `dev:api` script to work on a fresh clone.)

**Real proof it's complete** — installed from *only* this file into a brand-new, empty venv (simulating what a CI runner starts with) and imported the app:
```bash
python3 -m venv /tmp/api-ci-test-venv && source /tmp/api-ci-test-venv/bin/activate
pip install -r apps/api/requirements.txt
cd apps/api && python3 -c "import main"   # silent = success
deactivate && rm -rf /tmp/api-ci-test-venv
```

> **Gotcha hit along the way:** typo'd the cleanup as `rm -rf /tmp/api-ci-text-venv` (text, not test) — wrong path, and it failed *silently* with no error, because `-f` specifically suppresses "no such file" complaints. Worth remembering: `-f` means "don't ask, don't complain," which is great for scripts but means a typo in a destructive command just quietly does nothing instead of warning you — harmless here (a stray scratch folder), but the kind of thing to double-check when `-f` is pointed at something that matters.

**Done** — fresh-venv install succeeded, `import main` silent (no errors).

> **Gotcha hit right after this:** reactivated the leftover throwaway `/tmp/api-ci-test-venv` by mistake (the earlier `rm -rf .../api-ci-**text**-venv` typo meant it never actually got deleted) instead of the real project `.venv` — caught it by noticing the shell prompt still showed `(api-ci-test-venv)`, and confirmed the fix with `which python3` before trusting any test results. Good general habit: when a command fails in a way that doesn't make sense (`No module named pytest` right after installing it), check *which* environment you're actually in before assuming the tool is broken.

### Step 2 — `pytest` tests using `TestClient`

**Why:** zero tests exist for `apps/api` today. `TestClient` wraps the real FastAPI `app` object and sends it fake requests entirely in-process — no real server or socket — so it's fast and needs no network.

Created `apps/api/test_main.py` with three tests, one per route (`/`, `/health`, `/projects`), asserting on each route's actual current response. `test_list_projects` checks structure (`"title" in p`) rather than the full literal list, so it doesn't become brittle against minor content edits that aren't really bugs.

> **Gotcha hit while typing this by hand:** a typo (`repsonse` instead of `response`) caused `NameError: name 'response' is not defined` — pytest's traceback pointed directly at the exact line and variable name, a real "read the error and fix the actual bug" moment rather than a hypothetical one.

**Done** — `python3 -m pytest -v` → `3 passed`.

### Step 3 — `ruff check .` over the whole directory

**Why:** `test_main.py` is new since the earlier ruff check on just `main.py` — worth re-checking the whole directory now that there's more Python to lint.

**Done** — `ruff check .` → `All checks passed!`.

### Step 4 — the `api` job in `ci.yml`

**Why:** a third sibling job (same shape as `web`/`packages`, but Python instead of Node) — `actions/setup-python@v5` instead of `setup-node`, `cache: pip` instead of `cache: npm`. Completely independent VM; never touches Node at all.

```yaml
  api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.13"
          cache: pip

      - run: pip install -r apps/api/requirements.txt
      - run: ruff check apps/api
      - run: pytest apps/api
```

Note all paths (`apps/api/requirements.txt`, etc.) are relative to the repo root, since that's where `checkout` puts you on the VM — unlike the local terminal where each command was run from inside `apps/api` itself.

**Done** — no typos this time; validated on the first try, all three jobs (`web`, `packages`, `api`) structured correctly.

### Step 5 — commit, push, and a real red check

**Detour again:** discovered PR #2 (Day 2's work) had already been merged into `main` between sessions. Pushing more commits onto the now-closed `add-cicd-pipeline` branch triggered nothing — no `pull_request` event fires for a merged/closed PR, and the workflow's other trigger only matches pushes to `main`. Fixed the same way as before: branched fresh off `origin/main`, replayed just the two Day 3 commits with `git cherry-pick <sha1> <sha2>` (cherry-pick = "take these specific commits and reapply them on a different base," as opposed to bringing over the whole branch history), pushed, opened a new PR (#3).

**Then, a genuinely real CI failure — first one all week that wasn't caught locally first:**

```
I001 [*] Import block is un-sorted or un-formatted
 --> apps/api/test_main.py:1:1
```

Confusing at first: the exact same `ruff` (same pinned version, 0.16.0) had passed clean locally moments earlier. Root cause, found by testing the *same binary* from two different working directories:
```bash
apps/api/.venv/bin/ruff check apps/api   # from repo root → FAILS (I001)
apps/api/.venv/bin/ruff check .          # from inside apps/api → PASSES
```
Ruff's import-sorter tries to auto-detect which imports are "first-party" (your own code) vs. third-party, based on where it resolves the project root from. Run from inside `apps/api`, it correctly sees `main.py` sitting right there and classifies `from main import app` as first-party, distinct from the third-party `from fastapi.testclient import TestClient` — so the blank line between them is a valid category boundary. Run from the repo root — exactly what CI does after `checkout` — that distinction doesn't happen, both imports get treated as one group, and the same blank line now looks like disorganized formatting *within* a group.

**Fix:** added `defaults: run: working-directory: apps/api` at the job level in `ci.yml`, so every `run:` step in the `api` job genuinely executes from inside `apps/api` — matching local terminal usage exactly, byte for byte, rather than trying to keep repo-root-relative paths in sync with what works locally.

**A second, unrelated real bug surfaced at the same time:** `test_list_projects` asserted `len(projects) == 6`, but `git log -- apps/api/main.py` showed the actually-committed content only ever had 5 — the 6th ("Module → Gamma") was a transient uncommitted edit caught mid-Day-3 that got reverted before ever being committed, not something CI would ever see. Fixed the assertion to match reality (5), which also happens to line up with the gamma-prep archival already in progress separately.

**Done** — both fixes verified locally (`ruff check .` clean, `pytest -v` → 3 passed) before re-pushing.

Pushed the fixes to PR #3 and watched it go fully green:
```
✓  CI/api (pull_request)       15s
✓  CI/packages (pull_request)  25s
✓  CI/web (pull_request)       43s
```

**Day 3 complete (2026-07-26).** All three jobs (`web`, `packages`, `api`) passing together for the first time, after actually diagnosing and fixing a real, non-hypothetical CI-only failure (the ruff working-directory issue) plus a genuinely stale test assertion — not a typo, an actual logic bug caught by the CI run itself.

## Day 4 — Deploy gate via branch protection

Goal: a GitHub branch protection rule on `main` requiring the CI jobs to pass before merge. Since Vercel deploys from `main`, this becomes a real gate on production without touching Vercel's config at all — before this, a PR with failing checks could still be merged manually; branch protection turns "CI failed" from a suggestion into an actual block on the merge button.

### Step 1-2 — configure the rule (via GitHub UI: Settings → Branches → Add rule)

- **Branch name pattern:** `main`
- **Require a pull request before merging** — checked (forces the PR workflow; without other collaborators, left "Require approvals" *unchecked* — with it checked even at 1, the repo owner is locked out of merging their own PRs, since GitHub doesn't count the author's own approval)
- **Require status checks to pass before merging** — checked, with **Require branches to be up to date before merging** also checked, and all three jobs (`web`, `packages`, `api`) added as required checks
- Left unchecked: conversation resolution, signed commits, linear history, required deployments, lock branch — not needed for a solo repo right now
- **"Do not allow bypassing the above settings"** — checked, so the gate applies even to the repo admin, not just a suggestion
- Force pushes and branch deletion — left disabled (default)

**Done** — rule created, confirmed via Edit view showing all three status checks listed under "Status checks that are required."

### Step 3 — prove it actually blocks something

Opened a throwaway PR (#5, `test-branch-protection`) with a deliberate, guaranteed TypeScript error in a brand-new disposable file (`const x: number = "this is not a number";`) — certain to fail the `web` job's `typecheck:web` step.

**Result:** `CI / web` failed (labeled **Required**), and the **"Merge pull request" button was genuinely greyed out/disabled** — not a clickable warning, an actual block. Bonus: Vercel's own real deployment failed too for the same reason (the broken TypeScript really doesn't compile), confirming this isn't just a CI-specific check but a real build failure.

Fixed the file, pushed again, watched all checks go green — the merge button flipped to solid/"Ready to merge." Closed the PR without merging (`gh pr close 5 --delete-branch`, cleaning up both the PR and the branch in one step) since it was only ever meant to prove the gate works both ways (blocks red, allows green).

**Done (2026-07-27)** — branch protection confirmed to be a real, working deploy gate, verified in both directions (fails closed, opens on green).

### Step 4 — document it

Added a short "CI/CD" section to the root `README.md`: PRs must pass CI before merging to `main`; `main` auto-deploys to production via Vercel's git integration, so a green PR is what actually reaches the live site.

**Day 4 complete (2026-07-27).** The pipeline built on Days 1–3 is now a genuine, unbypassable gate — not just a nice-to-have that could be clicked past.

## Day 5 (stretch) — Actions-driven preview deploy

Goal: a `deploy-preview` job on pull requests, gated on CI passing, using the Vercel CLI + a token to produce a preview URL.

**Honest scoping note before starting:** Vercel's own git integration was already producing a preview deployment for every PR all week (the `Vercel` check). Building an Actions-driven preview on top of that would be redundant *unless* Vercel's native preview deploys are turned off first — otherwise there'd be two competing preview systems. Considered spinning up a second, dedicated project instead to showcase this feature more cleanly — decided against it: more setup overhead, fragments the portfolio story across two repos, and there's a real job this repo still needs to be ready for. The actual fix (disable just Vercel's *preview* auto-deploys, leave production untouched) is a much smaller, lower-risk change than either alternative.

### Step 0 — make Vercel stop doing preview deploys (production untouched)

In the Vercel dashboard: `ninjamountain-web` project → Settings → **Build and Deployment** → **Ignored Build Step** → Behavior dropdown → **"Only build production."** Built-in preset (no custom script needed) that skips Vercel's own build/deploy for anything that isn't a push to the production branch (`main`), while `main` keeps auto-deploying exactly as before.

**Done** — saved; confirmed dropdown shows "Only build production," and the (now-inactive) placeholder command underneath matches the equivalent logic (`if [ "$VERCEL_ENV" == "production" ]; then exit 1; else exit 0; fi`) a custom script would have used.

### Step 1 — Vercel token + `vercel link` for org/project IDs

Created a personal Vercel token at `vercel.com/account/tokens` (kept private — the actual value never got pasted into this conversation, only typed directly into the terminal).

```bash
cd apps/web && npx vercel link
```

> **Correction mid-step:** initially assumed `.vercel/` should end up inside `apps/web/` (matching the project's actual root). It didn't — `npx vercel link`, even run from inside `apps/web`, put `.vercel/` at the **repo root** instead. Turned out this is *correct*, not a mistake: newer Vercel CLI versions (57.0.0 here) support monorepos by storing a single `.vercel/repo.json` at the repo root with a `projects` array, each entry mapping a `directory` (e.g. `"apps/web"`) to its own `id`/`orgId` — a different, newer convention than the older one-`project.json`-per-directory pattern. Confirmed via `.vercel/README.txt` (Vercel's own generated explainer) and by reading `repo.json` directly. Also confirmed `.vercel` was already present in `.gitignore` beforehand.

**Done** — linked to the existing `ninjamountain-web` project; `orgId` and `projectId` retrieved from `.vercel/repo.json`.

### Step 2 — add the three secrets as GitHub repo secrets

`VERCEL_TOKEN` set via `gh secret set VERCEL_TOKEN` with no `--body` flag — prompts interactively for the value so it never touches shell history or this conversation. `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` set directly from the (non-sensitive) IDs already retrieved in Step 1.

**Done** — `gh secret list` confirms all three present.

### Step 3 — the `deploy-preview` job

New concepts this job introduced, beyond the pattern from Days 2–3:

- **`needs: [web, packages, api]`** — job won't start until all three pass; the actual "gated on CI" mechanic.
- **`if: github.event_name == 'pull_request'`** — this workflow triggers on both `pull_request` and `push` to `main`; a push to `main` has no PR to comment on and shouldn't get a "preview."
- **`permissions:`** — specifying *any* `permissions:` block resets every unlisted scope to `none`, it doesn't add to the defaults. `contents: read` had to be listed explicitly alongside `pull-requests: write`, or `actions/checkout` would lose the access it needs just to clone the repo.
- **`env: VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`** — how the Vercel CLI knows which project to target in CI without the (gitignored) `.vercel` folder being present.
- **`vercel pull` → `vercel build` → `vercel deploy --prebuilt`** — Vercel's own documented CI pattern; the deploy command prints the resulting URL, captured via `$GITHUB_OUTPUT` for the next step to use.

**Four real bugs found reading the typed-out YAML, none caught by the earlier Day 2/3 patterns:**
1. **Block scalar indentation** — `run: |`'s content lines were at the *same* indent as `run:` itself instead of deeper, so YAML tried to read `url=$(vercel deploy...)` as a new mapping key. First real error: "could not find expected ':'".
2. **`pull_requests: write`** (underscore) instead of **`pull-requests:`** (hyphen) — GitHub Actions permission scope names always use hyphens; the underscore version isn't a recognized key at all.
3. **`working_directory:`** (underscore) instead of **`working-directory:`** (hyphen) — same category of typo, different key.
4. **`secrets.GITHUB_OUTPUT`** instead of **`secrets.GITHUB_TOKEN`** — `GITHUB_OUTPUT` is the file path used for writing step outputs (referenced two steps earlier), not a secret; doesn't exist under `secrets.*`.
5. A second, more subtle YAML rule: `run: gh pr comment ... --body "Actions-deployed preview: ${{ ... }}"` — this value isn't quoted at the YAML level (it starts with `gh`, not a quote character), so it's a *plain scalar*, and a plain scalar can't contain a bare `: ` (colon-space) anywhere in it — the inner `"..."` are just literal characters to YAML's parser, not real quoting. The `preview: ${{` inside it triggered "mapping values are not allowed here." Fixed by wrapping the *entire* `run:` value in single quotes, so the inner double quotes stay as literal characters instead of ending a scalar early.

**Done** — YAML validated clean, all five fixes confirmed in the parsed output.

---

## What I should be able to say after this week

"I built a GitHub Actions pipeline for a personal monorepo — separate jobs for lint/typecheck/build across a Next.js app and two internal packages, a Python/FastAPI service with pytest + ruff, caching via setup-node, and branch protection so nothing merges to main without passing CI. I also added a PR preview-deploy job using the Vercel CLI, gated on the pipeline passing." Specific, verifiable, not inflated.
