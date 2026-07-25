import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import AgenticConceptCheck from './AgenticConceptCheck';
import AgenticScenarioChecklist from './AgenticScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type BuildingBlock = { name: string; body: string };
type FailureMode = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const BUILDING_BLOCKS: BuildingBlock[] = [
  { name: 'Tool / function calling', body: "The model doesn't take actions itself — it emits a structured request to call a tool, your code executes it, and the result goes back into context." },
  { name: 'MCP',                    body: 'A standard protocol for exposing tools and resources to a model consistently, instead of every integration inventing its own function-calling schema.' },
  { name: 'RAG',                    body: 'Retrieval-Augmented Generation — searching your own data at request time and injecting the relevant chunks into context, instead of relying on what the model memorized in training.' },
  { name: 'Evals',                  body: 'A test suite for a prompt or agent — a fixed set of inputs with expected properties of the output, run automatically whenever the prompt or model changes.' },
];

const FAILURE_MODES: FailureMode[] = [
  { name: 'Tool-call hallucination', body: 'The model calls a tool with a plausible-looking but invalid argument — a wrong ID, a made-up parameter — and no error surfaces until something downstream breaks.' },
  { name: 'Missing guardrails',      body: 'A demo has one happy path; production has retries, partial failures, and adversarial input the demo never exercised.' },
  { name: 'No eval coverage',        body: 'Without evals, a prompt or model change that silently breaks one case takes days to notice instead of failing a test in CI.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://www.anthropic.com/engineering/building-effective-agents',
    title: 'Anthropic: Building effective agents',
    desc: 'Workflows vs. agents, and why the simplest composable pattern usually wins',
  },
  {
    href: 'https://modelcontextprotocol.io/',
    title: 'Model Context Protocol: official docs',
    desc: 'The standard this trail\'s own tool ecosystem is built on',
  },
  {
    href: 'https://www.anthropic.com/engineering/contextual-retrieval',
    title: 'Anthropic: Contextual retrieval',
    desc: 'A concrete, measured technique for making RAG retrieval actually reliable',
  },
  {
    href: 'https://docs.claude.com/en/docs/test-and-evaluate/develop-tests',
    title: 'Anthropic: Create strong empirical evaluations',
    desc: 'How to build the test suite that catches a regression before production does',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This is a flagged gap-priority module',
    body: "Agentic engineering in production — evals, RAG, MCP — was the #2 self-identified gap across Tom's job-hunting skills scan, right behind Cloud Native Essentials' top gap.",
  },
  {
    title: 'The trace below is a common pattern, not a hypothetical',
    body: 'A model inventing a plausible-looking ID instead of calling a lookup tool first is one of the most frequently reported agentic failures in production systems — it is worth treating as a default risk, not an edge case.',
  },
];

const CODE_EXAMPLE = `Agent trace:
  User: "Refund the customer's last order."
  Tool call: refund_order(order_id="ord_9f8e7d")
  Tool result: Error — order_id not found

  (order_id was hallucinated; no real "last order" lookup
   was ever called first)`;

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
  title: 'Agentic Engineering in Production — Applied AI/ML — Ninja Mountain',
  description: 'A primer on tool calling, MCP, RAG, and evals, and why agents fail differently in production than in a demo, with exercises.',
};

export default function AgenticLessonPage() {
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
          <span className="text-[#C8CCD4]">Agentic Engineering in Production</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 2 of 4 · ⭐ Gap priority
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Agentic Engineering in Production
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          An agent works perfectly in the demo, then hallucinates a tool call the first week it&apos;s
          live. The gap between those two moments is what this lesson is about.
        </p>

        {/* Definitions: core building blocks */}
        <section className="py-14">
          <SectionHeader
            title="Core building blocks"
            intro="Four concepts turn a single LLM call into something that can actually take action."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {BUILDING_BLOCKS.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-mono font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: why demo != production */}
        <section className="py-14">
          <SectionHeader
            title="Why the demo works and production doesn't"
            intro="Three gaps account for most of the difference."
          />
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {FAILURE_MODES.map(({ name, body }) => (
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
            intro="Look at the sanitized agent trace below, then work through both exercises."
          />
          <pre
            aria-label="Example agent tool-call trace"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <AgenticConceptCheck />
            <AgenticScenarioChecklist />
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
