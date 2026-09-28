# Store: Week 2 checklist

Goal for the week: the store's offers come from Contentful instead of
hardcoded data, the FastAPI app serves entitlements the store can show, brand
tokens live in a shared `packages/ui`, and Storybook documents the components.

Work through this with Claude Code in teaching mode (see `/CLAUDE.md`). One PR
per section below, so each review stays small. Check items off as you go.

## Decisions made up front

- **The API runs locally only this week.** It gets a real cloud deploy in
  week 5. The live store must keep working without it.
- **Who owns what:**
  - Contentful owns content: offer names, display prices, perks, badges,
    training grounds. The live store reads it at build time.
  - FastAPI owns entitlements: which belt the user has, which grounds are
    unlocked, which add-ons they own. Checkout pricing logic joins it later.
- **No login yet.** Entitlements are for a hardcoded demo user until auth
  arrives.
- **The entitlements panel only renders when `API_URL` is set.** Locally it is
  set; on Vercel it is not, so production shows offers only.

## 0. Environment check (every session)

```bash
cd ~/NinjaMountain/dotblack/ninjamountain
nvm use
node -v            # expect v22.x
git status
git branch --show-current
git switch main && git pull
```

For API work, in its own terminal tab:

```bash
cd apps/api
source .venv/bin/activate
python --version
```

## 1. Shared brand tokens: `packages/ui`

Branch: `ui/shared-tokens`

- [x] Create `packages/ui` with a `package.json` named `@ninjamountain/ui` and a
  `tokens.css` holding the `--nm-*` palette.
- [x] Both apps depend on it (`"@ninjamountain/ui": "*"`), so Vercel knows a
  change to `packages/ui` affects both.
- [x] `apps/store/app/globals.css` and `apps/web/app/globals.css` import the
  tokens instead of defining them.
- [x] `npm install` from the root. Lint, typecheck, and build both apps.
- [x] Both sites look exactly the same as before.

## 2. FastAPI: entitlements endpoint

Branch: `api/entitlements`

- [x] Pydantic models for an entitlement response (belt, unlocked grounds,
  owned add-ons).
- [x] `GET /entitlements/me` returns the demo user's entitlements.
- [x] pytest: status code, response shape, and one test per belt rule.
- [x] `ruff check .` and `pytest` pass. CI's `api` job runs both.

## 3. Store: typed fetching with loading and error states

Branch: `store/entitlements-fetch`

- [ ] Read the Next 16 docs on data fetching, `loading.tsx`, and `error.tsx`
  before writing code.
- [ ] `API_URL` in `apps/store/.env.local` (and a committed `.env.example`).
- [ ] A typed fetch function for `/entitlements/me`.
- [ ] An entitlements panel with a loading state and an error state. Stop the
  API and confirm the error state shows.
- [ ] With `API_URL` unset, the panel doesn't render and the build still passes.

## 4. Contentful: offers and training grounds

Branch: `store/contentful`

- [ ] Create a free Contentful account and space (you do this; Claude can't
  create accounts).
- [ ] Content types: `offer` (slug, name, priceCents, billingPeriod, perks,
  badge, premium, kind: tier or add-on) and `trainingGround` (slug, name,
  description, required belt).
- [ ] Enter the three belt tiers and at least two training grounds.
- [ ] Create a Content Delivery API key. Put `CONTENTFUL_SPACE_ID` and
  `CONTENTFUL_ACCESS_TOKEN` in `.env.local`. Never commit them.
- [ ] Typed Content Delivery API fetch that returns `Offer[]`.
- [ ] Delete the hardcoded array from `lib/offers.ts`. Keep the `Offer` type.
- [ ] Add both env vars to the `ninjamountain-store` Vercel project.
- [ ] The live store shows the Contentful data.

## 5. Storybook

Branch: `store/storybook`

- [ ] Check Storybook's Next.js 16 support before installing.
- [ ] Stories for 5 components. Split `OfferCard` to get there: `OfferCard`,
  `PriceTag`, `PerkList`, `Badge`, plus the entitlements panel. (If the week
  runs long, 3 is fine.)
- [ ] Decide where to publish it (Chromatic, GitHub Pages, or a static Vercel
  project) and publish.

## 6. Cloud: IAM basics

- [ ] Read up on users, roles, groups, policies, and least privilege.
- [ ] Write five lines in "Notes to self" on how you'd scope a read-only
  Contentful token or a CI deploy key using the same idea.

## Done when

- The live store renders offers from Contentful
- Locally, the store shows entitlements from the API, with working loading and
  error states
- Brand tokens come from `packages/ui` in both apps
- Storybook is published

## Notes to self (fill in as you go)

- Commands I had to look up:
- Errors I hit and what fixed them:
