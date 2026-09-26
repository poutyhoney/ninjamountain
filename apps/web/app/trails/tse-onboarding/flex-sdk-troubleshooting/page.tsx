import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import FlexConceptCheck from './FlexConceptCheck';
import FlexScenarioChecklist from './FlexScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type SdkConcept = { name: string; body: string };
type FailureMode = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const SDK_CONCEPTS: SdkConcept[] = [
  { name: 'Worker (WK…)',       body: 'The agent\'s identity in TaskRouter — activity state (Available, Reserved, WrapUp), attributes, skills.' },
  { name: 'Task (WT…)',         body: 'A unit of work waiting to be routed — a call, a chat, an email. Carries attributes a Workflow uses to route it.' },
  { name: 'Reservation (WR…)',  body: 'One worker\'s offer to handle one task. Its status — pending, accepted, rejected, timeout, canceled — is where most "agent can\'t accept" bugs actually live.' },
  { name: 'Conversation',       body: 'The Conversations-SDK-backed thread behind a chat/email task — participants, transcript, and its own independent lifecycle from the task that spawned it.' },
  { name: 'Voice client',       body: 'The embedded Voice SDK connection carrying call audio and controls — a task can be "accepted" in TaskRouter while this is still silently broken.' },
];

const FAILURE_MODES: FailureMode[] = [
  {
    name: 'AcceptTask drops call context',
    body: 'For voice tasks, you must register a VoiceClientEvent listener before calling AcceptTask. Skip it and acceptance can succeed while the agent gets no audio or call controls.',
  },
  {
    name: 'Worker stuck in Reserved or WrapUp',
    body: 'The reservation only clears when the client actually calls CompleteTask (and WrapUpTask, if wrap-up is configured). A call that errors silently — or never fires — parks the worker indefinitely.',
  },
  {
    name: 'Token refresh failure',
    body: 'Error 45775 — the refresh token is malformed, expired, or clock-skewed. Fixing validateToken/refreshToken locally isn\'t enough: the session stays stale until the client actually calls client.updateToken with the new pair.',
  },
  {
    name: 'Degraded SDK client',
    body: 'If TaskRouter, Conversations, Voice, or Sync fails to initialize, Flex loads anyway in a reduced-capability "degraded" state. A degraded Voice client next to a healthy TaskRouter client reads like a routing bug, not a connectivity one.',
  },
  {
    name: 'Conversations task orphaning',
    body: 'Several distinct causes, not one bug: a declined Interaction invite cancels the task but leaves the conversation open; inviting a participant already in another open conversation fails silently; an unhandled workflow.timeout/task.canceled/task.deleted leaves nothing tracking the conversation at all.',
  },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://www.twilio.com/docs/flex/developer/flex-sdk/sdk-methods',
    title: 'Twilio Docs: Flex SDK methods',
    desc: 'The full method reference — AcceptTask, CompleteTask, updateToken, and the rest',
  },
  {
    href: 'https://www.twilio.com/docs/flex/developer/flex-sdk/authentication',
    title: 'Twilio Docs: Flex SDK authentication',
    desc: 'Login details, token exchange, and the client lifecycle end to end',
  },
  {
    href: 'https://www.twilio.com/docs/api/errors/45775',
    title: 'Twilio Docs: Error 45775',
    desc: 'Failed to refresh token — causes and the correct updateToken recovery path',
  },
  {
    href: 'https://www.twilio.com/docs/flex/developer/conversations/best-practices',
    title: 'Twilio Docs: Flex Conversations best practices',
    desc: 'The specific patterns (close timers, known-agent routing) that prevent orphaned conversations',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This builds on Events and SSO edge cases, not repeats them',
    body: 'Events covers webhooks/retries/idempotency in the abstract; SSO & Identity Edge Cases covers enterprise federation. This lesson is where both show up inside one stateful client SDK — a reservation is basically an event you have to act on, and a Flex token refresh is SSO\'s token-exchange problem with a shorter clock.',
  },
  {
    title: 'Grounded in live Twilio docs, not invented',
    body: 'The failure modes here — error 45775, the VoiceClientEvent listener requirement, the three distinct Conversations-orphaning causes — came from the twilio-docs MCP, the same sourcing discipline the Support Triage Assistant\'s grounding packs use.',
  },
];

const CODE_EXAMPLE = `{
  "reservation": {
    "sid": "WRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "worker_sid": "WKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "task_sid": "WTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "reservation_status": "wrapping",
    "date_created": "2026-07-29T18:02:11Z",
    "date_updated": "2026-07-29T18:14:47Z"
  },
  "worker": {
    "activity_sid": "WAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "activity_name": "WrapUp",
    "available": false
  }
}

16:14:03 | log   | SessionState: setting degraded to false
16:14:47 | warn  | AcceptTask resolved but no VoiceClientEvent listener was registered
16:14:52 | error | 45775: Failed to refresh token. Invalid token provided.`;

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
  title: 'Flex SDK Troubleshooting — TSE Onboarding — Ninja Mountain',
  description: 'What the Flex SDK owns, how the task lifecycle actually breaks, and how to tell a routing bug from a connectivity one.',
};

export default function FlexSdkTroubleshootingLessonPage() {
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
          <span className="text-[#C8CCD4]">Flex SDK Troubleshooting</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 9 of 10
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Flex SDK Troubleshooting
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Same support fundamentals — HTTP, auth, events — running inside a richer state
          machine: workers, tasks, and reservations that can each fail independently.
        </p>

        {/* Definitions: what the SDK owns */}
        <section className="py-14">
          <SectionHeader
            title="What the SDK owns"
            intro="@twilio/flex-sdk gives a custom app the same building blocks the stock Flex UI is built on."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SDK_CONCEPTS.map(({ name, body }) => (
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
            title="Where it breaks: five real failure modes"
            intro="Each of these looks like a different bug from the outside — knowing which layer owns it is most of the diagnosis."
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
            intro="Read the sanitized reservation payload and console excerpt below, then work through both exercises."
          />
          <pre
            aria-label="Example stuck reservation payload and console log"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <FlexConceptCheck />
            <FlexScenarioChecklist />
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
