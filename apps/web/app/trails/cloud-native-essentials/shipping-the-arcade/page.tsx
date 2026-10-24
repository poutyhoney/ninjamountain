import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import TrainingNotes from "../../../components/TrainingNotes";

// ─── Data ─────────────────────────────────────────────────────────────────────

type CodeLink = { label: string; href: string };
type Topic = { title: string; body: string; links: CodeLink[] };
type Drill = {
  stage: string;
  breakIt: string;
  symptom: string;
  lookAt: string;
};
type Resource = { href: string; title: string; desc: string };

const BLOB = "https://github.com/poutyhoney/ninjamountain/blob/main";
const TREE = "https://github.com/poutyhoney/ninjamountain/tree/main";

const TOPICS: Topic[] = [
  {
    title: "Docker",
    body: "The store image is multi-stage: one stage builds, a slim runtime stage copies only the standalone output. Contentful keys reach the build as BuildKit secrets, so they never land in an image layer. One Compose file runs the store, API, Postgres, and GrowthBook together.",
    links: [
      { label: "apps/store/Dockerfile", href: `${BLOB}/apps/store/Dockerfile` },
      { label: "apps/api/Dockerfile", href: `${BLOB}/apps/api/Dockerfile` },
      { label: "compose.yaml", href: `${BLOB}/compose.yaml` },
    ],
  },
  {
    title: "Terraform on AWS",
    body: "The API runs on ECS Express Mode: one resource gives a Fargate service, an HTTPS load balancer, auto scaling, and logs. Permanent pieces (ECR, the deploy role) live apart from the per-session service, which is destroyed after each work session to keep costs near zero.",
    links: [
      { label: "infra/README.md", href: `${BLOB}/infra/README.md` },
      { label: "infra/shared", href: `${TREE}/infra/shared` },
      { label: "infra/api-service", href: `${TREE}/infra/api-service` },
    ],
  },
  {
    title: "OIDC deploys and SSM secrets",
    body: "GitHub Actions deploys with short-lived AWS credentials from OIDC, so no AWS keys are stored in GitHub. The API token and the Anthropic key live in SSM Parameter Store, created once from the CLI so their values never enter Terraform state. ECS injects them at start.",
    links: [
      {
        label: "deploy-api.yml",
        href: `${BLOB}/.github/workflows/deploy-api.yml`,
      },
      { label: "infra/shared/main.tf", href: `${BLOB}/infra/shared/main.tf` },
    ],
  },
  {
    title: "Kubernetes on kind",
    body: "The whole stack on a local cluster: Postgres, two API replicas with health probes, and two store replicas behind Traefik. Rolling updates keep old pods serving until new ones are ready. Secrets come from local env files and are never committed.",
    links: [
      { label: "k8s/README.md", href: `${BLOB}/k8s/README.md` },
      { label: "k8s/api.yaml", href: `${BLOB}/k8s/api.yaml` },
      { label: "k8s/store.yaml", href: `${BLOB}/k8s/store.yaml` },
    ],
  },
];

const DRILLS: Drill[] = [
  {
    stage: "Pull image",
    breakIt: "A wrong image tag",
    symptom: "ErrImagePull, then ImagePullBackOff",
    lookAt: "Pod events",
  },
  {
    stage: "Build config",
    breakIt: "A missing Secret",
    symptom: "CreateContainerConfigError",
    lookAt: "Pod events (there are no logs yet)",
  },
  {
    stage: "Start",
    breakIt: "A command that exits",
    symptom: "CrashLoopBackOff, restarts climb",
    lookAt: "kubectl logs --previous",
  },
  {
    stage: "Readiness",
    breakIt: "A bad probe path",
    symptom: "Running but 0/1 Ready",
    lookAt: "Events and EndpointSlices",
  },
];

const RESOURCES: Resource[] = [
  {
    href: `${BLOB}/infra/README.md`,
    title: "Infra README",
    desc: "What lives where, what it costs, and the session routine",
  },
  {
    href: `${BLOB}/k8s/README.md`,
    title: "Kubernetes README",
    desc: "Cluster setup, the debugging table, and known gaps",
  },
  {
    href: "https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services",
    title: "GitHub docs: OIDC in AWS",
    desc: "How a workflow trades its identity for short-lived AWS credentials",
  },
  {
    href: "https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/",
    title: "Kubernetes docs: Debug Pods",
    desc: "The official flow behind the four drills",
  },
];

