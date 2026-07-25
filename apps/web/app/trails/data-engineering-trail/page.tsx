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
    title: 'Observability & Log Analysis',
    body: 'Structured logs, correlation IDs, and reading Datadog/Splunk/Prometheus dashboards as one picture instead of three.',
    href: '/trails/data-engineering-trail/observability-log-analysis',
  },
  {
    title: 'Modern Data Stack Foundations',
    body: 'Snowflake, BigQuery, dbt, and the ELT model — orienting yourself in an unfamiliar warehouse fast.',
    href: '/trails/data-engineering-trail/modern-data-stack-foundations',
  },
  {
    title: 'Data Pipelines & Transformation',
    body: 'Airflow DAGs, backfills, and why a pipeline can fail silently for days before anyone notices.',
    href: '/trails/data-engineering-trail/data-pipelines-transformation',
  },
];

const TRAINING_NOTES = [
  {
    title: 'Two of these three modules are a flagged gap-priority',
    body: "Modern data stack fluency was the #4 self-identified gap from Tom's job-hunting skills scan, spanning both the warehouse layer and the pipeline/transformation layer — hence two modules covering it instead of one.",
  },
  {
    title: 'Only build the link once the destination exists',
    body: 'Each topic card only becomes clickable when its lesson page ships, matching the convention set by TSE Onboarding.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Data Engineering Trail — Ninja Mountain',
  description: 'Structured lessons for observability, the modern data stack, and data pipelines.',
};

export default function DataEngineeringTrailPage() {
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
          <span className="text-[#C8CCD4]">Data Engineering Trail</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Pipelines, warehouses, and observability
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Data Engineering Trail
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Three topics, one lesson each: a short primer, links to primary documentation, and
          exercises to prove the concept has stuck. Start with Observability &amp; Log Analysis.
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
