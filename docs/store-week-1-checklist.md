# Store: Week 1 checklist

Goal for the week: `apps/store` exists as its own Next.js app in the monorepo,
has a live URL on its own Vercel project, CI checks it on every PR, and the first
components (offer card, page layout) are built with typed props.

Work through this with Claude Code in teaching mode (see `/CLAUDE.md`). Check
items off as you go.

## 0. Environment check (every session)

```bash
cd ~/NinjaMountain/dotblack/ninjamountain
nvm use            # reads .nvmrc -> Node 22
node -v            # expect v22.x
npm -v
git status         # know what's uncommitted before you start
git branch --show-current
gh auth status     # GitHub CLI logged in
vercel --version   # Vercel CLI (npm i -g vercel if missing)
```

## 1. Clean up `main` first

There are uncommitted edits (tse-onboarding trail pages, SiteHeader, TrailsList).
Put them on their own branch so the store work starts clean.

- [ ] `git switch -c trails/tse-onboarding-updates`
- [ ] `git add apps/web && git commit -m "Update TSE onboarding trail pages"`
  (includes the untracked `knowledge/` and `flex-sdk-troubleshooting/` folders)
- [ ] `git add CLAUDE.md docs/store-week-1-checklist.md && git commit -m "Add Claude teaching-mode notes and store week 1 checklist"`
- [ ] `git push -u origin trails/tse-onboarding-updates`
- [ ] `gh pr create --fill`, wait for CI, merge
- [ ] `git switch main && git pull`

## 2. Start the store branch

- [ ] `git switch -c store/week-1-scaffold`

## 3. Scaffold `apps/store`

Pin the same Next.js version as `apps/web` so the workspace shares one copy.
`--skip-install` matters: in a workspace, install from the root, not the app folder.

- [ ] Run:
  ```bash
  npx create-next-app@16.2.6 apps/store --ts --tailwind --eslint --app \
    --no-src-dir --import-alias "@/*" --use-npm --skip-install
  ```
  If it still prompts: TypeScript yes, ESLint yes, Tailwind yes, `src/` no,
  App Router yes, Turbopack yes, customize import alias no.
- [ ] In `apps/store/package.json`: set `"name": "store"`, add
  `"typecheck": "tsc --noEmit"`, and change `dev` to `next dev -p 3001`
  (apps/web already uses port 3000).
- [ ] Confirm `create-next-app` didn't create `apps/store/.git`
  (`ls -a apps/store`). Delete it if it did.

## 4. Wire it into the workspace

- [ ] Root `package.json`: add `"apps/store"` to `workspaces`.
- [ ] Root scripts: `dev:store`, `build:store`, `lint:store`, `typecheck:store`
  (copy the `:web` versions and swap the workspace).
- [ ] From the repo root: `npm install`
- [ ] `npm run dev:store`, then open http://localhost:3001
- [ ] `npm run lint:store && npm run typecheck:store && npm run build:store`
- [ ] Optional: add a `store` entry to `.claude/launch.json` (port 3001).

## 5. First components

Hardcoded data this week. The FastAPI offers endpoints come in week 2.

- [ ] `apps/store/lib/offers.ts`: an `Offer` type (id, name, price, billing
  period, perks, badge?) and a typed array of 3 sample offers.
- [ ] `apps/store/app/components/OfferCard.tsx`: typed props, renders one offer.
- [ ] `apps/store/app/page.tsx`: page layout that maps offers to cards.
  Responsive: one column on mobile, three on desktop.
- [ ] Fictional brand name and original art only.
- [ ] Ask Claude Code for the "comment it" pass once each file works.

## 6. CI

- [ ] `.github/workflows/ci.yml`: add a `store` job (copy `web`, swap the scripts).
- [ ] `.gitlab-ci.yml`: add the matching `store` job.
- [ ] Leave `deploy-preview` alone for now. It targets the `apps/web` Vercel
  project; Vercel's own git integration will build store previews.

## 7. Vercel project for the store

- [ ] Vercel dashboard: Add New > Project > import `poutyhoney/ninjamountain`.
- [ ] Root Directory: `apps/store`. Framework: Next.js. Name it after the
  fictional brand.
- [ ] On both Vercel projects, turn on skipping deployments when their root
  directory hasn't changed, so store PRs don't rebuild the dojo site and vice
  versa. (Check the current setting name in Vercel's monorepo docs.)

## 8. Ship it

- [ ] `git push -u origin store/week-1-scaffold` and `gh pr create --fill`
- [ ] CI green, Vercel preview works
- [ ] GitHub repo settings: add `store` as a required status check on `main`
- [ ] Merge. Confirm the production store URL loads.
- [ ] Start `apps/store/README.md`: what it is, live URL, how to run it locally.

## Done when

- Store has a live URL
- CI runs `store` on every PR and it's required
- Offer card and page layout are built, typed, and commented

## Notes to self (fill in as you go)

- Commands I had to look up:
- Errors I hit and what fixed them:
