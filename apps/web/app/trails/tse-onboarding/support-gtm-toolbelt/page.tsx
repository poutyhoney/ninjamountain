import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import ToolbeltConceptCheck from './ToolbeltConceptCheck';
import ToolbeltScenarioChecklist from './ToolbeltScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Tool = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const TOOLS: Tool[] = [
  { name: 'Zendesk / Intercom / Front / Pylon', body: 'Where the customer conversation lives — the ticket, the thread, and the SLA clock.' },
  { name: 'Jira / Linear',                      body: "Where an escalated bug becomes an engineering ticket, with its own status separate from the support ticket." },
  { name: 'Metabase',                           body: "Where you go to answer \"how many customers hit this\" without waiting on a data engineer." },
  { name: 'LaunchDarkly',                       body: "Feature flags — often the real explanation for why one customer's experience differs from the docs." },
  { name: 'Billing tools (Stripe, etc.)',       body: "Where \"my invoice is wrong\" actually gets resolved — subscription state, proration, and payment failures." },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://www.zendesk.com/what-is-zendesk/',
    title: 'Zendesk: What is Zendesk?',
    desc: 'The conversation/ticketing layer most support orgs are built on',
  },
  {
    href: 'https://www.atlassian.com/software/jira/guides/getting-started/introduction',
    title: 'Atlassian: Getting started with Jira',
    desc: 'How an engineering ticket tracks a fix, separate from the customer-facing one',
  },
  {
    href: 'https://launchdarkly.com/blog/what-are-feature-flags/',
    title: 'LaunchDarkly: What are feature flags?',
    desc: 'Why "it works for me but not them" is often a rollout state, not a bug',
  },
  {
    href: 'https://www.metabase.com/learn',
    title: 'Metabase: Learn Metabase',
    desc: 'Self-serve querying, for when you need an answer faster than a data engineer can give it',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This module is the practical front door, not a flagged gap',
    body: 'None of these tools are individually hard to learn. The value is recognizing the pattern fast — conversation tool ↔ engineering tracker ↔ flag/rollout state ↔ billing system — on day one at a new company.',
  },
  {
    title: 'The trace below is illustrative, not a real ticket',
    body: 'Real tool integrations vary — some companies link tickets automatically, others rely on someone pasting a URL into a comment. The shape of the trace matters more than any specific tool\'s UI.',
  },
];

const CODE_EXAMPLE = `Zendesk #48213 — "Export button missing for one user"
  → Linked to Jira ENG-1092 (status: In Progress)
  → LaunchDarkly flag: new-export-ui — 20% rollout
  → Customer's account: NOT in rollout cohort
  → Root cause: feature flag targeting, not a bug`;

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
  title: 'Support & GTM Toolbelt — TSE Onboarding — Ninja Mountain',
  description: 'A primer on the ticketing, engineering, data, and billing tools a support ticket actually passes through, with exercises.',
};

export default function ToolbeltLessonPage() {
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
          <Link href="/trails/tse-onboarding" className="hover:text-[#E9ECF2]">TSE Onboarding</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Support &amp; GTM Toolbelt</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 6 of 9
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Support &amp; GTM Toolbelt
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          A single ticket rarely stays in one tool. Following it across the stack — fast — is
          most of what &quot;getting productive in week one&quot; actually means.
        </p>

        {/* Definitions: the stack */}
        <section className="py-14">
          <SectionHeader
            title="The stack a ticket actually touches"
            intro="Five categories of tool cover most of what you'll need to move between."
          />
          <div className="grid gap-4 sm:grid-cols-2">
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
            intro="Look at the sanitized ticket trace below, then work through both exercises."
          />
          <pre
            aria-label="Example cross-tool ticket trace"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <ToolbeltConceptCheck />
            <ToolbeltScenarioChecklist />
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
