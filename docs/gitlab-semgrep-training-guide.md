# GitLab CI + Semgrep Training Guide — Ninja Mountain

## Why this exists

Lesson 2 of the CI/CD training that started in [`docs/cicd-training-guide.md`](cicd-training-guide.md), which built a real GitHub Actions pipeline. That guide is strong evidence for "hands-on GitHub Actions experience" — this one exists to cover the rest of a specific gap: the target roles (Semgrep Senior TSE now, Senior Sales Engineer as an internal move later) both list GitHub Actions, GitLab, CircleCI, Jenkins, and Buildkite side by side, and both want exposure to application security / static analysis. Real GitLab CI experience is dated; real Semgrep usage is nonexistent. This lesson fixes both at once, deliberately combined: integrating Semgrep itself into a GitLab CI pipeline gives genuine hands-on product experience with the exact tool these roles support, not just abstract OWASP Top 10 review.

## How to use this guide

Same format as Lesson 1: each step has a **why**, the **command(s)** typed and run myself, and **what to check** before moving on — a record of what happened, not a spec written in advance.

---

## Day 1 — Get a real GitLab CI pipeline running

**The point of Day 1:** get a genuine `.gitlab-ci.yml` written and running against real code, deliberately comparing its syntax against the GitHub Actions version already understood from Lesson 1 — same underlying concepts (triggers, jobs, caching, secrets), different vocabulary.

### Step 1 — Import the repo into GitLab

Imported the existing GitHub repo into a new GitLab project (`gitlab.com/poutyhoney-group/ninjamountain`) via GitLab's "Import from GitHub" — a separate copy to write CI against, zero risk to the live GitHub/Vercel setup.

**Done** — confirmed via GitLab's file browser: full commit history present, latest commit matches GitHub exactly (`877938fe`, "Add .vercel to .gitignore").

### Step 2 — Write the first `.gitlab-ci.yml`

Translated the `web` job (lint/typecheck/build) from `.github/workflows/ci.yml` into GitLab CI syntax:

```yaml
image: node:22

stages:
  - test

cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/

web:
  stage: test
  script:
    - npm ci
    - npm run lint:web
    - npm run typecheck:web
    - npm run build:web
```

Concepts that differ from GitHub Actions, worth naming explicitly rather than just pattern-matching: `image:` replaces both `runs-on:` and `setup-node` — GitLab runs jobs inside a Docker container you name directly, rather than a VM you configure. No `actions/checkout` equivalent needed — GitLab clones the repo automatically. `stages:`/`stage:` is GitLab's job-ordering mechanism (sequential stages, parallel jobs within a stage). No `on:` trigger block — GitLab runs on every push by default, the opposite default from GitHub Actions.

**Done** — file written, confirmed syntactically valid via GitLab's dedicated CI Lint tool (`/-/ci/lint`) once real problems below were ruled out.

### Step 3 — Push and watch a real GitLab pipeline run

**Gotcha #1 — token auth.** `git push` prompted for a GitLab username/password, and using the actual account password failed ("HTTP Basic: Access denied"). Same pattern as every major git host now: needed a **Personal Access Token** instead, generated at `/-/user_settings/personal_access_tokens` with just the `write_repository` scope (minimum needed for `git push`, nothing broader). A related mixup: GitLab's push prompt wants the actual **username** (found under Edit Profile — `tom874` here), not the account's display name ("Tom De Carlo").

**Gotcha #2 — protected default branch.** `git push gitlab gitlab-ci-lesson2:main` was rejected: `"You are not allowed to push code to protected branches on this project."` Unlike GitHub (branch protection is opt-in, and Day 4 of Lesson 1 was literally about turning it on), **GitLab protects the default branch automatically**, even on a freshly imported project — direct pushes are blocked, Merge Requests are the only path in. Embraced this rather than working around it: pushed the branch on its own (`git push gitlab gitlab-ci-lesson2`, no `:main`) and opened a Merge Request through the UI — GitLab's name for what GitHub calls a Pull Request.

**Gotcha #3 — the real one: GitLab requires account verification before running pipelines.** First pipeline run showed **Failed**, tagged `yaml invalid`, `0 jobs`. Genuinely misleading label — GitLab's own **CI Lint tool** (`/-/ci/lint`) confirmed the file was syntactically valid the whole time. The actual cause: GitLab requires new accounts to verify identity (a credit card, not billed — a documented anti-abuse measure against free-tier compute being used for things like cryptomining) before pipelines can run on shared runners at all. The failed pipeline couldn't be retried (it never actually validated in GitLab's eyes, so there was nothing to retry) — completed verification, then triggered a fresh run via **Build → Pipelines → New pipeline**.

**Done** — pipeline `#2710929206` passed for real, 1 job, ~1 minute.

## Day 2 — Integrate Semgrep for real

Goal: add a `semgrep` job to `.gitlab-ci.yml`, run it against the real codebase, get real findings, triage them — genuine vs. false positive, mapped to OWASP Top 10 categories as they come up.

### Step 1-2 — what Semgrep does, and the job itself

Semgrep is a static analysis (SAST) tool — pattern-matches source code directly against a rule library (the Semgrep Registry) without running or compiling it, flagging things like hardcoded secrets, injection-prone patterns, and other OWASP-Top-10-adjacent issues, per language.

```yaml
semgrep:
  stage: test
  image: semgrep/semgrep
  script:
    - semgrep scan --config auto
```

`--config auto` auto-selects rulesets based on languages detected in the repo — no manual rule config needed for a first pass. Used `semgrep scan` (the plain CLI command) rather than `semgrep ci` — the latter is built for use with a Semgrep AppSec Platform account (PR comments, findings dashboard, diff-aware scanning), which we don't have; `semgrep scan` is the honest, no-account starting point using the same real engine and rules.

**Done** — job added, validated clean via GitLab's CI Lint tool.

### Step 3 — run it, three real bugs deep before actual findings

**Bug #1 — `semgrep scan` failed with a Docker environment error:**
```
Detected Docker environment without a code volume, please include '-v "${PWD}:/src"'
```
Read Semgrep's own source (`config_resolver.py`, `adjust_for_docker()`) to understand precisely why, rather than guess:
```python
def adjust_for_docker() -> None:
    if env.in_docker and not env.in_gh_action:
        try:
            next(env.src_directory.iterdir())   # checks if /src has anything in it
        except (NotADirectoryError, StopIteration):
            raise Exception("Detected Docker environment without a code volume...")
```
This check is explicitly *skipped* when `env.in_gh_action` is true — GitHub Actions gets a specific exemption Semgrep detects automatically; there's no equivalent for GitLab CI. Semgrep hard-expects code at `/src` (the classic `docker run -v $(pwd):/src` pattern); GitLab's runner instead clones to `$CI_PROJECT_DIR` (`/builds/<group>/<project>`), so `/src` is empty and the check fails.

**Bug #2 (first fix attempt — wrong turn):** tried switching to `semgrep ci` (matching Semgrep's *official* GitLab CI/CD doc sample) — it "passed," but the log revealed why: `run 'semgrep login' before using 'semgrep ci' or use 'semgrep scan' and set '--config'`. Semgrep's official sample assumes a Semgrep AppSec Platform account (`SEMGREP_APP_TOKEN`) we don't have — without one, `semgrep ci` didn't scan anything at all, and because Semgrep only fails builds on *blocking findings* (not on this kind of internal error), the job still reported "succeeded." A **silently false-passing security check** — worth knowing about for exactly the kind of company this training is for.

**Bug #1, actual fix:** went back to `semgrep scan --config auto` (the real no-account command) and satisfied the `/src` check directly: `ln -s "$CI_PROJECT_DIR" /src`. This got past the Docker check, but surfaced:

**Bug #3 — "Scanning 0 files tracked by git... Nothing to scan."** The symlink satisfied Semgrep's directory check but confused its git file-discovery (which locates tracked files relative to a `.git` directory) — symlinked paths and git tooling don't always resolve consistently. Fixed by copying instead of symlinking:
```yaml
- mkdir -p /src
- cp -r "$CI_PROJECT_DIR"/. /src/   # trailing /. copies hidden files too, including .git
- cd /src
- semgrep scan --config auto
```

