import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import AutomationConceptCheck from './AutomationConceptCheck';
import AutomationScenarioChecklist from './AutomationScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Platform = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const PLATFORMS: Platform[] = [
  { name: 'n8n',   body: 'Open-source and self-hostable, node-based — the choice when workflow logic needs to live in your own infra, or you need capabilities SaaS tools gate behind higher tiers.' },
  { name: 'Zapier', body: 'The most widely integrated SaaS automation tool — thousands of app integrations, a simple trigger→action model, easiest to get a non-technical teammate using.' },
  { name: 'Make',   body: 'A visual, more powerful branching and routing model than Zapier\'s linear zaps, still fully hosted — a middle ground between Zapier\'s simplicity and n8n\'s control.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://docs.n8n.io/try-it-out/quickstart/',
    title: 'n8n Docs: A very quick quickstart',
    desc: 'The self-hosted, node-based end of the spectrum',
  },
  {
    href: 'https://help.zapier.com/hc/en-us/articles/37518970271245-What-is-Zapier',
    title: 'Zapier Help: What is Zapier?',
    desc: 'The trigger/action model in its simplest, most widely adopted form',
  },
  {
    href: 'https://help.make.com/get-started',
    title: 'Make Help Center: Get started',
    desc: 'The more powerful visual branching/routing middle ground',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This module closes the trail on purpose',
    body: 'Everything else in Applied AI/ML assumes you\'re writing code. This lesson is the opposite end of the spectrum — recognizing when a workflow genuinely doesn\'t need code, and when it has outgrown not needing it.',
  },
  {
    title: 'The trace below is a common real failure, not a contrived one',
    body: 'A workflow silently stopping partway through because a downstream step failed with no retry configured is one of the most common no-code automation incidents in practice.',
  },
];

const CODE_EXAMPLE = `Trigger: New row in "Support Escalations" sheet
  → Action 1: POST to Slack webhook (#escalations channel)
  → Action 2: Create Zendesk ticket (row.customer_email → ticket.requester)
  → Action 3 (conditional): If row.priority = "P1", page on-call via PagerDuty

Failure: Action 2 fails (Zendesk rate limit) → Action 3 never runs
  (no retry configured — escalation silently incomplete)`;

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
  title: 'Low-Code/No-Code Automation — Applied AI/ML — Ninja Mountain',
  description: 'A primer on n8n, Zapier, and Make, the shared trigger/action/mapping model, and when to write real code instead, with exercises.',
};

export default function AutomationLessonPage() {
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
          <Link href="/trails/applied-ai-ml" className="hover:text-[#E9ECF2]">Applied AI/ML</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Low-Code/No-Code Automation</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 4 of 4
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Low-Code/No-Code Automation
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Automating a recurring ops task doesn&apos;t always mean writing a service — but knowing
          when it stops being &quot;just a Zap&quot; is its own skill.
        </p>

        {/* Definitions: the three platforms */}
        <section className="py-14">
          <SectionHeader
            title="The three big players"
            intro="Same core idea, three different trade-offs between simplicity, power, and control."
          />
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {PLATFORMS.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: the core model */}
        <section className="py-14">
          <SectionHeader
            title="The core automation model"
            intro="Learn this shape once and any specific tool's UI is just details."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              Every one of these tools follows the same shape: a{' '}
              <strong className="text-[#E9ECF2]">trigger</strong> fires — a new row, an incoming
              webhook, a schedule — one or more{' '}
              <strong className="text-[#E9ECF2]">actions</strong> run in response, and data from
              earlier steps gets <strong className="text-[#E9ECF2]">mapped</strong> into later
              ones. A workflow with more than a few branches, needing real error handling and
              retries, or touching sensitive data, usually outgrows a visual builder fast — that&apos;s
              the point to write actual code instead of adding another branch.
            </p>
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Look at the sanitized automation trace below, then work through both exercises."
          />
          <pre
            aria-label="Example automation trigger/action trace"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <AutomationConceptCheck />
            <AutomationScenarioChecklist />
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