const TRAINING_NOTES = [
  {
    title: "Hard: the first choice of service had closed",
    body: "The plan started on App Runner, which stopped taking new customers in April 2026. ECS Express Mode is the replacement. Lesson: check availability and deprecation notices before picking a service, not after.",
  },
  {
    title: "Hard: a manual fix survived kubectl apply",
    body: "A command patched in by hand wasn't in the last-applied record, so the three-way merge kept it through apply. A rollout undo cleared it. GitOps tools like Argo CD or Flux make Git the only way in, which prevents this.",
  },
  {
    title: "Differently: keep state out of the pods",
    body: "The Sensei daily limit is counted in memory, so with two API replicas each pod counts on its own. It worked on one container and broke quietly on two. A shared store (Redis or Postgres) from the start would have scaled with no change.",
  },
  {
    title: "Differently: a real secrets store on the cluster",
    body: "Kubernetes Secrets in kind are base64, not encrypted at rest. Fine for local drills. On a real cluster, an external secrets store would pull from SSM, the same place ECS already reads.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const card =
  "rounded-[18px] border border-[#202431] bg-[#151821] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.23)]";

function SectionHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <>
      <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mb-8 max-w-2xl text-[#6F7684]">{intro}</p>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Shipping the Arcade — Cloud Native Essentials — Ninja Mountain",
  description:
    "How the Ninja Mountain Arcade ships: Docker, Terraform on AWS with ECS Express, OIDC deploys and SSM secrets, and Kubernetes on kind with four break-and-fix drills.",
};

export default function ShippingTheArcadePage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] font-sans text-[#E9ECF2]">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 py-20">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-[#6F7684]"
        >
          <Link href="/" className="hover:text-[#E9ECF2]">
            Home
          </Link>
          <span>›</span>
          <Link href="/trails" className="hover:text-[#E9ECF2]">
            Trails
          </Link>
          <span>›</span>
          <Link
            href="/trails/cloud-native-essentials"
            className="hover:text-[#E9ECF2]"
          >
            Cloud Native Essentials
          </Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Shipping the Arcade</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 5 of 5 · Project case study
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Shipping the Arcade
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          The same store and API, three ways to run them: Docker Compose on a
          laptop, ECS on AWS with Terraform, and Kubernetes on kind. Each topic
          links to the config that does it.
        </p>

        {/* Topics */}
        <section className="py-14">
          <SectionHeader
            title="What's in it"
            intro="Four parts of the infrastructure worth a closer look, with links to the files."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {TOPICS.map(({ title, body, links }) => (
              <article key={title} className={card}>
                <h3 className="mb-2 font-semibold text-[#E9ECF2]">{title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-[#6F7684]">
                  {body}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {links.map(({ label, href }) => (
                    <li key={href}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full border border-[#202431] px-3 py-1 font-mono text-xs text-[#8B6CFF] transition-colors hover:border-[#8B6CFF]/40"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Drills */}
        <section className="py-14">
          <SectionHeader
            title="Four break-and-fix drills"
            intro="Each drill breaks the cluster at a different stage of a pod's life. Read the symptom, then find the cause where it shows up."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {DRILLS.map(({ stage, breakIt, symptom, lookAt }) => (
              <article key={stage} className={card}>
                <p className="mb-1 text-xs font-bold uppercase tracking-[.2em] text-[#6F7684]">
                  {stage}
                </p>
                <h3 className="mb-3 font-semibold text-[#E9ECF2]">{breakIt}</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-[#6F7684]">Symptom</dt>
                    <dd className="font-mono text-[#8B6CFF]">{symptom}</dd>
                  </div>
                  <div>
                    <dt className="text-[#6F7684]">Look at</dt>
                    <dd className="text-[#C8CCD4]">{lookAt}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section className="py-14">
          <SectionHeader
            title="Go deeper"
            intro="The project READMEs, plus primary sources for the two ideas that took the most practice."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {RESOURCES.map(({ href, title, desc }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-[#202431] bg-[#151821] px-5 py-4 transition-colors hover:border-[#8B6CFF]/30"
              >
                <strong className="text-[#E9ECF2]">{title}</strong>
                <small className="mt-1 block text-[#6F7684]">{desc}</small>
              </a>
            ))}
          </div>
        </section>

        {/* Training Notes */}
        <section className="py-14">
          <TrainingNotes notes={TRAINING_NOTES} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