**Done** — real scan, real output: 168 files scanned, 1074 rules loaded (489 actually applicable to detected languages), **8 findings**, 2 distinct rule types.

### Step 4 — triage

**Finding 1 — `github-actions-mutable-action-tag` (7 occurrences, blocking) in `.github/workflows/ci.yml`.** Real, not a false positive: every `uses: actions/checkout@v4` (and `setup-node@v4`, `setup-python@v5`) pins to a *mutable* tag. Tags can be silently repointed by the action owner — or an attacker, if that account is ever compromised — so a workflow could start pulling different code with no change on our end. This is a recognized supply-chain security concern (OWASP has a separate "Top 10 CI/CD Security Risks" list beyond the classic web-app OWASP Top 10 that covers exactly this). **Fixed for real**, not just dismissed: looked up the actual current commit SHA each tag points to via GitHub's API (`api.github.com/repos/<owner>/<repo>/git/refs/tags/<tag>`) and pinned every `uses:` to `<sha> # <tag>` instead — e.g. `actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4`. Verified: YAML still parses, all four `checkout` + two `setup-node` + one `setup-python` occurrences correctly pinned.

**Finding 2 — `detected-jwt-token` in `apps/web/app/trails/tse-onboarding/auth/page.tsx`.** A false positive on actual risk, true positive on pattern — the important distinction this whole exercise was meant to teach. The flagged JWT is teaching content (a worked example in an Auth lesson; signature literally ends in `.xyz`), not a real credential — nothing to rotate. But it genuinely matches JWT structure, so Semgrep flagging it is *correct tool behavior*, not a bug. Rather than silently ignoring it, documented the dismissal properly: the JWT was embedded inside a multi-line template literal (rendered as on-page example code), so a `// nosemgrep` comment couldn't go on that exact line without the comment itself leaking into the rendered UI text. Fixed by extracting it into its own named constant (`EXAMPLE_JWT`) with the suppression comment and reasoning directly on that line, then interpolating it (`${EXAMPLE_JWT}`) back into the template literal — identical rendered output, but the suppression now sits on real code, not string content. Verified via `typecheck`/`lint` (clean) and a browser check (page renders byte-identical to before).

**Day 2 complete (2026-07-28).** Six real bugs total across the day (three getting Semgrep to actually run at all, one silently-false-passing config mistake, then two genuine triage decisions) — and both AppSec-relevant fixes (supply-chain pinning, documented false-positive suppression) landed for real, not just discussed.

## Day 3 (stretch) — bring Semgrep into the GitHub Actions pipeline too

Goal: side-by-side integration experience across both providers — a specific, concrete interview detail.

Added a `semgrep` job to `.github/workflows/ci.yml`, deliberately testing a hypothesis from Day 2's source-reading rather than assuming it:

```yaml
    semgrep:
        runs-on: ubuntu-latest
        container:
            image: semgrep/semgrep
        steps:
            - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
            - run: semgrep scan --config auto
```

**Hypothesis, from reading Semgrep's own source on Day 2:** `adjust_for_docker()` skips its Docker-mount check entirely when `env.in_gh_action` is true — GitHub Actions sets that automatically. Prediction: none of the three Docker/git-tracking bugs that took three fixes to solve on GitLab should occur here.

**Confirmed for real:** job passed on the *first* try, 24s, no Docker error at all — `Ran 489 rules on 168 files: 0 findings.` Zero findings also validates that Day 2's two fixes (pinned Actions, suppressed JWT) genuinely resolved what Semgrep flagged — same tool, same codebase, clean this time.

**The concrete comparison point this gives me:** GitHub Actions' `container:` key runs a job entirely inside an image with zero extra ceremony for a tool like Semgrep that's Docker-aware; GitLab CI's `image:` key needed three real, understood fixes (satisfying `/src`, then getting git file-tracking working inside it) to reach the same result. Same tool, same rules, meaningfully different amount of CI-specific friction depending on the platform — exactly the kind of platform-specific nuance a support/solutions engineer needs to be able to speak to.

**Day 3 / Lesson 2 complete (2026-07-28).**
