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

- [ ] Production build running locally (`build:store`, then `start:store`).
- [ ] Chrome DevTools, Lighthouse panel, Mobile: run it on `/` and
  `/checkout/cancel`. Record the four scores and the Core Web Vitals (LCP, CLS,
  TBT).
- [ ] Look at each flagged item and decide: fix it, or note why not.
- [ ] Fix what's worth fixing. Re-run and record the new scores.
- [ ] Write the before and after scores in "Notes to self."

## 2. Lighthouse CI with a budget

Branch: `store/lighthouse-ci`

- [ ] Install `@lhci/cli` in the store workspace.
- [ ] `lighthouserc` config: production build, `/` and `/checkout/cancel`,
  3 runs each, mobile settings, score assertions from the decisions above.
- [ ] Run it locally and read the report.
- [ ] CI job `lighthouse`, with the Contentful secrets on the build step.
  (CI config change: approve it.)
- [ ] Prove the budget can fail (throwaway branch), then clean up.
- [ ] Add `lighthouse` as a required check on `main`.

## 3. Store Docker image

Branch: `docker/store`

- [ ] Read the Next 16 docs on `output: "standalone"` and self-hosting.
- [ ] Turn on standalone output and confirm `next build` still works.
- [ ] `apps/store/Dockerfile`: multi-stage build from the repo root (workspace
  install), Contentful passed as BuildKit secrets, non-root runtime user.
- [ ] `.dockerignore` at the repo root.
- [ ] `docker build` and `docker run` it. The store loads on port 3001.

## 4. API Docker image

Branch: `docker/api`

- [ ] `apps/api/Dockerfile`: slim Python image, install requirements, run with
  uvicorn, non-root user.
- [ ] `docker build` and `docker run` it. `/health` answers on port 8000.

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

| Page | When | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | baseline | | | | | | | |
| `/checkout/cancel` | baseline | | | | | | | |

### Commands I had to look up

-

### Errors I hit and what fixed them

-
