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

### Commands I had to look up

- `API_URL= npm run build:store` and `API_URL= npm run start:store`: run a
  production build with `API_URL` empty for one command, to match production.
- Chrome incognito (Cmd+Shift+N), DevTools (Cmd+Option+I), Lighthouse tab:
  Mode Navigation, Device Mobile, all four categories.
- `curl -s http://localhost:3001/ | grep -c 'as="font"'`: counts the font
  preload tags in the page's HTML.

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
