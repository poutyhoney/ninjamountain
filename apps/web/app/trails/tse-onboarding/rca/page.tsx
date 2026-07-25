import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import RcaConceptCheck from './RcaConceptCheck';
import RcaScenarioChecklist from './RcaScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Concept = { title: string; body: string };
type Resource = { href: string; title: string; desc: string };

const CONCEPTS: Concept[] = [
  {
    title: 'Severity reflects impact, not cause',
    body: 'A severity level (SEV1, SEV2, ...) is assigned from customer and business impact, before you know why something broke. It sets urgency, staffing, and communication cadence.',
  },
  {
    title: 'Root cause vs. contributing factor',
    body: 'The root cause is the condition that, if removed, would have prevented the incident. Contributing factors made it worse or more likely, but wouldn’t have caused it alone.',
  },
  {
    title: 'A timeline, not just a summary',
    body: 'A minute-by-minute timeline exposes the detection gap (time to notice) and the response gap (time to engage the right people) — details a one-paragraph explanation hides.',
  },
  {
    title: 'Blameless by design',
    body: 'A blameless postmortem asks "what let this happen," not "who caused this." Blame discourages honest reporting and hides the systemic gaps worth fixing.',
  },
  {
    title: 'Specific, owned corrective actions',
    body: 'A weak action item says "add more monitoring." A strong one names the exact signal, an owner, and a target date — otherwise it tends to never get done.',
  },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://sre.google/sre-book/postmortem-culture/',
    title: 'Google SRE: Postmortem Culture',
    desc: 'Why blameless postmortems build trust and actually reduce recurrence',
  },
  {
    href: 'https://sre.google/sre-book/managing-incidents/',
    title: 'Google SRE: Managing Incidents',
    desc: 'Roles, communication, and severity during an active incident',
  },
  {
    href: 'https://response.pagerduty.com/',
    title: 'PagerDuty: Incident Response Documentation',
    desc: 'An open framework for severity levels, roles, and postmortem templates',
  },
  {
    href: 'https://www.atlassian.com/incident-management/postmortem',
    title: 'Atlassian: How to run a blameless postmortem',
    desc: 'A practical walkthrough of the postmortem meeting itself',
  },
];

const TRAINING_NOTES = [
  {
    title: 'RCA is a communication skill wearing an engineering hat',
    body: 'The technical content — timelines, root cause, contributing factors — matters, but the lesson keeps circling back to who reads an RCA and what they need from it: leadership needs impact and trust restored, engineering needs a specific fix, and the next on-call needs a faster detection signal.',
  },
  {
    title: 'Fourth repetition of the same exercise shapes, on purpose',
    body: 'Concept check and scenario checklist are now proven across HTTP, Auth, and Events. Repeating the shape for RCA — rather than reaching for a new interaction pattern — keeps the learner’s attention on the content, not on relearning how the page works.',
  },
];

const CODE_EXAMPLE = `14:02 UTC  Deploy of v2.14.0 to messaging-api begins
14:06 UTC  Error rate on POST /v1/messages climbs from 0.1% to 9%
14:19 UTC  Customer opens a support ticket reporting failed sends
14:31 UTC  On-call engineer pages in, confirms correlation with the deploy
14:34 UTC  Rollback to v2.13.2 initiated
14:39 UTC  Error rate returns to baseline

Root cause: v2.14.0 introduced a stricter payload validator that rejected a
previously-accepted phone number format still used by several customers.

Contributing factor: the validator change had no integration test coverage,
and the rollout had no staged or canary phase.`;

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
  title: 'RCA — TSE Onboarding — Ninja Mountain',
  description: 'A primer on severity, root cause vs. contributing factors, timelines, blameless postmortems and corrective actions, with exercises.',
};

export default function RcaLessonPage() {
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
          <span className="text-[#C8CCD4]">RCA</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 4 of 9
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          RCA
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Closing the ticket isn&apos;t the finish line. A senior TSE turns an incident into a document
          that rebuilds trust and makes the next one less likely.
        </p>

        {/* Definitions */}
        <section className="py-14">
          <SectionHeader
            title="What a good RCA actually contains"
            intro="A root cause analysis is a structured account of what happened, why, and what changes as a result — not a blame report."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONCEPTS.map(({ title, body }) => (
              <article key={title} className={card}>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Look at the sanitized incident timeline below, then work through both exercises."
          />
          <pre
            aria-label="Example incident timeline and root cause"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <RcaConceptCheck />
            <RcaScenarioChecklist />
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
