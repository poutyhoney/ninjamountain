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

- [x] Read the Next 16 docs on data fetching, `loading.tsx`, and `error.tsx`
  before writing code.
- [x] `API_URL` in `apps/store/.env.local` (and a committed `.env.example`).
- [x] A typed fetch function for `/entitlements/me`.
- [x] An entitlements panel with a loading state and an error state. Stop the
  API and confirm the error state shows.
- [x] With `API_URL` unset, the panel doesn't render and the build still passes.

## 4. Contentful: offers and training grounds

Branch: `store/contentful`

- [x] Create a free Contentful account and space (you do this; Claude can't
  create accounts).
- [x] Content types: `offer` (slug, name, priceCents, billingPeriod, perks,
  badge, premium, kind: tier or add-on) and `trainingGround` (slug, name,
  description, required belt).
- [x] Enter the three belt tiers and at least two training grounds.
- [x] Create a Content Delivery API key. Put `CONTENTFUL_SPACE_ID` and
  `CONTENTFUL_ACCESS_TOKEN` in `.env.local`. Never commit them.
- [x] Typed Content Delivery API fetch that returns `Offer[]`.
- [x] Delete the hardcoded array from `lib/offers.ts`. Keep the `Offer` type.
- [x] Add both env vars to the `ninjamountain-store` Vercel project.
- [x] The live store shows the Contentful data.

## 5. Storybook

Branch: `store/storybook`

- [x] Check Storybook's Next.js 16 support before installing.
- [x] Stories for 5 components. Split `OfferCard` to get there: `OfferCard`,
  `PriceTag`, `PerkList`, `Badge`, plus the entitlements panel. (If the week
  runs long, 3 is fine.)
