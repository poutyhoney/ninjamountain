# Store: Week 3 checklist

Goal for the week: the store has unit tests and end-to-end tests that gate
merges in CI, a Stripe test-mode checkout, zero axe violations, and a manual
keyboard and VoiceOver pass against WCAG 2.2 AA.

Work through this with Claude Code in teaching mode (see `/CLAUDE.md`). One PR
per section. Check items off as you go.

## Decisions made up front

- **Checkout is Stripe Checkout in test mode.** A "Choose" button calls a
  server action, which creates a Checkout Session and redirects to Stripe's
  hosted page. Card details never touch the app.
- **The server sets the price.** The button sends only the belt slug. The
  server action looks up `priceCents` from Contentful and builds the Stripe
  price from it.
- **Checkout lives in Next.js, not FastAPI.** The API is local-only until
  week 5, and checkout must work on the live store.
- **White Belt** shows "Start free" with no checkout.
- **No webhooks this week.** Granting the belt after payment comes later. The
  success page confirms the session only.
- **Playwright stops at Stripe's door.** It asserts the redirect to
  `checkout.stripe.com` and tests the success and cancel pages directly.
  Stripe's hosted page is not automated.
- **Unit tests cover synchronous components only.** Vitest doesn't support
  async server components, so `EntitlementsPanel` and the page are covered by
  Playwright.

## 0. Environment check (every session)

```bash
cd ~/NinjaMountain/dotblack/ninjamountain
nvm use
node -v            # expect v22.x
git switch main && git pull
git status
```

## 1. Vitest and React Testing Library

Branch: `store/vitest`

- [x] Read `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`.
- [x] Install Vitest, React Testing Library, and jsdom in the store workspace.
- [x] `vitest.config.mts`, plus `test` and `test:coverage` scripts (store and
  root).
- [x] Tests for `PriceTag` (free, monthly, yearly), `PerkList`, `Badge`,
  `OfferCard`, and every `EntitlementsSummary` state.
- [x] Tests for `getEntitlements` with a mocked `fetch`: success, HTTP error,
  network error.
- [x] Coverage report runs locally.
- [x] CI `store` job runs the tests. (CI config change: approve it.)

## 2. Stripe test-mode checkout

Branch: `store/stripe-checkout`

- [x] Create a Stripe account and stay in **test mode** (you do this; Claude
  can't create accounts).
- [x] Copy the **test** secret key (`sk_test_...`) into
  `apps/store/.env.local` as `STRIPE_SECRET_KEY`. Never commit it, never paste
  it in chat.
- [x] Install the `stripe` package in the store workspace.
- [x] Server action: takes a slug, looks up the offer from Contentful, creates
  a Checkout Session, redirects.
- [x] "Choose" button on paid belts, "Start free" on White Belt.
- [x] `/checkout/success` reads the session and confirms. Cancel returns to
  the pricing page.
- [x] Pay with Stripe's test card `4242 4242 4242 4242` and see the success
  page.
- [x] Add `STRIPE_SECRET_KEY` (test key) to Vercel, GitHub secrets, and GitLab
  variables.

## 3. Playwright end-to-end tests

Branch: `store/playwright`

- [ ] Read `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md`.
- [ ] Install Playwright and one browser (Chromium).
- [ ] Test: the pricing page shows three belts.
- [ ] Test: "Choose Brown Belt" redirects to `checkout.stripe.com`.
- [ ] Test: the success and cancel pages render.
- [ ] CI job for Playwright, with the Contentful and Stripe secrets on the
  steps that need them.

## 4. Accessibility checks in CI

Branch: `store/axe`

- [ ] `@axe-core/playwright` scans the pricing, success, and cancel pages.
- [ ] Fix every violation it finds until the count is zero.
- [ ] The scans run in the Playwright CI job.
- [ ] Optional: Storybook's a11y addon, so each story shows its violations.

## 5. Manual keyboard and VoiceOver pass

Branch: `store/a11y-notes`

- [ ] Keyboard only: Tab through the whole flow. Every control is reachable,
  focus is always visible, and order makes sense.
- [ ] VoiceOver (Cmd+F5): headings, buttons, prices, and the entitlements
  states are announced sensibly.
- [ ] Fix what you find.
- [ ] Write an "Accessibility" section in `apps/store/README.md`: what was
  tested, how, and known gaps.

## 6. Tests gate merges

- [ ] Add the new Playwright job as a required status check on `main`.
- [ ] Confirm a failing test blocks a PR (try it on a throwaway branch).

## Done when

- Unit tests and Playwright run in CI and are required to merge
- A coverage report exists
- Stripe test checkout works on the live store
- Zero axe violations
- Accessibility notes are in the store README

## Notes to self (fill in as you go)

### Commands I had to look up

-

### Errors I hit and what fixed them

-
