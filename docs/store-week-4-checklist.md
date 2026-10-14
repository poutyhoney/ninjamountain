# Store: Week 4 checklist

Goal for the week: the store scores 90+ on Lighthouse mobile, Lighthouse CI
enforces that budget on every PR, and one command starts the store and the API
in Docker.

Work through this with Claude Code in teaching mode (see `/CLAUDE.md`). One PR
per section. Check items off as you go.

## Decisions made up front

- **Measure before changing anything.** The store is already server-rendered,
  static with ISR, with self-hosted fonts and no images. Section 1 records a
  baseline and fixes only what Lighthouse actually flags.
- **Lighthouse CI runs against a production build in GitHub Actions,** the same
  way the Playwright job does, not against the Vercel preview.
- **Budgets fail the build.** Performance 90+, Accessibility 100, Best
  Practices 90+, SEO 90+, all on mobile settings.
- **Docker is for local dev this week.** The store stays on Vercel. The API's
  cloud deploy is week 5.
- **Contentful secrets never go into an image.** The store build gets them as
  BuildKit secrets, not build args.

## 0. Environment check (every session)

```bash
cd ~/NinjaMountain/dotblack/ninjamountain
nvm use
node -v            # expect v22.x
git switch main && git pull
git status
docker info        # needs Docker Desktop running (sections 3 to 5)
```

## 1. Lighthouse baseline and fixes

Branch: `store/perf-baseline`

- [x] Production build running locally (`build:store`, then `start:store`).
- [x] Chrome DevTools, Lighthouse panel, Mobile: run it on `/` and
      `/checkout/cancel`. Record the four scores and the Core Web Vitals (LCP, CLS,
      TBT).
- [x] Look at each flagged item and decide: fix it, or note why not.
- [x] Fix what's worth fixing. Re-run and record the new scores.
- [x] Write the before and after scores in "Notes to self."

## 2. Lighthouse CI with a budget

Branch: `store/lighthouse-ci`

- [x] Install `@lhci/cli` in the store workspace.
- [x] `lighthouserc` config: production build, `/` and `/checkout/cancel`,
      3 runs each, mobile settings, score assertions from the decisions above.
- [x] Run it locally and read the report.
- [x] CI job `lighthouse`, with the Contentful secrets on the build step.
      (CI config change: approve it.)
- [x] Prove the budget can fail (throwaway branch), then clean up.
- [x] Add `lighthouse` as a required check on `main`.

## 3. Store Docker image

Branch: `docker/store`

- [x] Read the Next 16 docs on `output: "standalone"` and self-hosting.
- [x] Turn on standalone output and confirm `next build` still works.
- [x] `apps/store/Dockerfile`: multi-stage build from the repo root (workspace
      install), Contentful passed as BuildKit secrets, non-root runtime user.
- [x] `.dockerignore` at the repo root.
- [x] `docker build` and `docker run` it. The store loads on port 3001.

## 4. API Docker image

Branch: `docker/api`

- [x] `apps/api/Dockerfile`: slim Python image, install requirements, run with
      uvicorn, non-root user.
- [x] `docker build` and `docker run` it. `/health` answers on port 8000.

## 5. docker compose

Branch: `docker/compose`

- [ ] `compose.yaml` at the repo root with `store` and `api` services.
- [ ] The store reaches the API by service name (`http://api:8000`), so the
      entitlements panel works inside Docker.
- [ ] Secrets come from `apps/store/.env.local`, never from the compose file.
- [ ] `docker compose up --build` starts everything with one command.
- [ ] README: how to run it with Docker.

## Done when

- Lighthouse mobile scores are 90+ (Accessibility 100)
- Lighthouse CI runs on every PR and is required to merge
- `docker compose up --build` starts the store and the API, and the
  entitlements panel works

## Notes to self (fill in as you go)

### Lighthouse scores

Chrome DevTools Lighthouse, Mobile, incognito, production build with
`API_URL` unset (to match production).

| Page               | When                      | Performance | Accessibility | Best Practices | SEO | LCP   | CLS | TBT   |
| ------------------ | ------------------------- | ----------- | ------------- | -------------- | --- | ----- | --- | ----- |
| `/`                | baseline                  | 97          | 100           | 100            | 100 | 2.6 s | 0   | 10 ms |
| `/checkout/cancel` | baseline                  | 97          | 100           | 100            | 100 | 2.6 s | 0   | 0 ms  |
| `/`                | after removing Geist Mono | 98          | 100           | 100            | 100 | 2.5 s | 0   | 0 ms  |

### Key learnings: performance

