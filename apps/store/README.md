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

## Where things are

```
app/
  page.tsx                  Pricing page (offers + entitlements panel)
  layout.tsx, fonts.ts      Root layout and self-hosted fonts
  globals.css               Tailwind setup, brand tokens, focus ring
  checkout/
    actions.ts              Server action: creates the Stripe Checkout Session
    success/, cancel/       Pages Stripe returns to
  components/
    OfferCard.tsx           One offer (uses Badge, PriceTag, PerkList)
    CheckoutButton.tsx      "Choose" form, or "Free forever" for White Belt
    EntitlementsPanel.tsx   Fetches entitlements (async server component)
    EntitlementsSummary.tsx Renders them, plus the loading skeleton
    *.stories.tsx           Storybook stories
    *.test.tsx              Unit tests
lib/
  offers.ts                 The Offer type
  contentful.ts             Fetches offers from Contentful
  entitlements.ts           Fetches entitlements from the API
  stripe.ts                 Server-only Stripe client
e2e/                        Playwright tests (checkout flow, axe scans)
Dockerfile                  Multi-stage image (standalone output)
lighthouserc.json           Lighthouse CI budgets
```

## Deploys

- **Store:** Vercel project `ninjamountain-store`, root directory
  `apps/store`. Merging to `main` deploys production. PRs get preview
  deployments.
- **Storybook:** Vercel project `ninjamountain-storybook`, same root
  directory, built with `npm run build-storybook`.
- The store project needs `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`,
  and `STRIPE_SECRET_KEY` set for Production and all Preview branches.
  `API_URL` is not set on Vercel. Storybook needs no environment variables.
- Vercel skips a project's build when nothing it depends on changed. Changes
  outside the npm workspaces (like `apps/api` or `docs/`) still build both.
