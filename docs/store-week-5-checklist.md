# Store: Week 5 checklist

Goal for the week: the FastAPI app runs on AWS (ECS Express Mode), built and
deployed from GitHub Actions on merge to `main`, with config from environment
variables, structured logs, a health check, a secret in a managed store,
CloudWatch logs and an alarm, all defined in Terraform, and
`terraform destroy` removes it cleanly.

Work through this with Claude Code in teaching mode (see `/CLAUDE.md`). One PR
per section. Check items off as you go.

## Decisions made up front

- **Platform: Amazon ECS Express Mode.** App Runner stopped accepting new
  customers on April 30, 2026, and AWS recommends Express Mode instead. It
  creates a Fargate service, an HTTPS load balancer, auto scaling, a log group,
  and an alarm from one Terraform resource.
- **Cost control: create per session, destroy after.** The load balancer and
  task cost roughly 4 cents an hour while up (estimate; check AWS pricing).
  Running it all month would be about $25 to $30. A $10 billing alert is the
  safety net.
- **No root account for daily work.** You sign in to the CLI through IAM
  Identity Center (short-lived credentials). GitHub Actions deploys through
  OIDC with a least-privilege role, so no long-lived AWS keys exist anywhere.
- **The store stays on Vercel.** Whether the live store calls the deployed API
  is decided at the end of the week, since the API won't run all the time.

## 0. Environment check (every session)

```bash
cd ~/NinjaMountain/dotblack/ninjamountain
git switch main && git pull
git status
aws sts get-caller-identity   # after section 1: shows who the CLI is signed in as
terraform -version            # after section 1
```

## 1. AWS account safety and tools

No branch needed (console and installs only).

- [ ] Root user has MFA turned on.
- [ ] AWS Budgets: a $10 monthly cost budget with an email alert.
- [ ] IAM Identity Center turned on, with a user for you and an admin
  permission set (for learning; CI gets a narrow role later).
- [ ] Install the AWS CLI and Terraform with Homebrew.
- [ ] `aws configure sso`, then `aws sts get-caller-identity` works.

## 2. API ready for production

Branch: `api/production-ready`

- [ ] Config from environment variables (allowed CORS origins, log level,
  app version) with safe defaults.
- [ ] Structured JSON logs: one line per request with method, path, status,
  and duration.
- [ ] `/health` reports status and version.
- [ ] pytest covers the config defaults and the health response.

## 3. Terraform foundations

Branch: `infra/terraform-foundations`

- [ ] `infra/` folder with provider and region config.
- [ ] Remote state in S3 with locking (bootstrapped once).
- [ ] ECR repository for the API image.
- [ ] Build the API image for `linux/amd64` and push it to ECR by hand once.

## 4. The ECS Express Mode service

Branch: `infra/api-service`

- [ ] IAM execution role and infrastructure role.
- [ ] `aws_ecs_express_gateway_service` for the API image.
- [ ] `terraform apply`, then `curl` the service URL's `/health`.
- [ ] Logs visible in CloudWatch.
- [ ] `terraform destroy`, and confirm nothing billable is left.

## 5. A secret in a managed store

Branch: `infra/api-secret`

- [ ] A secret stored in AWS (SSM Parameter Store SecureString or Secrets
  Manager; decide at this step) and injected into the container.
- [ ] The API uses it (for example, a token the caller must send).
- [ ] The secret never appears in Terraform state output, code, or logs.

## 6. Alarm and notifications

Branch: `infra/api-alarm`

- [ ] SNS topic with an email subscription (confirm the email).
- [ ] A CloudWatch alarm (for example, on 5xx responses or unhealthy tasks)
  that notifies the topic.
- [ ] Trigger it on purpose once and get the email.

## 7. Deploy on merge

Branch: `ci/api-deploy`

- [ ] GitHub OIDC identity provider and a deploy role limited to this repo's
  `main` branch, ECR push, and updating this one service.
- [ ] GitHub Actions job: on merge to `main`, build, push to ECR with the
  commit SHA as the tag, and roll the service to the new image.
- [ ] Merge a small API change and watch it deploy.

## 8. Teardown and wrap-up

Branch: `store/week-5-wrapup`

- [ ] `terraform destroy` removes everything; the AWS console shows no
  leftover load balancers, tasks, or images you didn't intend to keep.
- [ ] Check the Billing dashboard: cost so far this month.
- [ ] Decide whether the live store should call the API.
- [ ] README: how to stand the API up and tear it down.

## Done when

- Merging to `main` deploys the API automatically
- `terraform destroy` cleans up
- Logs, an alarm, and a managed secret are in place

## Notes to self (fill in as you go)

### Commands I had to look up

-

### Errors I hit and what fixed them

-
