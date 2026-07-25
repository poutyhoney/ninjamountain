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
    title: 'HTTP',
    body: 'The request/response cycle, methods, status codes, and headers — the shared language of every API.',
    href: '/trails/tse-onboarding/http',
  },
  {
    title: 'Auth',
    body: 'Telling identity failures apart from permission failures: API keys, OAuth, JWTs, scopes and roles.',
    href: '/trails/tse-onboarding/auth',
  },
  {
    title: 'Events',
    body: 'Webhooks, retries, ordering, idempotency, and diagnosing missing or duplicate callbacks.',
    href: '/trails/tse-onboarding/events',
  },
  {
    title: 'RCA',
    body: 'Assessing impact, escalating with evidence, and writing root-cause analyses that prevent recurrence.',
    href: '/trails/tse-onboarding/rca',
  },
  {
    title: 'AI as a TSE',
    body: 'Using AI tools as a force multiplier — triaging tickets, summarizing logs, and drafting RCAs faster without losing rigor.',
    href: '/trails/tse-onboarding/ai-as-a-tse',
  },
  {
    title: 'Support & GTM Toolbelt',
    body: 'Zendesk, Jira, Linear, LaunchDarkly, and billing tools — the stack a ticket actually passes through.',
    href: '/trails/tse-onboarding/support-gtm-toolbelt',
  },
  {
    title: 'API Debugging in the Field',
    body: 'Turning a customer’s "it just stopped working" into a reproducible request in Postman.',
    href: '/trails/tse-onboarding/api-debugging',
  },
  {
    title: 'Live Demo & Technical Storytelling',
    body: 'Structuring a walkthrough, narrating through a live failure, and handling questions you don’t have the answer to.',
    href: '/trails/tse-onboarding/live-demo-storytelling',
  },
  {
    title: 'SSO & Identity Edge Cases',
    body: 'What breaks when a whole company logs in through their own identity provider instead of your user table.',
    href: '/trails/tse-onboarding/sso-identity-edge-cases',
  },
];

const TRAINING_NOTES = [
  {
    title: 'Trails carries the lesson structure, the field guide carries the map',
    body: "/projects/onboard stays the single-page overview of TSE skills. This trail is where each of those topics grows into a real lesson — definitions, source reading, and an exercise — one topic at a time.",
  },
  {
    title: 'Only build the link once the destination exists',
    body: "Each topic card only becomes clickable when its lesson page ships. That keeps the trail honest about what's actually built versus what's still a plan.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'TSE Onboarding — Ninja Mountain',
  description: 'Structured lessons for the field skills behind supporting API products.',
};

export default function TseOnboardingPage() {
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
          <span className="text-[#C8CCD4]">TSE Onboarding</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Support the builders behind API products
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          TSE Onboarding
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Nine topics, one lesson each: a short primer, links to primary documentation, and
          exercises to prove the concept has stuck. Start with HTTP.
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
