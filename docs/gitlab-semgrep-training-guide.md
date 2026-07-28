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

## Day 2 — Integrate Semgrep for real *(not started)*

Goal: add a `semgrep` job to `.gitlab-ci.yml`, run it against the real codebase, get real findings, triage them — genuine vs. false positive, mapped to OWASP Top 10 categories as they come up.

## Day 3 (stretch) — bring Semgrep into the GitHub Actions pipeline too *(not started)*

Goal: side-by-side integration experience across both providers — a specific, concrete interview detail.
