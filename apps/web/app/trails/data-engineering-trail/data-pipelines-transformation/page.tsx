import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import PipelinesConceptCheck from './PipelinesConceptCheck';
import PipelinesScenarioChecklist from './PipelinesScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Concept = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const CONCEPTS: Concept[] = [
  { name: 'DAG',              body: "The definition of a pipeline's tasks and their dependencies — which steps must finish before others start, with no cycles." },
  { name: 'Task',             body: 'A single unit of work in the DAG — run a script, execute a dbt model, load a file.' },
  { name: 'Schedule / trigger', body: 'When the DAG runs — a cron-like schedule, or triggered by an external event such as a file landing or an API call.' },
  { name: 'Backfill',         body: 'Re-running a DAG for past dates to fill in or fix historical data, instead of only ever running forward from now.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html',
    title: 'Apache Airflow Docs: DAGs',
    desc: 'The core scheduling/dependency concept this lesson is built around',
  },
  {
    href: 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/index.html',
    title: 'Apache Airflow Docs: Core concepts',
    desc: 'Tasks, operators, and DAG runs, from the official documentation',
  },
  {
    href: 'https://docs.getdbt.com/docs/build/models',
    title: 'dbt Developer Hub: About dbt models',
    desc: 'What the transformation step (as opposed to orchestration) actually looks like',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This is a flagged gap-priority module',
    body: "This lesson continues the same gap as Modern Data Stack Foundations — modern data stack fluency, Tom's #4 self-identified gap — but on the orchestration and pipeline side rather than the warehouse side.",
  },
  {
    title: 'The failure pattern below is common, not exaggerated',
    body: 'A pipeline that fails silently for days because no alert was configured is one of the most frequently reported real-world data engineering incidents — worth treating as a default risk to guard against, not an edge case.',
  },
];

const CODE_EXAMPLE = `DAG: nightly_customer_sync
  2026-07-19  task: extract_customers   SUCCESS
  2026-07-19  task: load_to_warehouse   FAILED  (upstream schema changed: dropped column "region")
  2026-07-20  task: extract_customers   SUCCESS
  2026-07-20  task: load_to_warehouse   FAILED  (same error, no alert configured on this DAG)
  2026-07-21  task: extract_customers   SUCCESS
  2026-07-21  task: load_to_warehouse   FAILED  (same error)`;

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
  title: 'Data Pipelines & Transformation — Data Engineering Trail — Ninja Mountain',
  description: 'A primer on Airflow DAGs, backfills, and why a pipeline can fail silently for days, with exercises.',
};

export default function PipelinesLessonPage() {
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
          <span className="text-[#C8CCD4]">Data Pipelines &amp; Transformation</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 3 of 3 · ⭐ Gap priority
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Data Pipelines &amp; Transformation
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          A nightly pipeline silently stopped backfilling three days ago, and nobody noticed
          until someone asked why a dashboard looked stale.
        </p>

        {/* Definitions: orchestration vs transformation */}
        <section className="py-14">
          <SectionHeader
            title="Orchestration vs. transformation"
            intro="Airflow and dbt solve different problems, and are almost always used together, not as alternatives."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              <strong className="text-[#E9ECF2]">Airflow</strong> orchestrates — it decides{' '}
              <em>when</em> tasks run and in what order, and retries or alerts when they fail.{' '}
              <strong className="text-[#E9ECF2]">dbt</strong> defines <em>what</em> a specific
              transformation actually does once it runs. A typical nightly job is an Airflow task
              that triggers a dbt run, not one tool replacing the other.
            </p>
          </div>
        </section>

        {/* Definitions: core Airflow concepts */}
        <section className="py-14">
          <SectionHeader
            title="Core Airflow concepts"
            intro="Four terms cover most of what you'll need to read someone else's pipeline."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {CONCEPTS.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-mono font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Look at the sanitized DAG run history below, then work through both exercises."
          />
          <pre
            aria-label="Example Airflow DAG run history"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <PipelinesConceptCheck />
            <PipelinesScenarioChecklist />
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
