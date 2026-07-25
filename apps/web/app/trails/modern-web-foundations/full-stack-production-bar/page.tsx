import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import ProdBarConceptCheck from './ProdBarConceptCheck';
import ProdBarScenarioChecklist from './ProdBarScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Practice = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const PRACTICES: Practice[] = [
  { name: 'Code review',          body: 'Every change gets read critically by someone else before merging — catching what the author could not see in their own diff.' },
  { name: 'Testing',               body: "Enough automated coverage that a change's blast radius is caught before a human notices it in production." },
  { name: 'Safe deploys',          body: 'Rolling out gradually — canary, feature flag, staged rollout — so a bad change affects a fraction of traffic, not everyone at once.' },
  { name: 'Observability hooks',   body: 'New code ships with enough logging and metrics to answer "is this working" without needing a follow-up deploy just to add visibility.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://go.dev/doc/effective_go',
    title: 'Go Docs: Effective Go',
    desc: 'Idiomatic Go, for picking up the language\'s conventions fast',
  },
  {
    href: 'https://www.ruby-lang.org/en/documentation/quickstart/',
    title: 'Ruby Docs: Getting started',
    desc: 'The official quickstart for a language you may only touch occasionally',
  },
  {
    href: 'https://launchdarkly.com/docs/home/releases/progressive-rollouts',
    title: 'LaunchDarkly Docs: Progressive rollouts',
    desc: 'What a staged rollout actually looks like in practice',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This is a flagged gap-priority module',
    body: "Full-Stack Production Bar was Tom's #10 self-identified gap across a scan of 30+ job descriptions — the ask, in company language, was usually \"comfortable across the stack, not just one language.\"",
  },
  {
    title: 'The Go/Ruby comparison is about pattern recognition, not translation',
    body: "The goal isn't memorizing syntax mappings between languages — it's recognizing the same conceptual shape (lookup, error handling, response) regardless of which language it's written in.",
  },
];

const CODE_EXAMPLE = `// Go: an HTTP handler
func handleOrder(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    order, err := store.GetOrder(id)
    if err != nil {
        http.Error(w, err.Error(), http.StatusNotFound)
        return
    }
    json.NewEncoder(w).Encode(order)
}

# Ruby (Rails-style): the same shape
def show
  order = Order.find(params[:id])
  render json: order
rescue ActiveRecord::RecordNotFound
  render json: { error: "not found" }, status: :not_found
end`;

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
  title: 'Full-Stack Production Bar — Modern Web Foundations — Ninja Mountain',
  description: 'A primer on reading fluency across languages and the production practices that make a change production-grade, with exercises.',
};

export default function ProdBarLessonPage() {
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
          <Link href="/trails/modern-web-foundations" className="hover:text-[#E9ECF2]">Modern Web Foundations</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Full-Stack Production Bar</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 2 of 2 · ⭐ Gap priority
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Full-Stack Production Bar
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Picking up a legacy service outside your comfort language is a lot less daunting once
          you know what to look for first — and what &quot;production-grade&quot; actually requires.
        </p>

        {/* Definitions: reading fluency */}
        <section className="py-14">
          <SectionHeader
            title="Reading fluency across languages"
            intro="You don't need expertise in every language — you need enough fluency to navigate one safely."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              Reading fluency means being able to navigate an unfamiliar codebase, recognize
              common idioms and structure, and make a safe, pattern-matching change — not writing
              idiomatic code from scratch without reference. Before touching anything, find the{' '}
              <strong className="text-[#E9ECF2]">test suite</strong> (it documents intended
              behavior), the <strong className="text-[#E9ECF2]">dependency manifest</strong>{' '}
              (Gemfile, composer.json, go.mod — what&apos;s actually available), and an{' '}
              <strong className="text-[#E9ECF2]">existing similar pattern</strong> to follow
              instead of inventing a new one.
            </p>
          </div>
        </section>

        {/* Definitions: the production bar */}
        <section className="py-14">
          <SectionHeader
            title="The production bar"
            intro="Four practices separate code that works from code that's actually production-grade."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {PRACTICES.map(({ name, body }) => (
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
            intro="Compare the two implementations below, then work through both exercises."
          />
          <pre
            aria-label="Example Go and Ruby HTTP handlers"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <ProdBarConceptCheck />
            <ProdBarScenarioChecklist />
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
