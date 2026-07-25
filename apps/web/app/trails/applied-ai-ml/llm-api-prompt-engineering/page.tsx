import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import LlmApiConceptCheck from './LlmApiConceptCheck';
import LlmApiScenarioChecklist from './LlmApiScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Technique = { name: string; body: string };
type FailureMode = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const TECHNIQUES: Technique[] = [
  { name: 'Few-shot examples',     body: 'Show the model two or three examples of the exact input→output shape you want, instead of describing it abstractly.' },
  { name: 'Step-by-step reasoning', body: 'Asking the model to reason through steps — or breaking a task into stages yourself — improves accuracy on harder tasks.' },
  { name: 'System prompt scoping', body: "The system message sets persistent behavior and constraints, separate from the user's actual request — the first place to fix a misbehaving assistant." },
  { name: 'Structured output',     body: 'Constraining the model to emit valid JSON against a schema, so downstream code can parse the response without fragile string parsing.' },
];

const FAILURE_MODES: FailureMode[] = [
  { name: 'Hallucination',          body: 'The model states something false with full confidence — no error, no signal, just wrong.' },
  { name: 'Prompt injection',       body: 'Untrusted input — a webpage, a document, a user message — contains instructions the model follows as if they came from you.' },
  { name: 'Context window overflow', body: 'Once conversation history exceeds the context limit, older content gets silently truncated or the request fails, depending on the client.' },
  { name: 'Non-determinism',        body: 'Even at low temperature, the same prompt can produce a different response run to run — design around this rather than assuming exact repeatability.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview',
    title: 'Anthropic: Prompt engineering overview',
    desc: 'The official starting point for how to structure prompts for Claude',
  },
  {
    href: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/chain-of-thought',
    title: 'Anthropic: Chain of thought prompting',
    desc: 'Letting the model reason before answering, and why that improves harder tasks',
  },
  {
    href: 'https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview',
    title: 'Anthropic: Tool use overview',
    desc: 'The mechanism behind structured, schema-constrained output',
  },
  {
    href: 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/',
    title: 'OWASP: LLM01:2025 Prompt Injection',
    desc: 'The top-ranked risk in the OWASP Gen AI security project, explained in depth',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This module is the foundation, not the gap',
    body: "LLM API fluency wasn't itself a named gap in the job-hunting scan, but Agentic Engineering in Production (the next lesson) assumes this vocabulary — tool calls, system prompts, structured output all show up there again.",
  },
  {
    title: 'The example API shape is illustrative',
    body: "Exact request/response fields vary by provider (Anthropic, OpenAI, etc.) — the pattern (system message, user message, structured response) is what to carry between them, not this exact JSON.",
  },
];

const CODE_EXAMPLE = `POST /v1/chat/completions
{
  "model": "claude-...",
  "system": "Classify the ticket. Respond with JSON only: {\\"category\\": string, \\"severity\\": string}",
  "messages": [
    { "role": "user", "content": "Customer says invoices are duplicating after every retry." }
  ]
}

Response:
{
  "category": "billing",
  "severity": "high"
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
  title: 'LLM API Use & Prompt Engineering — Applied AI/ML — Ninja Mountain',
  description: 'A primer on the chat completion API shape, prompting techniques, and common LLM failure modes, with exercises.',
};

export default function LlmApiLessonPage() {
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
          <span className="text-[#C8CCD4]">LLM API Use &amp; Prompt Engineering</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 1 of 4
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          LLM API Use &amp; Prompt Engineering
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Prototyping a feature that summarizes support tickets starts with the same handful of
          concepts, whichever model or provider ends up underneath.
        </p>

        {/* Definitions: prompting techniques */}
        <section className="py-14">
          <SectionHeader
            title="Prompt engineering techniques"
            intro="Four techniques cover most of what moves a prompt from 'roughly works' to reliable."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {TECHNIQUES.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: failure modes */}
        <section className="py-14">
          <SectionHeader
            title="Common failure modes"
            intro="None of these are edge cases — expect to see all four regularly."
          />
          <div className="grid gap-4 sm:grid-cols-2">
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
            intro="Look at the sanitized request/response below, then work through both exercises."
          />
          <pre
            aria-label="Example chat completion request and response"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <LlmApiConceptCheck />
            <LlmApiScenarioChecklist />
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