**1. Why the store scored well before any tuning**

- Every component is a server component, so the browser gets HTML, not a big
  JavaScript bundle. That's why TBT (Total Blocking Time) was 0 to 10 ms.
- The pricing page is static with ISR, so it's served prebuilt from cache.
- Fonts are self-hosted with `next/font` and `display: "swap"`. Text shows
  right away in a fallback font, and `next/font` sizes the fallback to match,
  so nothing jumps when the real font arrives. That's why CLS was 0.
- No images yet, so there's nothing large to download for the LCP element.

**2. The three Core Web Vitals in one line each**

- **LCP (Largest Contentful Paint):** when the biggest visible element appears.
  Good is under 2.5 s.
- **CLS (Cumulative Layout Shift):** how much the layout jumps while loading.
  Good is under 0.1.
- **INP (Interaction to Next Paint):** how fast the page responds to input.
  Lab tools can't click, so Lighthouse uses **TBT** as a stand-in.

**3. Lighthouse Mobile is a simulation**

- It loads the page at full speed, then models a slow phone (throttled CPU)
  on slow 4G. The scores are deliberately pessimistic.
- The LCP breakdown showed real timings (0 ms to first byte, 180 ms render
  delay), while the reported LCP was a simulated 2.6 s. The simulation counts
  every request that might stand in the way, not just what was actually slow.
- Results vary by a few hundred ms between runs. Run it several times before
  drawing conclusions.

**4. The LCP element was the subtitle, not the heading**

- LCP means the largest element by screen area. Two lines of subtitle text
  covered more area than the "Choose your belt" heading.
- Text LCP elements only have two phases: time to first byte and element
  render delay. The resource load phases apply to images.

**5. The fix: an unused font preload**

- The page preloaded three fonts. Geist Mono came with the `create-next-app`
  starter and nothing used it.
- A preload tells the browser "download this now, it's important." On a slow
  connection, an unused font competes for bandwidth with what the page needs.
- Removing it took LCP from 2.6 s to 2.5 s (orange to green) and Performance
  from 97 to 98. Check with
  `curl -s http://localhost:3001/ | grep -c 'as="font"'`.
- Method: measure, form one hypothesis, change one thing, measure again.

**6. Flagged items I chose not to fix, and why**

| Item | What it is | Why not |
| --- | --- | --- |
| Render-blocking requests (~110 ms) | The CSS file must load before first paint. | One small Tailwind file. Every site has some render-blocking CSS. |
| Legacy JavaScript (13 KiB) | Small polyfills for older browsers. | Next's default browser support. Removing it risks breaking older browsers for little gain. |
| Reduce unused JavaScript (66 to 87 KiB) | The React and Next runtime. | Powers the checkout form and client navigation. TBT is near zero, so it isn't hurting. |
| 1 long task | One main-thread task over 50 ms, likely React startup (hydration). | TBT is 10 ms or less. Nothing noticeable is blocked. |

Lesson: a Lighthouse suggestion is not a requirement. Weigh the gain against
the cost and risk, and write down the reasoning.

### Key learnings: Lighthouse CI

**1. What `lhci autorun` does**

- Three steps in one command: **collect** (starts the server, runs Lighthouse
  3 times per URL), **assert** (checks scores against the budget), **upload**
  (saves the reports).
- A failed assertion makes it exit with status 1. That exit code is what turns
  the CI check red.

**2. The budget**

- Performance 0.9, Best Practices 0.9, SEO 0.9, Accessibility 1. Scores are
  0 to 1 in the config, 0 to 100 in reports.
- Accessibility is 1 (100) so the week 3 audit can't quietly slip.
- No `settings` block means Lighthouse's default mobile simulation, the same
  as the manual DevTools runs.

**3. `median-run` and flaky performance tests**

- The failing test run showed `all values: 0.89, 0.98, 0.99` for `/`. The
  first run is usually the slowest because the server has just started.
- `optimistic` (the default, best run) can hide a slow page.
- `pessimistic` (worst run) fails CI randomly whenever one cold run dips.
- `median-run` checks every category from the median run: stable and honest.

**4. CI design choices**

- Runs against a production build in GitHub Actions, not the Vercel preview,
  so it doesn't depend on Vercel finishing a deploy.
- No `API_URL` in CI, so the build is static like production.
- No browser install step: GitHub's `ubuntu-latest` already has Chrome.
- Reports saved with `upload-artifact` and `if: always()`, so they're
  available even when the check fails. Not uploaded to
  "temporary-public-storage," because those links are public.
