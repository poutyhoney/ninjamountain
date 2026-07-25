import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import EventsConceptCheck from './EventsConceptCheck';
import EventsScenarioChecklist from './EventsScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Concept = { title: string; body: string };
type Resource = { href: string; title: string; desc: string };

const CONCEPTS: Concept[] = [
  {
    title: 'Push, not pull',
    body: 'A webhook is the provider calling your endpoint the moment something happens, instead of you repeatedly polling to ask "did anything change?"',
  },
  {
    title: 'At-least-once delivery',
    body: 'Most platforms retry a webhook until they get a fast 2xx response. That guarantees delivery, but means the same event can arrive more than once.',
  },
  {
    title: 'Idempotency',
    body: 'Because delivery can duplicate, your handler must recognize an event it has already processed — usually by tracking the event ID — and safely no-op the second time.',
  },
  {
    title: 'Ordering isn’t guaranteed',
    body: 'Retries and parallel delivery mean events can arrive out of sequence. Reconstruct order from a timestamp or sequence number in the payload, never from arrival order.',
  },
  {
    title: 'Signature verification',
    body: 'A receiving endpoint should verify a signature (typically an HMAC over the raw body) before trusting a payload — otherwise anyone who finds the URL can post fake events.',
  },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://webhooks.fyi/',
    title: 'webhooks.fyi',
    desc: 'Vendor-neutral webhook best practices: delivery, retries, and design',
  },
  {
    href: 'https://webhooks.fyi/security/overview',
    title: 'webhooks.fyi: Security',
    desc: 'Signature verification and other techniques to trust inbound events',
  },
  {
    href: 'https://developer.mozilla.org/en-US/docs/Glossary/Idempotent',
    title: 'MDN: Idempotent',
    desc: 'What idempotency means and which HTTP methods guarantee it',
  },
  {
    href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After',
    title: 'MDN: Retry-After header',
    desc: 'How a server tells a client when it’s safe to retry a request',
  },
];

const TRAINING_NOTES = [
  {
    title: 'Webhooks turn distributed-systems problems into support tickets',
    body: 'At-least-once delivery, ordering, and idempotency are classic distributed-systems concerns, but as a TSE you meet them as "the customer says they got the event twice" or "it never arrived." Framing the lesson around delivery guarantees rather than one vendor’s webhook format keeps it portable across products.',
  },
  {
    title: 'A third lesson, the same two exercise shapes',
    body: 'Concept check (useState, throwaway) and scenario checklist (localStorage + useSyncExternalStore, persisted) now repeat for a third topic with its own tse-events-lesson-* storage prefix. At this point the shape is proven enough that a shared component would be reasonable — worth revisiting once RCA and AI as a TSE are built too.',
  },
];

const CODE_EXAMPLE = `POST https://api.customer.com/webhooks/messaging HTTP/1.1
X-Webhook-Signature: t=1710000000,v1=5257a869e7...
X-Event-Id: evt_8f2c1a
Content-Type: application/json

{
  "event": "message.delivered",
  "message_sid": "SM4d2f91",
  "timestamp": "2026-07-20T14:02:11Z"
}

Delivery attempt 1 → customer endpoint timed out after 15s (no response)
Delivery attempt 2 (retry, +30s) → customer endpoint responded 200 OK`;

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
  title: 'Events — TSE Onboarding — Ninja Mountain',
  description: 'A primer on webhooks, at-least-once delivery, idempotency, ordering and signature verification, with exercises.',
};

export default function EventsLessonPage() {
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
          <span className="text-[#C8CCD4]">Events</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 3 of 9
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Events
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          &quot;It didn&apos;t fire&quot; and &quot;it fired twice&quot; are the two support tickets every webhook system
          eventually produces. Both trace back to the same handful of delivery guarantees.
        </p>

        {/* Definitions */}
        <section className="py-14">
          <SectionHeader
            title="How event delivery actually works"
            intro="Webhooks trade the simplicity of request/response for the complexity of an asynchronous, retried, unordered channel."
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
            intro="Look at the sanitized delivery log below, then work through both exercises."
          />
          <pre
            aria-label="Example webhook delivery log"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <EventsConceptCheck />
            <EventsScenarioChecklist />
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
