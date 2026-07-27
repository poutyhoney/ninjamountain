# Ninja Mountain

A personal project dojo for rebuilding web development skills.

## Local apps

- `apps/web` — Next.js / TypeScript frontend
- `apps/api` — FastAPI backend

## Local development

Frontend:

```bash
npm run dev:web
```

Backend:

```bash
npm run dev:api
```

## CI/CD

PRs must pass CI (lint, typecheck, build, tests) before merging to `main` — enforced by branch protection, not just convention. `main` auto-deploys to production via Vercel's git integration, so a green PR is what actually reaches the live site. See [`docs/cicd-training-guide.md`](docs/cicd-training-guide.md) for how the pipeline was built.