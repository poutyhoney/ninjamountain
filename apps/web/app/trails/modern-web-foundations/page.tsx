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
    title: 'Scripting Fluency',
    body: 'Python, JavaScript/Node.js, TypeScript, and Bash — picking the right tool for a one-off script.',
    href: '/trails/modern-web-foundations/scripting-fluency',
  },
  {
    title: 'Full-Stack Production Bar',
    body: 'Reading fluency in an unfamiliar language, plus the review, testing, and rollout practices that make a change production-grade.',
    href: '/trails/modern-web-foundations/full-stack-production-bar',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This trail is narrower than its original placeholder scope',
    body: 'The original placeholder described HTML/CSS/JS foundations broadly. These two lessons are the job-market-driven subset built so far — general scripting fluency and the production practices around any language — not a full HTML/CSS/JS curriculum.',
  },
  {
    title: 'One module here is a flagged gap-priority',
    body: "Full-Stack Production Bar was Tom's #10 self-identified gap from the job-hunting skills scan — sequenced second, after Scripting Fluency, since it builds on that lesson's language vocabulary.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Modern Web Foundations — Ninja Mountain',
  description: 'Structured lessons for scripting fluency and the full-stack production bar.',
};

export default function ModernWebFoundationsPage() {
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
          <span className="text-[#C8CCD4]">Modern Web Foundations</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Language fluency and production practices
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Modern Web Foundations
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Two topics, one lesson each: a short primer, links to primary documentation, and
          exercises to prove the concept has stuck. Start with Scripting Fluency.
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
