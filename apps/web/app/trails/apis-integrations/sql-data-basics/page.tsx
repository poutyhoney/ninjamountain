import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import SqlBasicsConceptCheck from './SqlBasicsConceptCheck';
import SqlBasicsScenarioChecklist from './SqlBasicsScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Concept = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const CONCEPTS: Concept[] = [
  { name: 'SELECT / WHERE / JOIN', body: 'Filtering rows and combining tables — the majority of queries you will ever write or debug.' },
  { name: 'GROUP BY / aggregates', body: "Collapsing many rows into a summary — counts, sums, averages per group — the shape behind almost every dashboard number." },
  { name: 'Indexes',               body: 'A lookup structure that lets the database find matching rows without scanning the whole table — the difference between instant and timed-out.' },
  { name: 'Transactions',          body: 'A group of writes that either all succeed or all roll back together — what keeps a multi-step operation from leaving data half-updated.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://www.postgresql.org/docs/current/tutorial-sql.html',
    title: 'PostgreSQL Docs: The SQL Language',
    desc: 'SELECT, JOIN, and aggregates, from the official tutorial',
  },
  {
    href: 'https://www.postgresql.org/docs/current/indexes-intro.html',
    title: 'PostgreSQL Docs: Introduction to indexes',
    desc: 'What an index actually does and when the planner will use one',
  },
  {
    href: 'https://www.postgresql.org/docs/current/tutorial-transactions.html',
    title: 'PostgreSQL Docs: Transactions',
    desc: 'The all-or-nothing guarantee behind a multi-step write',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This module isn\'t a flagged gap, but it comes up everywhere',
    body: 'SQL fluency wasn\'t a named gap in the job-hunting scan, but it was one of the most frequently required skills across all 30+ job descriptions reviewed — hence its place here rather than a dedicated module of its own.',
  },
  {
    title: 'This lesson connects to the Data trail, deliberately',
    body: 'Enough SQL and data modeling to read an unfamiliar schema is the shared prerequisite between this app-dev-facing lesson and the Data Engineering Trail\'s Modern Data Stack Foundations lesson.',
  },
];

const CODE_EXAMPLE = `-- Flagged by a PM as "the app is broken" — actually just slow
select * from orders
where customer_email = 'someone@example.com';
-- 4.2s on a 12M-row table, no index on customer_email

-- After adding an index:
create index idx_orders_customer_email on orders (customer_email);
-- same query: 8ms`;

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
  title: 'SQL & Data Basics for App Devs — APIs & Integrations — Ninja Mountain',
  description: 'A primer on the SQL you actually use day to day, indexes, transactions, and reading an unfamiliar schema, with exercises.',
};

export default function SqlBasicsLessonPage() {
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
          <Link href="/trails/apis-integrations" className="hover:text-[#E9ECF2]">APIs &amp; Integrations</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">SQL &amp; Data Basics for App Devs</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 2 of 2
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          SQL &amp; Data Basics for App Devs
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Debugging a slow query a PM flagged as &quot;the app is broken&quot; is usually a five-minute
          fix once you know what to look for.
        </p>

        {/* Definitions: core SQL */}
        <section className="py-14">
          <SectionHeader
            title="The core SQL you actually need"
            intro="Four concepts cover most of what a working app developer touches day to day."
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

        {/* Definitions: enough data modeling */}
        <section className="py-14">
          <SectionHeader
            title="Enough data modeling to be dangerous"
            intro="A handful of terms let you read an existing schema without a tutorial."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              A <strong className="text-[#E9ECF2]">primary key</strong> uniquely identifies a row
              in its own table; a <strong className="text-[#E9ECF2]">foreign key</strong> is a
              column referencing a primary key in another table, establishing a relationship
              between them. Most schemas boil down to{' '}
              <strong className="text-[#E9ECF2]">one-to-many</strong> relationships (one customer,
              many orders) and occasionally{' '}
              <strong className="text-[#E9ECF2]">many-to-many</strong> ones (many students, many
              courses) via a join table in between.
            </p>
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Look at the sanitized query and fix below, then work through both exercises."
          />
          <pre
            aria-label="Example slow query and index fix"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <SqlBasicsConceptCheck />
            <SqlBasicsScenarioChecklist />
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
