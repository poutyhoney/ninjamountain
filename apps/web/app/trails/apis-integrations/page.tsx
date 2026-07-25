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
    title: 'APIs & Integration Design',
    body: 'Resource-oriented design, versioning, pagination, and idempotency — the choices that age well.',
    href: '/trails/apis-integrations/api-integration-design',
  },
  {
    title: 'SQL & Data Basics for App Devs',
    body: 'The SQL you actually use day to day, and enough data modeling to read an unfamiliar schema.',
    href: '/trails/apis-integrations/sql-data-basics',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This is the build-it counterpart to TSE Onboarding\'s debug-it lesson',
    body: 'Support\'s "API Debugging in the Field" lesson covers reproducing a live customer bug in Postman. This trail covers designing the API in the first place — the same skills, from the other side of the request.',
  },
  {
    title: 'Neither module here is a flagged gap-priority',
    body: 'Unlike some other sections, neither of these two topics was a named gap in the job-hunting scan — they\'re foundational skills that show up across almost every job description reviewed.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'APIs & Integrations — Ninja Mountain',
  description: 'Structured lessons for API design and SQL/data fundamentals for application developers.',
};

export default function ApisIntegrationsPage() {
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
          <span className="text-[#C8CCD4]">APIs &amp; Integrations</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Designing, building, and consuming robust APIs
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          APIs &amp; Integrations
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Two topics, one lesson each: a short primer, links to primary documentation, and
          exercises to prove the concept has stuck. Start with APIs &amp; Integration Design.
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
