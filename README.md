# Ninja Mountain

A personal dojo for rebuilding web development skills. One monorepo holds a
learning site, a subscription storefront, the API behind it, and the
infrastructure that ships them.

- **Store (Ninja Mountain Arcade):** https://ninjamountain-store.vercel.app/
  ([README](apps/store/README.md))
- **Storybook:** https://ninjamountain-storybook.vercel.app/
- **Arcade demo video (3 min):** https://youtu.be/uUhHOkLDlnM
- **Dojo site:** https://www.ninjamountain.black/ (start with the
  [TSE onboarding plan](https://www.ninjamountain.black/projects/onboard))

## What's here

| Folder                                         | What it is                                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [`apps/store`](apps/store/README.md)           | Next.js 16 storefront: belt-tier subscriptions, Stripe, the streaming Sensei                  |
| [`apps/web`](apps/web)                         | Next.js 16 dojo site: learning trails (TSE onboarding first), concepts, and project write-ups |
| [`apps/api`](apps/api)                         | FastAPI: entitlements, experiment events, Sensei hints from Claude                            |
| [`apps/api/evals`](apps/api/evals/README.md)   | The Sensei hint eval                                                                          |
| [`infra/`](infra/README.md)                    | Terraform for AWS: ECR, ECS Express, OIDC deploy role, SSM secrets                            |
| [`k8s/`](k8s/README.md)                        | The whole stack on a local kind cluster, with Traefik                                         |
| [`packages/triage`](packages/triage/README.md) | Support ticket triage pipeline powered by Claude                                              |
| [`packages/ui`](packages/ui/tokens.css)        | Brand color tokens shared by both Next.js apps                                                |
| [`compose.yaml`](compose.yaml)                 | Local stack: store, API, Postgres, GrowthBook                                                 |

## Local development

Node 22 and npm workspaces. Install once, from the repo root:

```bash
nvm use
npm install
```

Then, each in its own terminal tab:

```bash
npm run dev:web     # dojo site, http://localhost:3000
npm run dev:store   # store, http://localhost:3001
npm run dev:api     # API, http://localhost:8000
```

`dev:api` needs the Python virtual environment in `apps/api/.venv`. Each
app's README has its own setup and env vars.

## CI/CD

Every PR runs lint, typecheck, tests, and build for each app, plus e2e,
Lighthouse, and Semgrep (`.github/workflows/ci.yml`). A GitLab CI mirror
runs the same core checks (`.gitlab-ci.yml`). Branch protection on `main`
requires them to pass.

- **Store and dojo site:** merging to `main` deploys to production on
  Vercel. PRs get preview deployments.
- **API:** `deploy-api.yml` builds the image, pushes it to ECR, and deploys
  to ECS through GitHub OIDC (no stored AWS keys). The API only runs during
  work sessions; see [infra/](infra/README.md).
