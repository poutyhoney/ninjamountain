import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import ApiDesignConceptCheck from './ApiDesignConceptCheck';
import ApiDesignScenarioChecklist from './ApiDesignScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Choice = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const CHOICES: Choice[] = [
  { name: 'Versioning strategy',   body: "Decide once, upfront, how you'll evolve the API without breaking existing clients — a URL prefix (/v1/), a header, or a date-based version. Retrofitting this after clients exist is far more painful." },
  { name: 'Pagination',            body: 'Any endpoint that can return an unbounded list needs pagination from day one — cursor-based scales better than offset-based once the underlying data changes while paging.' },
  { name: 'Idempotency keys',      body: 'Let a client safely retry a write without risking a duplicate — the server recognizes a repeated key and returns the original result instead of creating a second one.' },
  { name: 'Consistent error shape', body: 'Every error response should have the same predictable shape — a stable code, a human message — so client code can handle errors generically instead of per-endpoint.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://cloud.google.com/apis/design/resources',
    title: 'Google Cloud: Resource-oriented design',
    desc: 'The design philosophy behind treating an API as nouns, not verbs',
  },
  {
    href: 'https://docs.stripe.com/api/versioning',
    title: 'Stripe API Reference: Versioning',
    desc: 'A widely-cited real-world versioning strategy that ships breaking changes safely',
  },
  {
    href: 'https://docs.stripe.com/api/idempotent_requests',
    title: 'Stripe Docs: Idempotent requests',
    desc: 'The mechanism this lesson\'s idempotency-key exercise is built on',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This is the build-it counterpart to Support\'s debug-it lesson',
    body: 'TSE Onboarding\'s "API Debugging in the Field" covers reproducing a customer bug in Postman. This lesson is the same underlying skills — REST fundamentals, idempotency, errors — from the design side, before an API ships.',
  },
  {
    title: 'These four choices are hard to retrofit, which is why they\'re grouped',
    body: 'Versioning, pagination, idempotency, and error shape all share one property: adding them after clients already exist is a breaking change. Getting them right on day one avoids that entirely.',
  },
];

const CODE_EXAMPLE = `Before: GET /getUserData?id=123
  - verb in the path, not a resource
  - no pagination on the nested "orders" array
  - errors return plain text, not JSON

After: GET /v1/users/123
  - resource-oriented, versioned
  - GET /v1/users/123/orders?cursor=... for the list
  - errors: { "error": { "code": "not_found", "message": "..." } }`;

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
  title: 'APIs & Integration Design — APIs & Integrations — Ninja Mountain',
  description: 'A primer on resource-oriented design, versioning, pagination, idempotency, and error shapes, with exercises.',
};

export default function ApiDesignLessonPage() {
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
          <Link href="/trails/apis-integrations" className="hover:text-[#E9ECF2]">APIs &amp; Integrations</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">APIs &amp; Integration Design</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 1 of 2
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          APIs &amp; Integration Design
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Designing the API a partner will integrate against means making a handful of choices
          correctly before anyone else&apos;s code depends on them.
        </p>

        {/* Definitions: resource-oriented design */}
        <section className="py-14">
          <SectionHeader
            title="Designing a resource-oriented API"
            intro="Model the nouns in your system, and let HTTP methods express the verbs."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              A resource-oriented API represents each thing in your system — a user, an order, a
              subscription — as an addressable path, and relies on the HTTP method (GET, POST,
              PUT, DELETE) to express the action, rather than encoding a verb into the path itself.
              This keeps the API predictable: once you know the shape of one resource, you can
              guess the shape of the next one correctly.
            </p>
          </div>
        </section>

        {/* Definitions: choices that age well */}
        <section className="py-14">
          <SectionHeader
            title="Choices that age well"
            intro="Four decisions are much cheaper to make correctly upfront than to retrofit later."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {CHOICES.map(({ name, body }) => (
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
            intro="Look at the sanitized before/after design review below, then work through both exercises."
          />
          <pre
            aria-label="Example API design review before and after"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <ApiDesignConceptCheck />
            <ApiDesignScenarioChecklist />
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