- The `upload-artifact` action is pinned to a commit SHA, looked up with
  `gh api repos/actions/upload-artifact/commits/v4 --jq .sha`.

**5. Proving the budget can fail**

- Raised the performance budget to 1 on a throwaway branch. The check went red
  with `expected: >=1, found: 0.99`. Raising the bar tests the mechanism
  without breaking the app.

**6. Required checks have an order**

- A check can only be required after the job exists on `main`. Requiring it
  earlier would leave every new PR waiting for a check that never runs.
- `main` now requires 7 checks: api, packages, web, semgrep, store, e2e,
  lighthouse.

**Known gap:** Lighthouse runs in GitHub Actions only. GitLab's `node:22`
image has no Chrome, so a matching GitLab job would need Chromium installed
with `apt` plus root sandbox flags.

### Key learnings: store Docker image

**1. Standalone output**

- `output: "standalone"` makes `next build` also write `.next/standalone/`:
  a small `server.js` plus only the `node_modules` files the server loads.
- Sizes: full `node_modules` 816 MB, standalone output 38 MB.
- In a monorepo, set `outputFileTracingRoot` to the repo root
  (`path.join(__dirname, "../..")`) so the trace includes the shared root
  `node_modules` and `packages/ui`. The output mirrors the repo layout, so the
  server lives at `.next/standalone/apps/store/server.js`.
- Standalone is turned on only when `BUILD_STANDALONE=1` (set in the
  Dockerfile). With it always on, `next start` still works but warns on every
  run, and Playwright and Lighthouse CI both use `next start`.
- The standalone server doesn't serve `.next/static` (or `public`) unless you
  copy them next to it. The Dockerfile copies `.next/static`.

**2. Multi-stage build**

- The `build` stage has the full toolchain. The `runtime` stage starts fresh
  from `node:22-slim` and copies in only the standalone output and static
  files.
- Image: 91.5 MB compressed ("content size"), 397 MB on disk. About 350 MB is
  the Debian and Node base; the app adds about 40 MB.

**3. Layer caching**

- Copy `package.json` files and the lockfile, run `npm ci`, and only then copy
  source code. Code changes reuse the cached install layer.
- Copy every workspace's `package.json`, because `npm ci` checks the lockfile
  against all workspaces, even with `--workspace apps/store`.

**4. Secrets in Docker builds**

- `RUN --mount=type=secret,id=...,env=NAME` exposes a secret as an env var for
  that one `RUN` step only. It's never written into a layer.
- `ARG` or `ENV` for secrets would bake them into the image, readable with
  `docker history`.
- Verified: no Contentful or Stripe values in the image's env or layer
  history.
- Runtime secrets (`--env-file` on `docker run`) are fine because they live in
  the running container, not the image.
- `.dockerignore` excludes `**/.env*` (except `.env.example`), so secret files
  never even enter the build context.

**5. Running safely**

- `HOSTNAME=0.0.0.0`: inside a container, `localhost` only accepts
  connections from the container itself, so port mapping couldn't reach it.
- `USER node`: the server runs as the image's non-root user.
  `--chown=node:node` lets it write ISR cache files.
