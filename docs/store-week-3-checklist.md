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

- [x] Read `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md`.
- [x] Install Playwright and one browser (Chromium).
- [x] Test: the pricing page shows three belts.
- [x] Test: "Choose Brown Belt" redirects to `checkout.stripe.com`.
- [x] Test: the success and cancel pages render.
- [x] CI job for Playwright, with the Contentful and Stripe secrets on the
  steps that need them.

## 4. Accessibility checks in CI

Branch: `store/axe`

- [x] `@axe-core/playwright` scans the pricing, success, and cancel pages.
- [x] Fix every violation it finds until the count is zero.
- [x] The scans run in the Playwright CI job.
- [x] Optional: Storybook's a11y addon, so each story shows its violations.

## 5. Manual keyboard and VoiceOver pass

Branch: `store/a11y-notes`

- [x] Keyboard only: Tab through the whole flow. Every control is reachable,
  focus is always visible, and order makes sense.
- [x] VoiceOver (Cmd+F5): headings, buttons, prices, and the entitlements
  states are announced sensibly.
- [x] Fix what you find.
- [x] Write an "Accessibility" section in `apps/store/README.md`: what was
  tested, how, and known gaps.

## 6. Tests gate merges

- [x] Add the new Playwright job as a required status check on `main`.
- [x] Confirm a failing test blocks a PR (try it on a throwaway branch).

## Done when

- Unit tests and Playwright run in CI and are required to merge
- A coverage report exists
- Stripe test checkout works on the live store
- Zero axe violations
- Accessibility notes are in the store README

## Notes to self (fill in as you go)

### Commands I had to look up

- `npm run test:store` and `npm run test:coverage:store`: run Vitest once, or
  with a coverage table and an HTML report in `apps/store/coverage/`.
- `npm run e2e:store -- a11y.spec.ts`: the `--` (with a space after it)
  passes the filename through npm to Playwright, so only that file runs.
- `npx playwright install chromium`: downloads the browser Playwright drives.
  CI adds `--with-deps` for the Linux system libraries.
- `npm run`: with no script name, lists every script in that `package.json`.
- `gh pr view N --json state --jq .state`: confirms a PR really is `MERGED`
  or `CLOSED`.
- `gh pr create --draft`: opens a PR marked not ready, for throwaway tests.
- `gh pr close N --delete-branch`: closes without merging and deletes the
  remote branch.
- `git commit -am "..."`: stages every changed tracked file and commits in
  one step. New files still need `git add`.
- `git branch -D <branch>`: deletes a local branch that was never merged.

### Errors I hit and what fixed them

**1. `Unterminated string` in `vitest.setup.ts`** (section 1)

- **What happened:** Vitest found 0 tests and failed with
  `[PARSE_ERROR] Unterminated string` at line 4.
- **Why:** the line ended `"vitest”` with a curly closing quote. To
  JavaScript, `”` is just a character, so the string never closed. The setup
  file runs before every test file, so nothing could load.
- **Fix:** replace `”` with a straight `"`.
- **Prevention:** keep "Use typographer's quotes" off for every code language
  in BBEdit, and don't copy code from rich-text apps.

**2. `vite-tsconfig-paths` notice** (section 1)

- **What happened:** Vitest printed that Vite now resolves tsconfig paths
  natively.
- **Why:** the Next.js guide was written for older Vite. Vite 8 reads the
  `@/*` alias from `tsconfig.json` itself.
- **Fix:** uninstall the plugin and set `resolve.tsconfigPaths: true` in
  `vitest.config.mts`.

**3. Two entitlements tests merged into one** (section 1)

- **What happened:** 1 test failed. It expected "Could not reach API." but
  got "The API returned 500."
- **Why:** the file had 2 tests instead of 3. The "cannot be reached" test
  had the 500 test's mock (`mockResolvedValue` with status 500), and its
  expected message was missing "the". The code was right; the test was wrong.
- **Fix:** paste the full file again. "Cannot be reached" needs
  `mockRejectedValue`, which makes `fetch` throw.
- **Lesson:** in Vitest's diff, `-` is what the test expected and `+` is what
  the code returned.

**4. Root Storybook scripts disappeared** (section 4)

- **What happened:** `npm run storybook:store` said "Missing script."
- **Why:** in PR #31, the two new `test:` lines were pasted over the last two
  lines of `"scripts"` (the Storybook shortcuts) instead of after them.
- **Fix:** add the shortcuts back to the root `package.json`.
- **Lesson:** to add to the end of a JSON list, put a comma on the current last
  line, then paste the new lines after it.

**5. Scripts added to the wrong `package.json`** (section 4)

- **What happened:** after adding the Storybook shortcuts back, `npm run` still
  didn't list them.
- **Why:** they went into `apps/store/package.json`, not the root. `npm run`
  from the repo root only reads the root file.
- **Fix:** remove them from the app file and add them to the root file.
- **Lesson:** check the `"name"` line at the top. `ninjamountain` is the root;
  `store` is the app. The `:store` shortcuts belong only in the root.

**6. `npm run e2e:store --a11y.spec.ts` ran every test** (section 4)

- **What happened:** npm printed "Unknown cli config" warnings and Playwright
  ran all 6 tests instead of 2.
- **Why:** without a space after `--`, npm read `--a11y.spec.ts` as one of its
  own options, and Playwright never saw the filename.
- **Fix:** `npm run e2e:store -- a11y.spec.ts`.

**7. axe failure output was too noisy to read** (section 4)

- **What happened:** a deliberate contrast failure printed 58 lines of raw axe
  data.
- **Why:** `expect(results.violations).toEqual([])` prints whole objects.
- **Fix:** `flatMap` each violation into one line (rule, impact, failure
  summary, element HTML) and assert that list is empty.
- **Lesson:** make a test prove it can fail before trusting it passes.

**8. Tab 3 on the pricing page highlighted nothing** (section 5)

- **What happened:** Tab reached the two "Choose" buttons, then a third Tab
  showed no focus on the page.
- **Why:** the buttons are the only interactive elements, so focus moved out of
  the page into Safari's toolbar. That's correct behavior, not a keyboard trap.

**9. VoiceOver was overwhelming** (section 5)

- **What happened:** constant speech made it hard to take notes or type.
- **Fix:** read the accessibility tree as text instead (Playwright's
  `ariaSnapshot()`), and keep VoiceOver for short, targeted checks. VoiceOver
  Utility can mute speech and show a caption panel instead.

**10. Skipped steps when pasting commands together** (sections 2 and 5)

- **What happened:** PR #32 wasn't merged when I moved on, and the a11y fixes
  commit never happened, so PR #35 shipped only the README.
- **Fix:** merge #32; follow-up PR #36 with the fixes.
- **Habit:** one command at a time. After a commit, read
  `git log --oneline -1`. After a merge, run
  `gh pr view N --json state --jq .state`.
