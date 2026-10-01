# Ninja Mountain Arcade

A subscription storefront for Ninja Mountain Arcade: training challenges
grouped into training grounds, sold as belt tiers. This is the web UI
ramp-up project in the Ninja Mountain monorepo.

Live:

- Store: https://ninjamountain-store.vercel.app/
- Storybook: https://ninjamountain-storybook.vercel.app

## Run it locally

From the repo root, not this folder:

```bash
nvm use
npm install
npm run dev:store
```

Then open http://localhost:3001. (The dojo site, `apps/web`, uses port 3000.)

## Checks

These run in CI on every PR:

```bash
npm run lint:store
npm run typecheck:store
npm run build:store
```

## Where things are

- `lib/offers.ts`: the `Offer` type and the belt-tier data (hardcoded for now)
- `app/components/OfferCard.tsx`: renders one offer
- `app/page.tsx`: the pricing page
- `app/globals.css`: Ninja Mountain color tokens and fonts

## Deploys

Vercel project `ninjamountain-store`, root directory `apps/store`. Merging to
`main` deploys production. Vercel skips the build when nothing in this app
changed.