import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import CloudOpsConceptCheck from './CloudOpsConceptCheck';
import CloudOpsScenarioChecklist from './CloudOpsScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Equivalent = { primitive: string; body: string };
type Stage = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const EQUIVALENTS: Equivalent[] = [
  { primitive: 'Compute',              body: 'AWS EC2 · GCP Compute Engine · Azure Virtual Machines — a rentable server, billed by the hour or second.' },
  { primitive: 'Object storage',       body: 'AWS S3 · GCP Cloud Storage · Azure Blob Storage — flat, durable storage for files, addressed by key.' },
  { primitive: 'Serverless functions', body: 'AWS Lambda · GCP Cloud Functions · Azure Functions — run-on-trigger code that scales to zero.' },
  { primitive: 'Managed Kubernetes',   body: 'AWS EKS · GCP GKE · Azure AKS — a control plane the provider runs for you; you still manage the workloads.' },
];

const STAGES: Stage[] = [
  { name: 'Build',    body: 'Compile or package the app into a deployable artifact — a container image, a binary, a static bundle.' },
  { name: 'Test',     body: 'Run automated checks (unit, integration, lint) against the artifact before it goes anywhere near production.' },
  { name: 'Deploy',   body: 'Ship the artifact to an environment, often via a rolling or blue/green strategy to avoid downtime.' },
  { name: 'Rollback', body: 'Revert to the last known-good artifact fast, without re-running the whole pipeline, when a deploy misbehaves.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://cloud.google.com/docs/get-started/aws-azure-gcp-service-comparison',
    title: 'Google Cloud: AWS to Azure to GCP service comparison',
    desc: 'A living table mapping equivalent services across the three major clouds',
  },
  {
    href: 'https://www.redhat.com/en/topics/automation/what-is-ci-cd',
    title: 'Red Hat: What is CI/CD?',
    desc: 'The pipeline stages and why each one exists, vendor-neutral',
  },
  {
    href: 'https://www.cloudflare.com/learning/dns/what-is-dns/',
    title: 'Cloudflare Learning: What is DNS?',
    desc: 'Resolution, caching, and TTLs — the part that bites you at the worst time',
  },
  {
    href: 'https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions',
    title: 'GitHub Docs: Understanding GitHub Actions',
    desc: 'One concrete implementation of the build/test/deploy stages above',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This is a flagged gap-priority module',
    body: "Cloud infrastructure fundamentals was Tom's #3 self-identified gap across a scan of 30+ job descriptions — sequenced second in this trail, right after the top-priority containers module.",
  },
  {
    title: 'This module stays at the fundamentals layer',
    body: "Deep dives on any single provider's console or IAM model are out of scope here. The goal is enough shared vocabulary to onboard onto whichever provider a given company uses, fast — not certification-level depth in one of them.",
  },
];

const CODE_EXAMPLE = `$ dig +short api.internal.example.com
10.0.4.12

$ curl -v https://api.internal.example.com/healthz
*   Trying 10.0.4.12:443...
* connect to 10.0.4.12 port 443 failed: Connection refused
* Failed to connect to api.internal.example.com port 443

$ dig +short api.internal.example.com @8.8.8.8
10.0.4.55`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const card = 'rounded-[18px] border border-[#202431] bg-[#151821] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.23)]';

function SectionHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <>
      <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mb-8 max-w-2xl text-[#6F7684]">{intro}</p>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Cloud Platforms & Core Ops — Cloud Native Essentials — Ninja Mountain',
  description: 'A primer on cross-cloud service equivalents, CI/CD stages, and Linux/networking fundamentals, with exercises.',
};

export default function CloudOpsLessonPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] font-sans text-[#E9ECF2]">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#6F7684]">
          <Link href="/" className="hover:text-[#E9ECF2]">Home</Link>
          <span>›</span>
          <Link href="/trails" className="hover:text-[#E9ECF2]">Trails</Link>
          <span>›</span>
          <Link href="/trails/cloud-native-essentials" className="hover:text-[#E9ECF2]">Cloud Native Essentials</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Cloud Platforms &amp; Core Ops</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 2 of 4 · ⭐ Gap priority
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Cloud Platforms &amp; Core Ops
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Every company names its infrastructure a little differently. Underneath, it&apos;s the same
          handful of primitives — learn those once instead of relearning them per employer.
        </p>

        {/* Definitions: cross-cloud equivalents */}
        <section className="py-14">
          <SectionHeader
            title="The same primitives, different names"
            intro="Four building blocks show up in almost every cloud-hosted system, whichever provider is underneath."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {EQUIVALENTS.map(({ primitive, body }) => (
              <article key={primitive} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{primitive}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: CI/CD stages */}
        <section className="py-14">
          <SectionHeader
            title="CI/CD pipeline stages"
            intro="Jenkins, GitHub Actions, and CircleCI all implement the same four stages — the tool changes, the shape doesn't."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {STAGES.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: Linux & networking fundamentals */}
        <section className="py-14">
          <SectionHeader
            title="Linux &amp; networking fundamentals"
            intro="Every service you'll touch is a process listening on a port, reachable because DNS and routing agree on how to get there."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              <strong className="text-[#E9ECF2]">DNS</strong> turns a name into an IP address; a{' '}
              <strong className="text-[#E9ECF2]">resolver</strong> caches that answer for the record&apos;s
              TTL, which is exactly why a change can take a while to show up everywhere. Once you have
              an IP, the OS decides how to route to it, and the remote process is either listening on
              the port you&apos;re hitting or it isn&apos;t. Four commands cover most first-pass diagnosis:{' '}
              <code className="text-[#C8CCD4]">dig</code> (what does this name resolve to, and where),{' '}
              <code className="text-[#C8CCD4]">curl -v</code> (what actually happens on the wire),{' '}
              <code className="text-[#C8CCD4]">ss -tlnp</code> (what&apos;s listening locally), and{' '}
              <code className="text-[#C8CCD4]">ping</code>/<code className="text-[#C8CCD4]">traceroute</code>{' '}
              (basic reachability).
            </p>
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Look at the sanitized dig/curl output below, then work through both exercises."
          />
          <pre
            aria-label="Example dig and curl output"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <CloudOpsConceptCheck />
            <CloudOpsScenarioChecklist />
          </div>
        </section>

        {/* Resources */}
        <section className="py-14">
          <SectionHeader
            title="Go deeper"
            intro="These primers are a starting point. Read the primary sources to build real fluency."
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
