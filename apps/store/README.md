# Ninja Mountain Arcade

A subscription storefront for Ninja Mountain Arcade: training challenges
grouped into training grounds, sold as belt tiers. This is the web UI
ramp-up project in the Ninja Mountain monorepo.

Live:

- Store: https://ninjamountain-store.vercel.app/
- Storybook: https://ninjamountain-storybook.vercel.app/

## How it fits together

- **Contentful** holds the offers (names, prices, perks, badges). The pricing
  page reads them at build time and refreshes them every 60 seconds (ISR).
- **The FastAPI app** (`apps/api`) serves the user's entitlements. The store
  only shows the entitlements panel when `API_URL` is set, so production shows
  offers only.
- **Stripe** (test mode) handles checkout. The "Choose" button calls a server
  action that looks up the price from Contentful and redirects to Stripe's
  hosted page.
- **GrowthBook** (self-hosted, local only) runs A/B tests. The store records
  exposures and checkout starts through the API into Postgres, and
  GrowthBook reads them for analysis. See [EXPERIMENTS.md](EXPERIMENTS.md).
- **Google Analytics 4** records page views and a `select_belt` event on the
  live store.
- **The Sensei** gives streaming hints on training challenges from Claude
  (Anthropic API). The browser calls the store, the store calls FastAPI, and
  FastAPI calls Anthropic, so the API key and token never reach the browser.
  Shown only when `API_URL` is set.

## Run it locally

From the repo root, not this folder:

```bash
nvm use
npm install
cp apps/store/.env.example apps/store/.env.local   # then fill in the values
npm run dev:store
```

Then open http://localhost:3001. The dojo site (`apps/web`) uses port 3000.

`.env.local` needs `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, and
`STRIPE_SECRET_KEY` (a `sk_test_` key). `API_URL` is optional. To see the
entitlements panel, also run the API in another terminal tab:

```bash
cd apps/api && source .venv/bin/activate && fastapi dev main.py
```

## Run it with Docker

One command builds and starts the store and the API:

```bash
npm run docker:up
```

Then open http://localhost:3001. The store reaches the API at
`http://api:8000` over the Compose network, so the entitlements panel works.
Stop and remove everything with:

```bash
npm run docker:down
```

Needs Docker Desktop running and `apps/store/.env.local` filled in.
`docker:up` loads that file into the shell, the Contentful values reach the
store build as BuildKit secrets (never stored in the image), and the running
store gets the same file through `env_file`.

## Checks

These run in CI on every PR. All of them must pass to merge.

```bash
npm run lint:store
npm run typecheck:store
npm run test:coverage:store   # Vitest + React Testing Library, with a coverage table
npm run build:store
npm run e2e:store             # Playwright: checkout flow + axe scans (build first)
npm run lighthouse:store      # Lighthouse CI budgets (build first)
```

For `e2e:store` and `lighthouse:store`, build first with `API_URL` unset so
the page matches production:

```bash
API_URL= npm run build:store
API_URL= npm run lighthouse:store
```

Lighthouse budgets (mobile): Performance 90+, Accessibility 100, Best
Practices 90+, SEO 90+.

## Storybook

```bash
npm run storybook:store         # dev server at http://localhost:6006
npm run build-storybook:store   # static build in apps/store/storybook-static
```

Stories cover every component state, including ones the pages don't show in
tests (API error, loading, empty perk list). The a11y addon runs axe on each
story.

## Accessibility

Target: WCAG 2.2 AA.

### How it's tested

- **Automated, on every PR:** Playwright runs axe against the pricing and
  cancel pages (`e2e/a11y.spec.ts`). Any WCAG 2.2 A or AA violation fails CI.
  Lighthouse CI requires an Accessibility score of 100.
- **Component level:** Storybook's a11y addon runs axe on every story. All
  stories: 0 violations.
- **Unit tests:** React Testing Library queries by role (`heading`, `button`,
  `status`, `region`), so a lost heading or unnamed button fails a test.
- **Manual keyboard pass:** every control is reachable with Tab, focus is
  always visible, the order matches reading order, and there are no keyboard
  traps. The full flow (choose a belt, Stripe, cancel or success) works with
  Enter alone.
- **Manual screen reader pass (VoiceOver, Safari):** checked page titles,
  heading structure, landmarks, button names, and how prices are read. The
  accessibility tree was also reviewed as text with Playwright's
  `ariaSnapshot()`.

### Fixed during the audit

- The "Most popular" badge was read before the belt name. It now follows the
  heading in the code and keeps its visual position.
- Prices were read as "slash month." Screen readers now hear "per month."
- The default 1px focus ring was hard to see on the dark background. All
  focusable elements now get a 2px lavender ring with an offset.

### Known gaps

- The success page isn't scanned by axe in CI, because it needs a completed
  Stripe session. It was checked by hand.
- When the entitlements panel finishes loading or fails, the result isn't
  announced to screen readers (WCAG 4.1.3). Only the loading state is.
- Offer cards are `article` elements without names, so they appear unnamed in
  a screen reader's landmark list.
- Stripe's hosted checkout page is Stripe's responsibility and isn't covered
  by these tests.

## Experiments (GrowthBook)

Experiments run only on your machine. The experiment code turns on only when
`GROWTHBOOK_API_HOST` and `GROWTHBOOK_CLIENT_KEY` are set. Vercel and CI
don't set them, so production always shows the control layout.

### What runs where

| Service            | Where                                     | What it is                                                |
| ------------------ | ----------------------------------------- | --------------------------------------------------------- |
| `events-db`        | `localhost:5433`                          | Postgres with the `events` table                          |
| `api`              | `localhost:8000`                          | FastAPI; `POST /events` writes to Postgres                |
| `growthbook`       | UI `localhost:3200`, API `localhost:3300` | Feature flags, experiments, analysis                      |
| `growthbook-mongo` | Compose network only                      | GrowthBook's own settings                                 |
| `store`            | `localhost:3001`                          | The store; reaches GrowthBook at `http://growthbook:3100` |

### One-time setup

1. Create the root `.env` (gitignored) with two random values for
   GrowthBook. From the repo root:

   ```bash
   printf 'GROWTHBOOK_JWT_SECRET=%s\n' "$(openssl rand -hex 32)" >> .env
   printf 'GROWTHBOOK_ENCRYPTION_KEY=%s\n' "$(openssl rand -hex 32)" >> .env
   ```

   Compose refuses to start GrowthBook without them.

2. Start the backing services:

   ```bash
   docker compose up -d events-db api growthbook-mongo growthbook
   ```

3. Open http://localhost:3200, create an account (stored only in the local
   MongoDB), and set up:
   - An SDK connection (Node.js). Copy its client key.
   - A feature `offer-card-layout` (string, default `control`) with an
     experiment rule: hash attribute `id`, variations `control` and
     `cta-first`, 50/50.
   - A Postgres data source: host `events-db`, port `5432`, the read-only
     `growthbook_reader` role. Use identifier type `id`.
   - The assignment query, fact table, and metrics from
     [EXPERIMENTS.md](EXPERIMENTS.md).

4. In `apps/store/.env.local`, set `GROWTHBOOK_API_HOST`
   (`http://localhost:3300`), `GROWTHBOOK_CLIENT_KEY`, and
   `API_URL` (`http://localhost:8000`).

### Each session

From the repo root:

```bash
npm run docker:up -- -d
docker compose ps
```

The `-- -d` passes `-d` to `docker compose up`, so the containers keep
running in the background. All five services should show `running`.

Inside Compose, the store reaches GrowthBook by service name
(`http://growthbook:3100`), which overrides the `localhost` value in
`.env.local`. Port `3100` is GrowthBook's port inside its container; `3300`
is the same port mapped onto your machine.