- [x] Decide where to publish it (Chromatic, GitHub Pages, or a static Vercel
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
1. What makes the Contentful Delivery token "least privilege" compared to the Preview token or a Management token?

In the simplest terms, the Contentful Delivery token is "least privilege" because it can only read published content, while the Preview token can read unpublished content and a Management token can potentially modify content.

2. Why do only the build:store step's env: lines get the secrets, and what would go wrong if every step had them?

Only the build:store step's env: lines get the secrets because it is the only step that needs to access Contentful.
Unrelated commands never receive the secrets in their process environments, reducing exposure. This Step-level scoping applies least privilege to what the token can do in Contentful as well as to which CI processes are allowed to possess it.

3. If the Delivery token leaked, what could an attacker do, and what couldn't they do? How would you rotate it?

As mentioned, if the Delivery token were to be leaked, an attacker would only be able to read published content, with no access to unpublished content or the ability to make any changes. To rotate a Contentful Content Delivery API (CDA) token, I'd have to manually create a new API key, update my application, and delete the old key, because Contentful does not feature a single-click "rotate" button for delivery tokens.

4. For a CI deploy key (like VERCEL_TOKEN), how would you limit it: scope, lifetime, or which branches can use it?

A Vercel token allows my GitHub Actions workflow to authenticate with Vercel and perform a deployment. The Vercel project configuration determines the project and associated domains.

I would limit a CI deploy credential in three ways.
Scope: give the CI identity access only to the Vercel projects and deployment capabilities it needs. don't use a broadly privileged personal credential.

Lifetime: prefer short-lived credentials when supported. otherwise, expire and rotate stored tokens.

Branch/environment access: store deployment credentials in protected GitHub Environments so, for example, PRs can access only preview deployment credentials while only main can access production credentials. I would also only expose the token to the individual deployment steps that require it. 

GitHub Environment protection rules provide an additional boundary before those secrets become available to a job.

5. What would replace a long-lived deploy key with short-lived credentials?

OIDC/federated authentication would replace a long-lived deploy key. In that case, the CI workflow proves its identity to the deployment provider and receives a short-lived credential for that run. The temporary credential expires automatically, reducing the risk if exposed.

### Commands I had to look up

- NA

### Errors I hit and what fixed them

**1. `"." is not exported under the condition "style"`** (section 1)

- **What happened:** `npm run build:web` failed after adding the shared tokens.
- **Why:** the web app's `globals.css` imported `@ninjamountain/ui` with no
  subpath. A bare package name asks for the package root (`"."`), but the
  `exports` map in `packages/ui/package.json` only lists `"./tokens.css"`.

**Fix:** import `@ninjamountain/ui/tokens.css`.

**Lesson:** `exports` blocks anything it doesn't list. That's the point of it.

**2. pytest only collected 3 tests** (section 2)

- **What happened:** `pytest -v` passed, but showed 3 tests instead of 7.
- **Why:** the new file was named `text_entitlements.py`. pytest only picks up
  `test_*.py` and `*_test.py`, so it skipped the file with no warning.

**Fix:** rename it to `test_entitlements.py`.

**Lesson:** check the test count, not just "passed."

**3. Tabs vs spaces in Python, twice** (sections 2 and 3)

- **What happened, first time:** ruff's `I001` flagged an import block. Four
  lines had spaces and one had a tab, so the diff looked identical.

**Fix:** `ruff check --fix` converted them to tabs.

- **What happened, second time:** a temporary `time.sleep(2)` typed with spaces
  in a tab-indented route caused a `TabError`. `fastapi dev` failed to reload
  but kept port 8000 open, so requests hung and the store showed the loading
  skeleton forever.

**Fix:** re-indent the lines with tabs.
- **Prevention:** turn on Show invisible characters in BBEdit, and add an
  `.editorconfig` to the repo.

**Side lesson:** the hang showed the store's fetch had no timeout, so I added
  `AbortSignal.timeout(5000)`.

**4. `CONTENFUL_` secret typo** (section 4)

- **What happened:** CI's `store` job failed with "CONTENTFUL_SPACE_ID and
  CONTENTFUL_ACCESS_TOKEN must be set."
- **Why:** I created the GitHub secrets as `CONTENFUL_SPACE_ID` and
  `CONTENFUL_ACCESS_TOKEN` (missing the second T). `ci.yml` asked for
  `secrets.CONTENTFUL_SPACE_ID`, and a secret that doesn't exist expands to an
  empty string, not an error. The guard clause in `getTierOffers` caught it.

**Fix:** `gh secret set` with the right names, then `gh secret delete` the
  wrong ones. Check with `gh secret list`.

**5. Vercel preview build had no Contentful vars** (section 4)

- **What happened:** the store preview kept failing with the same "must be set"
  error after GitHub was fixed.
- **Why:** in Vercel, Preview env vars can be limited to one Git branch.

**Fix:** set both vars for Production and all Preview branches (no branch
  filter), then Redeploy.

**Lesson:** Vercel copies env vars into a build when it starts. Changing them
  never fixes a build that already ran.

**6. Empty commit didn't rebuild the store on Vercel** (section 4)

- **What happened:** I pushed `git commit --allow-empty` to re-run everything.
  GitHub Actions re-ran, but Vercel reported "Skipped - Not affected."
- **Why:** Vercel's monorepo skip saw no changed files. The PR check showed
  green while no store build had succeeded.

**Fix:** Vercel dashboard, Deployments, the failed deploy, Redeploy.

**Lesson:** a green Vercel check can point to a skipped deployment. Open the
  preview URL to confirm.

**7. Part 5 commit never happened** (section 5)

- **What happened:** production Storybook showed 4 components instead of 5.
- **Why:** I pasted several git commands at once, and the `git add` and
  `git commit` for the EntitlementsSummary work didn't run. PR #28 merged
  without it. The same thing happened in week 1 with the CI change.

**Fix:** new branch (uncommitted changes carry over), commit, PR #29.

**Habit:** run commands one at a time, and read `git status` and
  `git log --oneline -1` before every push.
