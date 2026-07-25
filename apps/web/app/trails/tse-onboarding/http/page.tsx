import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import HttpConceptCheck from './HttpConceptCheck';
import HttpScenarioChecklist from './HttpScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Method = { method: string; body: string };
type StatusFamily = { range: string; label: string; body: string };
type Resource = { href: string; title: string; desc: string };

const METHODS: Method[] = [
  { method: 'GET',    body: 'Read a resource. Should not change server state, and is safe to retry or cache.' },
  { method: 'POST',   body: 'Create a resource or trigger an action that usually has side effects.' },
  { method: 'PUT',    body: 'Replace a resource entirely with the payload sent.' },
  { method: 'PATCH',  body: 'Apply a partial update to a resource — only the fields included change.' },
  { method: 'DELETE', body: 'Remove a resource.' },
];

const STATUS_FAMILIES: StatusFamily[] = [
  { range: '2xx', label: 'Success',       body: 'The request was received, understood and accepted — e.g. 200 OK, 201 Created, 204 No Content.' },
  { range: '3xx', label: 'Redirection',   body: 'Further action is needed to complete the request — e.g. 301 Moved Permanently, 304 Not Modified.' },
  { range: '4xx', label: 'Client error',  body: 'Something about the request itself is wrong — e.g. 400 Bad Request, 401 Unauthorized, 404 Not Found.' },
  { range: '5xx', label: 'Server error',  body: 'The request was valid, but the server failed while handling it — e.g. 500 Internal Server Error, 503 Service Unavailable.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
    title: 'MDN: An overview of HTTP',
    desc: 'The protocol from first principles — start here',
  },
  {
    href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods',
    title: 'MDN: HTTP request methods',
    desc: 'GET, POST, PUT, PATCH, DELETE and the rest, in detail',
  },
  {
    href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status',
    title: 'MDN: HTTP response status codes',
    desc: 'The full list, organized by family, with meanings',
  },
  {
    href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages',
    title: 'MDN: HTTP messages',
    desc: 'How a request and response are actually structured on the wire',
  },
  {
    href: 'https://web.dev/learn/http',
    title: 'web.dev: Learn HTTP',
    desc: 'A guided course that builds on the same fundamentals',
  },
];

const TRAINING_NOTES = [
  {
    title: 'A primer links out instead of repeating the docs',
    body: "The definitions on this page are intentionally short. The goal is enough context to make the MDN pages make sense on a first read, not to replace them.",
  },
  {
    title: "Reveal-to-check and persisted-checklist are two different exercise shapes",
    body: "The concept check is throwaway state (useState) since answers aren't meant to be tracked. The scenario checklist reuses the localStorage + useSyncExternalStore pattern from the onboard page's DiagnosticChecklist, under its own storage key prefix so the two don't collide.",
  },
];

const CODE_EXAMPLE = `POST /v1/messages HTTP/1.1
Authorization: Bearer <redacted>
Content-Type: application/json

{
  "to": "+15551234567",
  "body": "Your appointment is confirmed."
}

HTTP/1.1 400 Bad Request
{
  "error": {
    "code": "invalid_recipient",
    "message": "The 'to' field is not a valid phone number"
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
  title: 'HTTP — TSE Onboarding — Ninja Mountain',
  description: 'A primer on the request/response cycle, methods, status codes and headers, with exercises.',
};

export default function HttpLessonPage() {
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
          <span className="text-[#C8CCD4]">HTTP</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 1 of 9
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          HTTP
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Every API request a customer sends is an HTTP request. Before you can diagnose why one
          failed, you need to be fluent in the shape of the protocol itself.
        </p>

        {/* Definitions: the request/response cycle */}
        <section className="py-14">
          <SectionHeader
            title="The request/response cycle"
            intro="A client sends a request; a server sends back a response. That's the whole protocol — everything else is detail on top of this."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              A request has a <strong className="text-[#E9ECF2]">method</strong> (what you want to do),
              a <strong className="text-[#E9ECF2]">path</strong> (what you want to do it to),{' '}
              <strong className="text-[#E9ECF2]">headers</strong> (metadata like auth and content type),
              and sometimes a <strong className="text-[#E9ECF2]">body</strong> (the data you&apos;re sending).
              A response has a <strong className="text-[#E9ECF2]">status code</strong> (what happened),
              its own headers, and usually a body describing the result or the error.
            </p>
          </div>
        </section>

        {/* Definitions: methods */}
        <section className="py-14">
          <SectionHeader
            title="Methods"
            intro="The method tells the server what kind of operation the client intends."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {METHODS.map(({ method, body }) => (
              <article key={method} className={card}>
                <h3 className="mb-2 font-mono font-semibold text-[#8B6CFF]">{method}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: status codes */}
        <section className="py-14">
          <SectionHeader
            title="Status code families"
            intro="You don't need to memorize every code — just the family, and a handful of specific ones you'll see constantly."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {STATUS_FAMILIES.map(({ range, label, body }) => (
              <article key={range} className={card}>
                <h3 className="mb-2 font-semibold">
                  <span className="font-mono text-[#8B6CFF]">{range}</span>
                  <span className="text-[#6F7684]"> — {label}</span>
                </h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Look at the sanitized request and response below, then work through both exercises."
          />
          <pre
            aria-label="Example HTTP request and response"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <HttpConceptCheck />
            <HttpScenarioChecklist />
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
