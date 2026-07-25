import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import IacConceptCheck from './IacConceptCheck';
import IacScenarioChecklist from './IacScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Concept = { name: string; body: string };
type Tool = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const CONCEPTS: Concept[] = [
  { name: 'Provider', body: 'A plugin that knows how to talk to a specific API — AWS, GCP, Azure, Datadog, GitHub. Every resource block belongs to one.' },
  { name: 'Resource',  body: 'A single piece of managed infrastructure — an EC2 instance, an S3 bucket, a DNS record — declared, not scripted.' },
  { name: 'State',     body: "Terraform's record of what it last created, mapping your config to real-world resource IDs. Losing or corrupting it is one of the most common ways teams get hurt." },
  { name: 'Plan / Apply', body: "`plan` shows what would change without touching anything; `apply` actually makes the change. Never skip reading a plan you didn't write yourself." },
];

const TOOLS: Tool[] = [
  { name: 'Terraform',      body: "Cloud-agnostic, HCL syntax, the most widely adopted — the safe default when a job description just says \"IaC.\"" },
  { name: 'Pulumi',         body: 'The same declarative model, but written in a real programming language (TypeScript, Python, Go) instead of HCL.' },
  { name: 'CloudFormation', body: "AWS-native, JSON/YAML — no separate state file to manage since AWS tracks it, but locked to one provider." },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://developer.hashicorp.com/terraform/intro',
    title: 'HashiCorp: Terraform intro',
    desc: 'What problem Terraform solves and the core workflow, from the source',
  },
  {
    href: 'https://developer.hashicorp.com/terraform/language/state',
    title: 'HashiCorp: Terraform state',
    desc: 'Why state exists and what actually breaks when it drifts or gets lost',
  },
  {
    href: 'https://www.pulumi.com/docs/iac/concepts/vs/terraform/',
    title: 'Pulumi: Pulumi vs. Terraform',
    desc: "A vendor's comparison, but a fair one on the actual authoring-experience trade-off",
  },
  {
    href: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html',
    title: 'AWS: CloudFormation User Guide',
    desc: 'The AWS-native alternative, for when a team is fully committed to one cloud',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This module builds directly on the last one',
    body: "Infrastructure as Code isn't a separately flagged gap, but it's the natural follow-on to Cloud Platforms & Core Ops — reading a plan diff assumes the vocabulary (compute, DNS, networking) from that lesson.",
  },
  {
    title: 'The example output is trimmed for readability',
    body: 'Real Terraform plan output includes far more noise — provider metadata, computed fields — that is rarely relevant to the actual question of what is changing and why.',
  },
];

const CODE_EXAMPLE = `$ terraform plan

  # aws_instance.web must be replaced
-/+ resource "aws_instance" "web" {
      ~ ami           = "ami-0a1b2c3d4e5f6g7h8" -> "ami-0z9y8x7w6v5u4t3s2" # forces replacement
        id            = "i-0abc123def456"
        instance_type = "t3.micro"
        tags          = {
            "Name" = "web-server"
        }
    }

Plan: 1 to add, 0 to change, 1 to destroy.`;

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
  title: 'Infrastructure as Code — Cloud Native Essentials — Ninja Mountain',
  description: 'A primer on Terraform core concepts, alternatives, and diagnosing drift, with exercises.',
};

export default function IacLessonPage() {
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
          <span className="text-[#C8CCD4]">Infrastructure as Code</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 3 of 4
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Infrastructure as Code
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Someone hand-edited a resource in the console, and now the next plan wants to destroy it.
          Knowing why that happens is most of what IaC fluency actually is.
        </p>

        {/* Definitions: why IaC */}
        <section className="py-14">
          <SectionHeader
            title="Why declare infrastructure instead of scripting it"
            intro="A script describes steps; a declarative config describes an end state — and the tool figures out the steps to get there."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              An imperative script (&quot;create this, then attach that&quot;) has to account for every
              possible starting state to stay correct. A declarative tool like Terraform instead
              compares your config against its <strong className="text-[#E9ECF2]">state</strong> —
              its record of what it last created — and computes only the changes needed to close
              the gap. When reality (the actual cloud resources) no longer matches either the config
              or the state, that mismatch is called <strong className="text-[#E9ECF2]">drift</strong>,
              and it&apos;s the single most common source of Terraform surprises.
            </p>
          </div>
        </section>

        {/* Definitions: core concepts */}
        <section className="py-14">
          <SectionHeader
            title="Core Terraform concepts"
            intro="Four terms cover most of what you'll need to read someone else's config or plan output."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {CONCEPTS.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-mono font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: tool comparison */}
        <section className="py-14">
          <SectionHeader
            title="Terraform, Pulumi, and CloudFormation"
            intro="Same underlying idea, three different authoring experiences and levels of vendor lock-in."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {TOOLS.map(({ name, body }) => (
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
            intro="Look at the sanitized plan output below, then work through both exercises."
          />
          <pre
            aria-label="Example terraform plan output"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <IacConceptCheck />
            <IacScenarioChecklist />
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
