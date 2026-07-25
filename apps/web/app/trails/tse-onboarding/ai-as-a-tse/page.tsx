import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import AiConceptCheck from './AiConceptCheck';
import AiScenarioChecklist from './AiScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Concept = { title: string; body: string };
type Resource = { href: string; title: string; desc: string };

const CONCEPTS: Concept[] = [
  {
    title: 'A drafting assistant, not an oracle',
    body: 'AI tools are strong at summarizing a noisy ticket thread, drafting a first-pass explanation, or generating diagnostic questions. They are not a substitute for checking a live system, a spec, or your own runbook.',
  },
  {
    title: 'Hallucination is confident, fluent, and wrong',
    body: 'A model can state a made-up parameter or the wrong meaning of a status code with the same confidence as a correct answer. Fluency is not evidence — verify claims the same way you would a junior teammate’s draft.',
  },
  {
    title: 'Ground it in real evidence',
    body: 'Paste the actual log line, request, or error — not a description of the problem from memory. The output is only as accurate as the context you provide.',
  },
  {
    title: 'Data handling still applies',
    body: 'Anything that identifies a customer or exposes a secret — account numbers, tokens, contact details, payment data — gets scrubbed before it goes into a general-purpose tool, or handled only in approved, enterprise-grade tooling.',
  },
  {
    title: 'You own the verification step',
    body: 'A drafted RCA, customer reply, or triage summary is a starting point. Checking it against the actual evidence before it ships is still your job, not the model’s.',
  },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview',
    title: 'Anthropic: Prompt engineering overview',
    desc: 'How to write clear, structured prompts for tasks like log summarization',
  },
  {
    href: 'https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations',
    title: 'Anthropic: Reducing hallucinations',
    desc: 'Concrete techniques for grounding a model’s output in real evidence',
  },
  {
    href: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
    title: 'OWASP Top 10 for LLM Applications',
    desc: 'Risks like hallucination and sensitive information disclosure to watch for',
  },
  {
    href: 'https://www.nist.gov/itl/ai-risk-management-framework',
    title: 'NIST AI Risk Management Framework',
    desc: 'A neutral, government framework for trustworthy, accountable AI use',
  },
];

const TRAINING_NOTES = [
  {
    title: 'The fifth topic is a tool, not a protocol — the lesson shape still held',
    body: 'HTTP, Auth, Events, and RCA are all "how the system behaves" topics. This one is "how you work," but the same primer → resources → concept-check → scenario-checklist structure fit without forcing it — a sign the pattern generalizes rather than being HTTP-specific.',
  },
  {
    title: 'The scenario intentionally contains a wrong answer',
    body: 'The sample AI-drafted summary in this lesson\'s exercise cites the wrong status code on purpose. The point isn\'t to distrust AI output by default — it\'s to build the habit of checking a specific, falsifiable claim against the log before accepting it.',
  },
];

const CODE_EXAMPLE = `Ticket: "Messages started failing around 2pm, we didn't change anything."

Log excerpt:
14:02:11 POST /v1/messages -> 400 {"error":{"code":"invalid_recipient"}}
14:02:14 POST /v1/messages -> 400 {"error":{"code":"invalid_recipient"}}
14:02:19 POST /v1/messages -> 400 {"error":{"code":"invalid_recipient"}}

AI-drafted summary:
"The customer is hitting a 500 Internal Server Error caused by a platform
outage. Recommend escalating to the on-call engineer immediately."`;

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
  title: 'AI as a TSE — TSE Onboarding — Ninja Mountain',
  description: 'A primer on using AI tools as a force multiplier for support work — strengths, hallucination risk, data handling and verification, with exercises.',
};

export default function AiAsATsePage() {
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
          <span className="text-[#C8CCD4]">AI as a TSE</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 5 of 9
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          AI as a TSE
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Used well, AI tools compress the first draft of triage, summarization and RCA writing
          from minutes to seconds. Used carelessly, they hand a customer a confident, wrong answer.
        </p>

        {/* Definitions */}
        <section className="py-14">
          <SectionHeader
            title="Force multiplier, not force of truth"
            intro="The value is speed on the first draft. The risk is treating that draft as verified fact."
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
            intro="Look at the sanitized ticket, log, and AI-drafted summary below, then work through both exercises."
          />
          <pre
            aria-label="Example ticket, log excerpt, and AI-drafted summary"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <AiConceptCheck />
            <AiScenarioChecklist />
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