Check that both layouts are served:

```bash
for i in 1 2 3 4 5 6; do curl -s -H "Cookie: nm_vid=compose-check-$i" http://localhost:3001/ | grep -o 'data-layout="[a-z-]*"' | head -1; done
```

You should see a mix of `control` and `cta-first`, and the same visitor
always gets the same one. Each request records an exposure:

```bash
docker compose exec events-db psql -U events -d events -c "SELECT event_name, visitor_id, properties FROM events ORDER BY id DESC LIMIT 5;"
```

To work on the store code with the experiment on, run only the backing
services in Compose and the store with npm (`npm run build:store`, then
`npm run start:store`). `start:store` serves the last build, so rebuild
after every code change.

### Simulated traffic

`apps/api/scripts/simulate_traffic.py` sends fake visitors through the real
store page and records checkouts at a known rate per variation. In a third
tab:

```bash
cd apps/api && source .venv/bin/activate
python scripts/simulate_traffic.py --visitors 5000
```

Options: `--control-rate`, `--treatment-rate`, `--think-seconds` (the delay
before a conversion), and `--seed`. Empty the table first so old rows don't
mix in:

```bash
docker compose exec events-db psql -U events -d events -c "TRUNCATE events;"
```

Then click **Update** on the experiment's Results tab in GrowthBook.

## Analytics (GA4)

The root layout loads Google Analytics 4 through `@next/third-parties` when
`NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. The measurement ID is public (it
ships in the page), so it's config, not a secret.

- **Page views:** sent on every page load and client-side navigation.
- **`select_belt`:** sent when a visitor clicks "Choose," with the belt name,
  price, and currency (`ChooseButton.tsx`).
- **Debug mode:** on outside production, so local events show up in GA4's
  DebugView instead of the main reports.

Because it's a `NEXT_PUBLIC_` variable, it's baked in at build time. After
changing it on Vercel, redeploy.

## The Sensei (streaming hints)

A student picks a challenge, asks a question, and the hint streams in as it
is written. The Sensei nudges; it never gives the answer.

### How a hint travels

1. `SenseiPanel` (client component) POSTs to `/api/sensei`.
2. The route handler (`app/api/sensei/route.ts`) adds the API token and
   passes the request to FastAPI's `POST /sensei/hint`. It streams the
   response body straight back and forwards the browser's abort signal.
3. FastAPI checks the token, the challenge, the belt, and the daily limit,
   then streams Claude's answer.

The stream is NDJSON, one JSON object per line:

```
{"type": "text", "text": "Start at the end"}
{"type": "done", "remaining": 7}
```

Errors after the stream starts arrive as `{"type": "error", "message": ...}`.
A stream that ends without `done` is treated as cut off.

### What the panel handles

- **Stop** aborts the request through every hop (browser, route handler,
  FastAPI, Anthropic). The partial hint stays on screen.
- **Retry** after an error sends the same question again.
- **Daily limit:** White Belt 3, Brown Belt 10, Black Belt 30. Over the
  limit, the API returns 429 with `Retry-After`, and the panel says when
  more hints arrive. A failed stream gives the hint back; Stop does not,
  because the tokens were already used.
- **Accessibility:** the answer area is `aria-live="polite"` with
  `aria-busy` while streaming, so screen readers read the finished hint
  once. Errors use `role="alert"`. Focus moves to Stop when a hint starts
  and back to the question box when it ends.

### Quality

A 20-question eval scores the hints (see
[apps/api/evals/README.md](../api/evals/README.md)). With the current prompt,
60 of 60 hints were judged good, with no answers revealed and no Markdown.

### Try it locally

Run the API (`docker compose up -d api`) with `ANTHROPIC_API_KEY` in the
root `.env`, and the store with `API_URL` set. Then open
http://localhost:3001/sensei.

## Where things are

```
app/
  page.tsx                  Pricing page (offers + entitlements panel)
  layout.tsx, fonts.ts      Root layout and self-hosted fonts
  globals.css               Tailwind setup, brand tokens, focus ring
  checkout/
    actions.ts              Server action: creates the Stripe Checkout Session
    success/, cancel/       Pages Stripe returns to
  sensei/page.tsx           The Sensei page (challenge list from the API)
  api/sensei/route.ts       Route handler: proxies the hint stream to FastAPI
  components/
    OfferCard.tsx           One offer (uses Badge, PriceTag, PerkList)
    CheckoutButton.tsx      "Choose" form, or "Free forever" for White Belt
    ChooseButton.tsx        The "Choose" button; sends the GA4 event
    EntitlementsPanel.tsx   Fetches entitlements (async server component)
    EntitlementsSummary.tsx Renders them, plus the loading skeleton
    SenseiPanel.tsx         Ask, Stop, Retry; reads the NDJSON stream
    *.stories.tsx           Storybook stories
    *.test.tsx              Unit tests
