import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import ApiDebugConceptCheck from './ApiDebugConceptCheck';
import ApiDebugScenarioChecklist from './ApiDebugScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type PostmanFeature = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const POSTMAN_FEATURES: PostmanFeature[] = [
  { name: 'Environments',         body: 'Swap keys and hosts between sandbox and production without rewriting a single request.' },
  { name: 'Collections',          body: 'Group related requests into something shareable — engineering can rerun the exact same calls, not a paraphrase of them.' },
  { name: 'Pre-request scripts',  body: 'Compute a signature, timestamp, or auth header automatically before the request goes out.' },
  { name: 'Tests (assertions)',   body: 'Assert the response matches what you expect, so rerunning the same request later catches a regression instead of requiring a manual re-read.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://learning.postman.com/docs/sending-requests/requests/',
    title: 'Postman Docs: Building requests',
    desc: 'The mechanics of assembling and sending a request from scratch',
  },
  {
    href: 'https://learning.postman.com/docs/sending-requests/variables/managing-environments/',
    title: 'Postman Docs: Managing environments',
    desc: 'Keeping sandbox and production requests interchangeable',
  },
  {
    href: 'https://docs.stripe.com/api/idempotent_requests',
    title: 'Stripe Docs: Idempotent requests',
    desc: 'The clearest widely-cited explanation of why idempotency keys matter on retry',
  },
  {
    href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429',
    title: 'MDN: 429 Too Many Requests',
    desc: 'What the status code means and which headers accompany it',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This builds on HTTP, not repeats it',
    body: "HTTP covers the protocol vocabulary — methods, status codes, headers. This lesson is the workflow for using that vocabulary to reproduce a live customer-reported bug, with Postman as the tool.",
  },
  {
    title: 'Rate-limit header names vary by provider',
    body: 'X-RateLimit-* here is illustrative — some APIs use different header names or a Retry-After-only pattern. Confirm the actual headers in the docs for whichever API you\'re debugging.',
  },
];

const CODE_EXAMPLE = `POST /v1/messages HTTP/1.1
Authorization: Bearer <redacted>
Idempotency-Key: 8f14e45f-ceea-467e-bd42-4a6f3d1e9c21

HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1717000000

{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests. Retry after 30 seconds."
  }
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
  title: 'API Debugging in the Field — TSE Onboarding — Ninja Mountain',
  description: 'A primer on turning a vague customer bug report into a reproducible Postman request, with exercises.',
};

export default function ApiDebugLessonPage() {
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
          <span className="text-[#C8CCD4]">API Debugging in the Field</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 7 of 9
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          API Debugging in the Field
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          &quot;The API just stopped working&quot; is never the actual bug. Turning that sentence into a
          reproducible request is the entire job.
        </p>

        {/* Definitions: the bug report is never the bug */}
        <section className="py-14">
          <SectionHeader
            title="The bug report is never the bug"
            intro="A customer describes an outcome, not a request. Your first job is translating one into the other."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              &quot;It just stopped working&quot; could mean a 401, a 429, a 500, or a client-side bug that
              never reaches your API at all. Before you touch a debugger, get as close as you can
              to the <strong className="text-[#E9ECF2]">actual request</strong> — method, path,
              headers, body — that the customer&apos;s system sent. Everything downstream depends on
              starting from something concrete instead of a paraphrase.
            </p>
          </div>
        </section>

        {/* Definitions: Postman features */}
        <section className="py-14">
          <SectionHeader
            title="Building a repro in Postman"
            intro="Four features turn a one-off request into something reusable and shareable."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {POSTMAN_FEATURES.map(({ name, body }) => (
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
            aria-label="Example rate-limited API request and response"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <ApiDebugConceptCheck />
            <ApiDebugScenarioChecklist />
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
