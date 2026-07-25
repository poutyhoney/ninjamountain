import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import TrainingNotes from '../../components/TrainingNotes';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Topic = {
  title: string;
  body: string;
  href?: string;
};

const TOPICS: Topic[] = [
  {
    title: 'LLM API Use & Prompt Engineering',
    body: 'The core chat completion shape, prompting techniques, and the failure modes — hallucination, injection, non-determinism.',
    href: '/trails/applied-ai-ml/llm-api-prompt-engineering',
  },
  {
    title: 'Agentic Engineering in Production',
    body: 'Tool calling, MCP, RAG, and evals — why the demo works and production doesn’t, without them.',
    href: '/trails/applied-ai-ml/agentic-engineering-production',
  },
  {
    title: 'AI-Assisted Development Tooling',
    body: 'Copilot, Cursor, Claude Code, and ChatGPT as daily tools — and how code review changes once they’re writing a share of it.',
    href: '/trails/applied-ai-ml/ai-assisted-development-tooling',
  },
  {
    title: 'Low-Code/No-Code Automation',
    body: 'n8n, Zapier, and Make — the shared trigger/action/mapping model, and when a workflow has outgrown a visual builder.',
    href: '/trails/applied-ai-ml/low-code-automation',
  },
];

const TRAINING_NOTES = [
  {
    title: 'One module here is a flagged gap-priority',
    body: "Agentic Engineering in Production was the #2 self-identified gap from Tom's job-hunting skills scan, right behind Cloud Native Essentials' top gap — it's sequenced second in this trail for that reason.",
  },
  {
    title: 'Only build the link once the destination exists',
    body: 'Each topic card only becomes clickable when its lesson page ships, matching the convention set by TSE Onboarding.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Applied AI/ML — Ninja Mountain',
  description: 'Structured lessons for LLM APIs, agentic engineering, AI-assisted development tooling, and low-code automation.',
};

export default function AppliedAiMlPage() {
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
          <span className="text-[#C8CCD4]">Applied AI/ML</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Prompting, agents, tooling, and automation
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Applied AI/ML
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Four topics, one lesson each: a short primer, links to primary documentation, and
          exercises to prove the concept has stuck. Start with LLM API Use &amp; Prompt Engineering.
        </p>

        {/* Topics */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map(({ title, body, href }) => {
            const card = (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-[#E9ECF2]">{title}</h3>
                  {!href && (
                    <span className="inline-flex rounded-full bg-[#202431] px-2.5 py-1 text-xs text-[#6F7684]">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6F7684]">{body}</p>
                {href && (
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#8B6CFF]">
                    Start lesson <span aria-hidden="true">→</span>
                  </span>
                )}
              </>
            );

            const cardClassName =
              'block rounded-[18px] border border-[#202431] bg-[#151821] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.23)] transition' +
              (href ? ' hover:border-[#8B6CFF]/40' : ' opacity-80');

            return href ? (
              <Link key={title} href={href} className={cardClassName}>
                {card}
              </Link>
            ) : (
              <article key={title} className={cardClassName}>
                {card}
              </article>
            );
          })}
        </div>

        {/* Training Notes */}
        <section className="py-14">
          <TrainingNotes notes={TRAINING_NOTES} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