lib/
  offers.ts                 The Offer type
  contentful.ts             Fetches offers from Contentful
  entitlements.ts           Fetches entitlements from the API
  stripe.ts                 Server-only Stripe client
  growthbook.ts             Server-only GrowthBook client; picks the layout
  events.ts                 Sends experiment events to the API
  visitor.ts                Visitor ID cookie and header names
  sensei.ts                 Server-only: challenge list and API token header
  sensei-types.ts           Challenge and stream line types (shared)
  ndjson.ts                 Turns a byte stream into parsed lines
proxy.ts                    Gives each visitor an ID (experiments only)
e2e/                        Playwright tests (checkout flow, axe scans)
Dockerfile                  Multi-stage image (standalone output)
lighthouserc.json           Lighthouse CI budgets
EXPERIMENTS.md              A/B test readouts
```

## Deploys

- **Store:** Vercel project `ninjamountain-store`, root directory
  `apps/store`. Merging to `main` deploys production. PRs get preview
  deployments.
- **Storybook:** Vercel project `ninjamountain-storybook`, same root
  directory, built with `npm run build-storybook`.
- The store project needs `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`,
  and `STRIPE_SECRET_KEY` set for Production and all Preview branches.
  `NEXT_PUBLIC_GA_MEASUREMENT_ID` turns on GA4. `API_URL` and the GrowthBook
  variables are not set on Vercel. Storybook needs no
  environment variables.
- Vercel skips a project's build when nothing it depends on changed. Changes
  outside the npm workspaces (like `apps/api` or `.github/`) still build both.

## Known gaps: experiments and analytics

- **No cookie consent.** GA4 loads for every visitor with no consent banner.
  That's fine for a demo store but not for real EU traffic, which needs
  consent before analytics cookies (or Google's Consent Mode).
- **GrowthBook image isn't pinned.** `compose.yaml` uses
  `growthbook/growthbook:latest`, so a new release could change behavior.
  Pin a version tag for anything long-lived.
- **Experiments are local only.** GrowthBook and the events database aren't
  deployed to AWS or Vercel, so live visitors never enter the experiment.
- **Exposure timing.** Exposures are recorded with `after()`, so a very fast
  follow-up event can land first. See the caveats in
  [EXPERIMENTS.md](EXPERIMENTS.md).

## Known gaps: the Sensei

- **The daily limit lives in memory.** It resets when the API restarts, and
  with several API pods (see `k8s/`) each pod counts separately. A shared
  store (Redis or Postgres) would fix both.
- **The entitlements fetch doesn't send the API token.** Against the ECS
  API, the entitlements panel shows a 401. The Sensei sends the token.
- **Production doesn't show the Sensei.** The API only runs on AWS during
  work sessions, and Vercel doesn't set `API_URL`.
- **The eval's judge isn't checked against human labels yet,** and its
  headline score is at 100%, so it catches regressions better than small
  improvements.