- `node:22-slim` over `alpine`: Alpine uses musl, and native packages
  (Tailwind's compiler) sometimes need special builds for it. Slim costs about
  70 MB more and avoids that risk.
- `-e API_URL=` on `docker run`: inside the container, `127.0.0.1:8000` means
  the container itself, where no API runs. Compose fixes this in section 5.

### Key learnings: API Docker image

**1. Build context and `.dockerignore`**

- The API builds with `apps/api` as its context. Docker only reads a
  `.dockerignore` at the root of the context, so the repo-root one doesn't
  apply.
- Copying `main.py` and `entitlements.py` by name keeps out `.venv` (Mac-built
  packages that wouldn't run on Linux), caches, and tests. An explicit copy
  list is a simple alternative to an ignore file.

**2. The same patterns as the store image**

- Install dependencies (`requirements.txt`, `pip install`) before copying code,
  so code changes reuse the cached install layer.
- `--host 0.0.0.0` so connections from outside the container reach the server.
- A non-root user. The Python image has none built in, so `useradd` creates
  `appuser`.

**3. Python in containers**

- Run `uvicorn` directly. `fastapi dev` adds auto-reload, which is for local
  coding.
- `PYTHONUNBUFFERED=1` prints logs immediately, so `docker logs` shows
  requests as they happen. `PYTHONDONTWRITEBYTECODE=1` skips `.pyc` files.
- `--no-cache-dir` on `pip install` keeps pip's download cache out of the
  image.

**4. Size**

- 64.1 MB compressed, 281 MB on disk. Most of it is the `python:3.13-slim`
  base.
- **Known gap:** `requirements.txt` includes `pytest` and `ruff`, so they ship
  in the image. A separate `requirements-dev.txt` would fix it but changes the
  CI `api` job.

### Commands I had to look up

- `API_URL= npm run build:store` and `API_URL= npm run start:store`: run a
  production build with `API_URL` empty for one command, to match production.
- Chrome incognito (Cmd+Shift+N), DevTools (Cmd+Option+I), Lighthouse tab:
  Mode Navigation, Device Mobile, all four categories.
- `curl -s http://localhost:3001/ | grep -c 'as="font"'`: counts the font
  preload tags in the page's HTML.

- `API_URL= npm run lighthouse:store`: Lighthouse CI locally, matching
  production.
- `gh run list --branch <branch> --workflow CI --limit 1`: find a run's ID.
- `gh run view <run-id> --log-failed`: print only the failed steps' logs.
- `gh run download <run-id> -n lighthouse-reports -D ~/Downloads/lighthouse-reports`:
  download a CI artifact without a browser.
- Cmd+click a URL in macOS Terminal to open it in the browser.
- `gh pr close <number> --delete-branch`: `close` always needs the PR number.

- `BUILD_STANDALONE=1 API_URL= npm run build:store`: standalone build
  locally. `du -sh <folder>` shows a folder's size.
- `set -a; source apps/store/.env.local; set +a`: load and export a `.env`
  file into the shell, so `docker build --secret ...,env=NAME` can read it.
- `docker build -f apps/store/Dockerfile -t ninjamountain-store --secret id=contentful_space_id,env=CONTENTFUL_SPACE_ID --secret id=contentful_access_token,env=CONTENTFUL_ACCESS_TOKEN .`
- `docker run --rm -p 3001:3001 --env-file apps/store/.env.local -e API_URL= ninjamountain-store`
- `docker images <name>` and `docker history <name>`: image size and layers.
- `git restore <file>`: discard uncommitted changes to one file.

- `docker build -t ninjamountain-api apps/api`: build with `apps/api` as the
  context.
- `docker run --rm -p 8000:8000 ninjamountain-api`, then
  `curl -s http://localhost:8000/health`.
- `docker run --rm <image> sh -c 'whoami; ls -a /app'`: check the user and
  files inside an image.
- `docker ps`: list running containers and their ports.

### Errors I hit and what fixed them

**1. LCP was orange (2.6 s)** (section 1)

- **What happened:** both pages scored 97, but LCP was just over the 2.5 s
  "good" threshold.
- **Why:** an unused Geist Mono font was preloaded, adding a request that the
  slow-4G simulation counted against LCP.
- **Fix:** remove Geist Mono from `fonts.ts` and its `--font-mono` line from
  `globals.css`.

**2. `globals.css` diff showed 37 changed lines for a 1-line change** (section 1)

- **What happened:** the real change was one deleted line, but the diff also
  lowercased hex colors, removed aligned spacing, and split selectors onto
  separate lines.
- **Why:** a code formatter (likely Prettier, on save) reformatted the file.
- **Fix:** none needed. It doesn't change behavior. Decide whether that
  formatter should run on this repo, because it makes diffs noisier.

**3. `grep` found nothing in the failed Lighthouse log** (section 2)

- **What happened:** `gh run view ... --log-failed | grep 'categories:performance'`
  printed nothing, even though the job had failed.
- **Why:** the report writes `categories.performance` with a dot (the config
  uses a colon), and color codes sit between the words.
- **Fix:** search for plain words, like `grep -A3 'performance failure'`, or
  read the tail of the log.

**4. `gh pr close --delete-branch` failed** (section 2)

- **What happened:** "cannot close pull request: number, url, or branch
  required."
- **Why:** unlike `checks`, `view`, and `merge`, `gh pr close` doesn't default
  to the current branch's PR.
- **Fix:** `gh pr close 53 --delete-branch`. Find numbers with
  `gh pr list --head <branch>`.

**5. The triage README showed up on the Docker branch** (section 3)

- **What happened:** after committing the README on its own branch (PR #54)
  and switching back, `git status` on `docker/store` still listed
  `packages/triage/README.md` as modified.
- **Why:** the file was saved again after the commit (one blank line removed,
  likely the on-save formatter), so an uncommitted copy came along to the new
  branch.
- **Fix:** `git restore packages/triage/README.md`. The real changes were safe
  in PR #54.
- **Lesson:** run `git status` right after switching branches.
