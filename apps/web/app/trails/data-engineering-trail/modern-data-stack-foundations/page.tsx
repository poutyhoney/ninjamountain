import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import DataStackConceptCheck from './DataStackConceptCheck';
import DataStackScenarioChecklist from './DataStackScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Layer = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const LAYERS: Layer[] = [
  { name: 'Warehouse',        body: 'Snowflake, BigQuery, Databricks — where raw and transformed data actually lives, built for large analytical scans rather than fast transactional reads.' },
  { name: 'ELT (not ETL)',    body: 'Modern stacks load raw data first, then transform it inside the warehouse — flipping the older ETL order now that warehouse compute is cheap enough to do transforms there.' },
  { name: 'dbt',              body: 'The transformation layer — SQL that turns raw loaded tables into clean, tested, documented models, version-controlled like application code.' },
  { name: 'BI / semantic layer', body: 'Where a business question gets answered against the transformed models, without every analyst reinventing the same join.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://docs.snowflake.com/en/user-guide/intro-key-concepts',
    title: 'Snowflake Docs: Key concepts and architecture',
    desc: 'Warehouses, databases, and how Snowflake separates storage from compute',
  },
  {
    href: 'https://docs.getdbt.com/docs/introduction',
    title: 'dbt Developer Hub: What is dbt?',
    desc: 'The transformation layer this lesson\'s exercises are built around',
  },
  {
    href: 'https://cloud.google.com/bigquery/docs/introduction',
    title: 'Google Cloud: BigQuery overview',
    desc: 'A second major warehouse, for comparison against Snowflake',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This is a flagged gap-priority module',
    body: "Modern data stack fluency was Tom's #4 self-identified gap across a scan of 30+ job descriptions. It's split across this lesson (the warehouse and transformation layer) and the next one (pipelines and orchestration).",
  },
  {
    title: 'Naming conventions below are common, not universal',
    body: 'stg_/fct_/dim_ prefixes come from dbt\'s own style guide and dimensional modeling generally — a real warehouse may use different conventions, but the underlying raw/staging/mart distinction is nearly universal.',
  },
];

const CODE_EXAMPLE = `-- unfamiliar warehouse: staging/mart naming tells you where to start
select
  d.plan_name,
  count(*) as customers
from analytics.fct_subscriptions f
join analytics.dim_customers d
  on f.customer_id = d.customer_id
where f.status = 'active'
group by d.plan_name;`;

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
  title: 'Modern Data Stack Foundations — Data Engineering Trail — Ninja Mountain',
  description: 'A primer on the warehouse, ELT, dbt, and semantic layers, and orienting yourself in an unfamiliar warehouse, with exercises.',
};

export default function DataStackLessonPage() {
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
          <Link href="/trails/data-engineering-trail" className="hover:text-[#E9ECF2]">Data Engineering Trail</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Modern Data Stack Foundations</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 2 of 3 · ⭐ Gap priority
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Modern Data Stack Foundations
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Joining tables in a warehouse you&apos;ve never touched to answer a one-off business
          question is a lot less intimidating once you know what to look for first.
        </p>

        {/* Definitions: the stack layer by layer */}
        <section className="py-14">
          <SectionHeader
            title="The stack, layer by layer"
            intro="Four layers cover most of what a 'modern data stack' actually means in practice."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {LAYERS.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: reading someone else's warehouse */}
        <section className="py-14">
          <SectionHeader
            title="Reading someone else's warehouse for the first time"
            intro="Orient yourself by naming convention before you write a single query."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              Look for a schema or dataset naming pattern — raw, staging, and mart (or marts)
              layers are close to universal, even when the exact prefix differs. If dbt is in use,
              its generated docs site and lineage graph will show you exactly how a mart model
              traces back to its raw source, faster than reading the SQL yourself. Distinguish{' '}
              <strong className="text-[#E9ECF2]">fact</strong> tables (events, transactions) from{' '}
              <strong className="text-[#E9ECF2]">dimension</strong> tables (descriptive attributes
              you join facts against) before you write your first query.
            </p>
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Look at the sanitized query below, then work through both exercises."
          />
          <pre
            aria-label="Example SQL query in an unfamiliar warehouse"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <DataStackConceptCheck />
            <DataStackScenarioChecklist />
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
