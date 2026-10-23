# Infrastructure

Terraform for the Ninja Mountain API on AWS (`us-east-1`). The API runs on
Amazon ECS Express Mode: one resource creates a Fargate service, an HTTPS load
balancer, auto scaling, and a log group.

The store stays on Vercel and does not call this API (yet). The API only runs
during work sessions, so production shows offers only.

## What lives where

| Folder         | Holds                                                                           | Lifetime                             | State                               |
| -------------- | ------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------- |
| `bootstrap/`   | The S3 bucket for Terraform state                                               | Permanent, `prevent_destroy`         | Local, gitignored                   |
| `shared/`      | ECR repository, SNS alerts topic, GitHub OIDC provider and deploy role          | Permanent, costs pennies             | S3, `shared/terraform.tfstate`      |
| `api-service/` | ECS cluster, Express service, IAM roles, log group, 5xx metric filter and alarm | Created per session, destroyed after | S3, `api-service/terraform.tfstate` |

Outside Terraform, on purpose:

- **The API token** lives in SSM Parameter Store as `/ninjamountain/api/token`
  (`SecureString`). It was created once with the CLI so its value never lands
  in Terraform state. ECS injects it into the container as `API_TOKEN`.
- **The Anthropic key** lives in SSM as `/ninjamountain/api/anthropic-key`
  (`SecureString`), also created once with the CLI. ECS injects it as
  `ANTHROPIC_API_KEY`. The execution role may read only these two
  parameters.
- **Your alert email** is in `shared/terraform.tfvars`, which is gitignored.

## Cost

| While                      | Roughly                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `api-service` is up        | 4 cents an hour (mostly the load balancer). About $25 to $30 if left up all month. |
| `api-service` is destroyed | Pennies a month (ECR image storage, S3 state)                                      |

These are estimates; check AWS pricing for exact numbers. A $10 monthly
budget alert emails you at 85% of actual spend and when the forecast goes
over.

## Session routine

Run each command on its own. Docker Desktop must be running for any image
build.

**1. Sign in**

```bash
aws sso login
aws sts get-caller-identity
```

The `Arn` should contain `AWSReservedSSO_AdministratorAccess`. When a command
later fails with "Token has expired," run `aws sso login` again.

**2. Stand the API up with the newest image**

```bash
cd ~/NinjaMountain/dotblack/ninjamountain/infra/api-service
TAG=$(aws ecr describe-images --repository-name ninjamountain-api --query 'sort_by(imageDetails,&imagePushedAt)[-1].imageTags[0]' --output text)
echo "TAG=[$TAG]"
terraform init
terraform plan -var "image_tag=$TAG"
terraform apply -var "image_tag=$TAG"
```

Check that `TAG` is not empty before planning. The apply takes 5 to 15
minutes. Keep every command in one terminal tab so the variables stay set.

**3. Test it**

```bash
URL=$(terraform output -raw api_url)
TOKEN=$(aws ssm get-parameter --name /ninjamountain/api/token --with-decryption --query Parameter.Value --output text)
curl -s "$URL/health"
curl -s -H "Authorization: Bearer $TOKEN" "$URL/entitlements/me"
curl -N -X POST "$URL/sensei/hint" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"challenge_id":"bamboo-grove-growth","question":"Where do I start?"}'
aws logs tail /ninjamountain/api --since 15m
```

`/health` reports the running image tag. `/entitlements/me` returns 401
without the token.

**4. Tear it down**

```bash
cd ~/NinjaMountain/dotblack/ninjamountain/infra/api-service
terraform destroy -var "image_tag=$TAG"
aws elbv2 describe-load-balancers --query 'LoadBalancers[].LoadBalancerName'
```

The last command should print `[]`. If it lists a load balancer, something is
still billing.

## How deploys work

`.github/workflows/deploy-api.yml` runs on every merge to `main` that changes
`apps/api/**` (or the workflow itself), and from the Actions tab
(`workflow_dispatch`).

1. GitHub Actions signs in to AWS with **OIDC**: no stored AWS keys. Only this
   repo's `main` branch can assume the `ninjamountain-github-deploy` role.
2. It builds the API image for `linux/amd64` and pushes it to ECR, tagged with
   the short commit SHA. If that tag already exists, it skips the build, so
   re-runs work.
3. If the service is running, it runs `terraform plan -out` and `apply` on
   `api-service/` with the new tag. ECS rolls it out as a canary deployment
   and rolls back on errors. If the service is not running, it posts a notice
   and stops; the next `apply` uses the image.

The deploy role can read everything in `api-service/` but only change the
service image. Infrastructure changes (new resources, CPU, alarms) fail in CI
on purpose and are applied by hand with your admin session.

## Alerts

Any 5xx response from the API adds 1 to the `Api5xxCount` metric (a metric
filter on the JSON logs). One or more in a minute triggers the
`ninjamountain-api-5xx` alarm, which emails you through the
`ninjamountain-alerts` SNS topic, then sends an OK email when it clears.

Test the email path without breaking anything (while the stack is up):

```bash
aws cloudwatch set-alarm-state --alarm-name ninjamountain-api-5xx --state-value ALARM --state-reason "Testing notifications"
```

## Changing infrastructure

1. Edit the `.tf` files on a branch.
2. `terraform fmt`, `terraform validate`, then `terraform plan` and read it.
3. `terraform apply` with your admin session.
4. Commit the change (and `.terraform.lock.hcl` if it changed) and open a PR.

Never commit `*.tfstate`, `.terraform/`, or `*.tfvars`; they're gitignored.

## Known gaps

- `requirements.txt` includes `pytest` and `ruff`, so they ship in the image.
- The API stays open if `API_TOKEN` is missing. A stricter version would
  refuse to start in production without it.
- The base image has OS-level findings (glibc, zlib) that aren't reachable
  from this API. Every CI build uses `--pull` to pick up patches.
- No GitLab equivalent of the deploy workflow.
