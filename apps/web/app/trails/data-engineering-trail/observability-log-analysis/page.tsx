import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import ObservabilityConceptCheck from './ObservabilityConceptCheck';
import ObservabilityScenarioChecklist from './ObservabilityScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Tool = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const TOOLS: Tool[] = [
  { name: 'Datadog',              body: 'Unified logs, metrics, and traces with strong out-of-box dashboards — common at product-led companies.' },
  { name: 'Splunk',                body: 'The original enterprise log-search platform — a powerful query language (SPL), common in larger and regulated environments.' },
  { name: 'Prometheus',            body: 'Pull-based metrics collection with its own query language (PromQL) — the default in Kubernetes-native stacks, usually paired with Grafana.' },
  { name: 'CloudWatch / Azure Monitor', body: "The cloud provider's native, first-party observability tool — the default when you haven't set up anything else yet." },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://docs.datadoghq.com/getting_started/',
    title: 'Datadog Docs: Getting started',
    desc: 'The unified logs/metrics/traces platform, from the source',
  },
  {
    href: 'https://prometheus.io/docs/introduction/overview/',
    title: 'Prometheus Docs: Overview',
    desc: 'The pull-based, Kubernetes-native default for metrics',
  },
  {
    href: 'https://opentelemetry.io/docs/concepts/signals/traces/',
    title: 'OpenTelemetry Docs: Traces',
    desc: 'What a trace ID actually is, from the vendor-neutral standard',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This module opens the trail, but isn\'t itself the flagged gap',
    body: "Modern data stack fluency (the next two lessons) was the named gap in the job-hunting scan — this lesson is the prerequisite vocabulary: correlating a log line, a metric, and a trace by a shared ID.",
  },
  {
    title: 'Header and field names vary by tool',
    body: 'The example below uses generic field names (level, trace_id) — real tools use their own conventions (Datadog\'s dd.trace_id, Splunk\'s indexed fields), but the underlying correlation concept is identical.',
  },
];

const CODE_EXAMPLE = `{"level":"error","ts":"2026-07-22T14:03:11Z","trace_id":"9f2a1c...","service":"checkout","msg":"payment provider timeout","latency_ms":30021}

[Alert] p99 latency for checkout > 5000ms (14:02–14:05 UTC)
[Alert] error rate for checkout > 2% (14:02–14:06 UTC)`;

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
  title: 'Observability & Log Analysis — Data Engineering Trail — Ninja Mountain',
  description: 'A primer on structured logs, correlation IDs, and reading logs/metrics/traces as one picture, with exercises.',
};

export default function ObservabilityLessonPage() {
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
          <span className="text-[#C8CCD4]">Observability &amp; Log Analysis</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 1 of 3
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Observability &amp; Log Analysis
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          An error spike shows up in three different dashboards during an incident. Correlating
          them fast — not staring at each one separately — is the actual skill.
        </p>

        {/* Definitions: the tools */}
        <section className="py-14">
          <SectionHeader
            title="The tools"
            intro="Four platforms cover most of what you'll be handed access to on day one."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {TOOLS.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: correlating a spike */}
        <section className="py-14">
          <SectionHeader
            title="Correlating a spike across dashboards"
            intro="A timestamp alone can't tell two concurrent requests apart. A trace ID can."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              A <strong className="text-[#E9ECF2]">trace</strong> or{' '}
              <strong className="text-[#E9ECF2]">correlation ID</strong> is generated once per
              request and threaded through every log line, metric, and span it touches, across
              every service it passes through. When an error log, a latency alert, and an error-rate
              alert all reference the same service and time window, they are very likely the same
              underlying incident — the trace ID is how you confirm it instead of guessing from
              timing alone.
            </p>
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Look at the sanitized log line and alerts below, then work through both exercises."
          />
          <pre
            aria-label="Example log line and dashboard alerts"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <ObservabilityConceptCheck />
            <ObservabilityScenarioChecklist />
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
