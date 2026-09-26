import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Term = { term: string; body: string };

const TERMS: Term[] = [
  { term: 'Agent', body: 'A system that uses an LLM to decide which actions to take — calling tools, reading files, calling APIs — rather than following a fixed script, often looping until a task is done.' },
  { term: 'AI (Artificial Intelligence)', body: 'The broader goal of building systems that perform tasks associated with human intelligence, such as understanding language or recognizing images.' },
  { term: 'API (Application Programming Interface)', body: "A defined way for one piece of software to request data or actions from another, without needing to know the other side's internal implementation." },
  { term: 'Availability Zone (AZ)', body: 'An isolated location within a cloud region — its own power and networking — used to make a system resilient to a single data-center failure.' },
  { term: 'Chain of thought', body: 'Prompting a model to reason through intermediate steps before giving a final answer, which tends to improve accuracy on harder tasks.' },
  { term: 'Context window', body: 'The maximum amount of text (measured in tokens) a model can consider at once; content beyond it gets silently truncated or the request fails.' },
  { term: 'Edge location', body: 'A small facility located close to end users, used to cache or serve content (as in a CDN) with lower latency than routing every request back to a distant region.' },
  { term: 'Embedding', body: 'A numeric vector representation of text or other data that captures meaning, so similar concepts land close together in vector space — the basis for semantic search and RAG.' },
  { term: 'Fine-tuning', body: 'Further training an existing model on a smaller, task-specific dataset to specialize its behavior, rather than training a model from scratch.' },
  { term: 'Hallucination', body: 'When a model states something false with full confidence — no error, no signal, just wrong.' },
  { term: 'IAM (Identity and Access Management)', body: 'The system that defines who — or what service — can perform which actions on which resources within a cloud account.' },
  { term: 'IAM Policy', body: 'A document that grants or denies specific permissions, attached to a user, role, or group.' },
  { term: 'IAM Role', body: 'An identity with a defined set of permissions that can be assumed temporarily by a user, service, or application, instead of relying on long-lived credentials.' },
  { term: 'Inference', body: 'Running a trained model on new input to produce a prediction or output, as opposed to training the model in the first place.' },
  { term: 'LLM (Large Language Model)', body: 'A model trained on large amounts of text to predict and generate language — the technology behind most modern chat and coding assistants.' },
  { term: 'MCP (Model Context Protocol)', body: 'An open protocol that lets an LLM application connect to external tools and data sources through a standard interface, instead of custom integration code per tool.' },
  { term: 'ML (Machine Learning)', body: 'A technique for building AI by training a model on data so it learns patterns, instead of manually coding every rule.' },
  { term: 'Prompt injection', body: 'When untrusted input — a webpage, a document, a message — contains instructions that a model follows as if they came from the legitimate user.' },
  { term: 'RAG (Retrieval-Augmented Generation)', body: 'Retrieving relevant documents or data at request time and including them in the prompt, so the model answers grounded in that content instead of relying only on what it memorized during training.' },
  { term: 'Region (cloud)', body: 'A geographic area a cloud provider operates in, containing multiple isolated availability zones — chosen for latency, redundancy, and data-residency requirements.' },
  { term: 'Service account', body: 'A non-human identity used by an application or workload to authenticate and call cloud APIs, distinct from a human user account.' },
  { term: 'Shared responsibility model', body: 'The division of security duties between a cloud provider (securing the underlying infrastructure) and the customer (securing their data, access, and configuration) — the split shifts depending on whether the service is IaaS, PaaS, or SaaS.' },
  { term: 'Temperature', body: "A setting that controls how random a model's output is — low temperature favors the single most likely next token, high temperature favors more variety." },
  { term: 'Token', body: 'The unit a model actually processes, roughly a word or word-fragment — used to measure input/output length, context window limits, and cost.' },
  { term: 'Tool calling', body: "A model's ability to request that a specific function be run with structured arguments and receive the result back, rather than only returning text." },
];

const SORTED_TERMS = [...TERMS].sort((a, b) => a.term.localeCompare(b.term));

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Glossary — Knowledge — Ninja Mountain',
  description: 'Short, plain-language definitions for terms that show up across the trails and projects.',
};

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] font-sans text-[#E9ECF2]">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#6F7684]">
          <Link href="/" className="hover:text-[#E9ECF2]">Home</Link>
          <span>›</span>
          <Link href="/knowledge" className="hover:text-[#E9ECF2]">Knowledge</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Glossary</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          {SORTED_TERMS.length} terms
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Glossary
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Short definitions for terms used across the trails and projects. New terms get added
          as they come up — this list isn&apos;t meant to be exhaustive.
        </p>

        {/* Terms */}
        <div className="mt-12 space-y-3">
          {SORTED_TERMS.map(({ term, body }) => (
            <article
              key={term}
              className="rounded-2xl border border-[#202431] bg-[#151821] p-5 sm:flex sm:items-start sm:gap-6"
            >
              <h3 className="shrink-0 font-semibold text-[#8B6CFF] sm:w-64">{term}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6F7684] sm:mt-0">{body}</p>
            </article>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
