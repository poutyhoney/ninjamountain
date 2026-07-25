import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import SecurityConceptCheck from './SecurityConceptCheck';
import SecurityScenarioChecklist from './SecurityScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Domain = { name: string; body: string };
type DeployModel = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const DOMAINS: Domain[] = [
  { name: 'Secrets management',   body: 'API keys, DB credentials, and certs belong in a secrets manager (Vault, AWS Secrets Manager, Doppler) — never in source control or a plaintext env file.' },
  { name: 'Least-privilege IAM',  body: "A role should have exactly the permissions its job requires, no more. The most common production incident isn't a sophisticated exploit — it's an overly broad policy." },
  { name: 'Network segmentation', body: 'Not every service needs to talk to every other service. VPCs, subnets, and security groups make "if this is compromised, what can it reach?" an answerable question.' },
];

const DEPLOY_MODELS: DeployModel[] = [
  { name: 'Cloud-hosted', body: "Standard SaaS deployment — the provider's infra, your code, internet-reachable by default and gated behind auth." },
  { name: 'On-prem',      body: "Runs inside the customer's own data center. You lose managed services (their DB, their load balancer) and gain their change-control process." },
  { name: 'Air-gapped',   body: 'No path to the public internet, ever. Every dependency — images, packages, even license checks — has to be mirrored in and updated by hand.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html',
    title: 'AWS: IAM best practices',
    desc: 'Least privilege, straight from the source that defines the permission model',
  },
  {
    href: 'https://www.vaultproject.io/docs/what-is-vault',
    title: 'HashiCorp: What is Vault?',
    desc: 'The problem a dedicated secrets manager solves, and why "just use env vars" stops scaling',
  },
  {
    href: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html',
    title: 'OWASP: Secrets Management Cheat Sheet',
    desc: 'Concrete anti-patterns and what to do instead, vendor-neutral',
  },
  {
    href: 'https://kubernetes.io/docs/concepts/security/overview/',
    title: 'Kubernetes docs: Overview of Cloud Native Security',
    desc: 'How segmentation and least privilege show up specifically in a cluster',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This is a flagged gap-priority module',
    body: "This lesson covers two related gaps from the same job-hunting scan: security-domain production experience, and on-prem/air-gapped deployment. They're grouped here because most job descriptions raised them together, not separately.",
  },
  {
    title: 'Broad on purpose, not deep on any one model',
    body: 'Air-gapped installs alone could fill their own trail. The goal here is recognizing the vocabulary and trade-offs when a customer or job description raises them — not having shipped one yourself yet.',
  },
];

const CODE_EXAMPLE = `// Flagged in a security review
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}

// What it should have been — this service only ever
// reads objects from one bucket
{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": "arn:aws:s3:::invoice-exports/*"
}`;

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
  title: 'Production Security & Deployment Models — Cloud Native Essentials — Ninja Mountain',
  description: 'A primer on secrets management, least-privilege IAM, network segmentation, and deployment models, with exercises.',
};

export default function SecurityLessonPage() {
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
          <span className="text-[#C8CCD4]">Production Security &amp; Deployment Models</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 4 of 4 · ⭐ Gap priority
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Production Security &amp; Deployment Models
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          A customer requires an air-gapped install, or a security review flags a policy that&apos;s
          far too broad. Neither should be the first time you&apos;ve thought about either.
        </p>

        {/* Definitions: security domains */}
        <section className="py-14">
          <SectionHeader
            title="Security domains in production"
            intro="Three areas cover most of what shows up in a real review or incident."
          />
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {DOMAINS.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: deployment models */}
        <section className="py-14">
          <SectionHeader
            title="Deployment models"
            intro="The same application looks very different to operate depending on where it actually runs."
          />
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {DEPLOY_MODELS.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Look at the sanitized IAM policy below, then work through both exercises."
          />
          <pre
            aria-label="Example IAM policy comparison"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <SecurityConceptCheck />
            <SecurityScenarioChecklist />
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
