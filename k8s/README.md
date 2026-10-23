# Kubernetes (local, kind)

The whole stack on a local kind cluster: Postgres, the API, and the store,
with Traefik routing http://localhost:8080 to the store. Local only; nothing
here runs in the cloud.

## What's here

| File                  | Holds                                                                              |
| --------------------- | ---------------------------------------------------------------------------------- |
| `kind-config.yaml`    | Cluster `ninjamountain`, Mac port 8080 mapped to node port 30080                   |
| `traefik-values.yaml` | Helm values: Traefik as a NodePort Service on 30080                                |
| `namespace.yaml`      | Namespace `ninjamountain`                                                          |
| `events-db-init.yaml` | ConfigMap generated from `apps/api/db/init.sql`                                    |
| `events-db.yaml`      | Postgres: PVC, Deployment (Recreate), Service                                      |
| `api.yaml`            | API: ConfigMap, Deployment (2 replicas, probes on `/health`), Service              |
| `store.yaml`          | Store: ConfigMap, Deployment (2 replicas, zero-downtime rollout), Service, Ingress |

Secrets are created from local env files and never committed.

Why Traefik: the community ingress-nginx project was retired in March 2026.
Traefik serves the same standard `Ingress` objects. Gateway API is the
longer-term option.

## Create the cluster

Docker Desktop must be running. From the repo root:

    kind create cluster --config k8s/kind-config.yaml
    kubectl config current-context    # kind-ninjamountain

    helm repo add traefik https://traefik.github.io/charts
    helm repo update
    helm install traefik traefik/traefik --version 42.1.3 \
      --namespace traefik --create-namespace -f k8s/traefik-values.yaml

## Build and load images

Use a real tag, never `latest` (it makes Kubernetes pull from Docker Hub).

    docker build -t ninjamountain-api:k1 apps/api
    (set -a && . apps/store/.env.local && set +a && docker build \
      -f apps/store/Dockerfile --build-arg API_URL=http://api:8000 \
      --secret id=contentful_space_id,env=CONTENTFUL_SPACE_ID \
      --secret id=contentful_access_token,env=CONTENTFUL_ACCESS_TOKEN \
      -t ninjamountain-store:k1 .)
    kind load docker-image ninjamountain-api:k1 ninjamountain-store:k1 --name ninjamountain

## Secrets and apply

    kubectl apply -f k8s/namespace.yaml
    kubectl create secret generic events-db -n ninjamountain \
      --from-literal=password=local-dev-only
    kubectl create secret generic api-secrets -n ninjamountain \
      --from-env-file=<(grep '^ANTHROPIC_API_KEY=' .env)
    kubectl create secret generic store-secrets -n ninjamountain \
      --from-env-file=<(grep -E '^(CONTENTFUL_SPACE_ID|CONTENTFUL_ACCESS_TOKEN|STRIPE_SECRET_KEY)=' apps/store/.env.local)
    kubectl apply -f k8s/

Then open http://localhost:8080 and http://localhost:8080/sensei.

If `apps/api/db/init.sql` changes, regenerate its ConfigMap:

    kubectl create configmap events-db-init -n ninjamountain \
      --from-file=init.sql=apps/api/db/init.sql --dry-run=client -o yaml \
      > k8s/events-db-init.yaml

## Debugging

| Symptom                             | Likely cause                             | Look at                              |
| ----------------------------------- | ---------------------------------------- | ------------------------------------ |
| `ErrImagePull` / `ImagePullBackOff` | Wrong tag, or image not loaded into kind | `kubectl describe pod <name>` events |
| `CreateContainerConfigError`        | Missing Secret or ConfigMap              | Events (there are no logs)           |
| `CrashLoopBackOff`                  | The process exits on start               | `kubectl logs <name> --previous`     |
| `Running` but `0/1`                 | Readiness probe failing                  | Events, `kubectl get endpointslices` |

`kubectl describe` on several pods at once hides events in kubectl 1.36.
Describe one pod by name, or use
`kubectl get events -n ninjamountain --sort-by=.lastTimestamp`.

Run `kubectl diff -f k8s/` before applying. Changes made with
`kubectl patch` or `edit` can survive an `apply`.

## Delete

    kind delete cluster --name ninjamountain

## Known gaps

- Each API pod has its own in-memory hint counter, so the daily limit is per
  pod. A shared store (Redis or Postgres) would fix it.
- GrowthBook isn't in the cluster, so every visitor sees the control layout.
- ConfigMap changes need a `kubectl rollout restart` to reach running pods.
- Secrets are plain Kubernetes Secrets (base64, not encrypted at rest in
  kind). A real cluster would use an external secrets store.
