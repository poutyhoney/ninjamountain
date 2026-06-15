import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import TrainingNotes from '../../components/TrainingNotes';
import DiagnosticChecklist from './DiagnosticChecklist';

// ─── Types ────────────────────────────────────────────────────────────────────

type NavLink    = { href: string; label: string };
type Stat       = { value: string; desc: string };
type Skill      = { title: string; body: string; tags: string[] };
type Step       = { title: string; body: string };
type ToolGroup  = { title: string; items: string[] };
type Domain     = { title: string; body: string };
type Evidence   = { title: string; body: string };
type Resource   = { href: string; title: string; desc: string };

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS: NavLink[] = [
  { href: '#mission',   label: 'Mission'   },
  { href: '#skills',    label: 'Skills'    },
  { href: '#workflow',  label: 'Workflow'  },
  { href: '#tools',     label: 'Tools'     },
  { href: '#lab',       label: 'Lab'       },
  { href: '#resources', label: 'Resources' },
];

const STATS: Stat[] = [
  { value: 'HTTP',   desc: 'Requests, responses, errors' },
  { value: 'Auth',   desc: 'Tokens, scopes, identity'    },
  { value: 'Events', desc: 'Webhooks and retries'        },
  { value: 'RCA',    desc: 'Incidents and prevention'    },
];

const SKILLS: Skill[] = [
  {
    title: '1. Requests & responses',
    body:  'Understand methods, endpoints, headers, JSON bodies, status codes, versioning, pagination and error payloads.',
    tags:  ['REST', 'HTTP', 'JSON'],
  },
  {
    title: '2. Authentication & access',
    body:  'Separate identity failures from permission failures: API keys, OAuth, JWTs, scopes, roles, SSO and provisioning.',
    tags:  ['OAuth 2.0', 'JWT', 'RBAC'],
  },
  {
    title: '3. Events & webhooks',
    body:  'Diagnose missing callbacks, signature checks, retries, duplicates, ordering and customer endpoint timeouts.',
    tags:  ['Async', 'Retries', 'Idempotency'],
  },
  {
    title: '4. Customer code',
    body:  'Read integration snippets and build small reproductions using JavaScript, Python or curl.',
    tags:  ['Node.js', 'Python', 'SDKs'],
  },
  {
    title: '5. Observability',
    body:  'Correlate request IDs with logs, metrics and traces to validate scope, latency and service behavior.',
    tags:  ['Logs', 'Traces', 'Dashboards'],
  },
  {
    title: '6. Incidents & communication',
    body:  'Assess impact, escalate with evidence, communicate progress, write RCA and reduce recurrence.',
    tags:  ['Severity', 'RCA', 'Trust'],
  },
];

const WORKFLOW_STEPS: Step[] = [
  {
    title: 'Clarify impact and symptom',
    body:  'What stopped working? For whom? In which environment? When did it last succeed? Is production blocked?',
  },
  {
    title: 'Capture one failing transaction',
    body:  'Request URL and method, sanitized headers, body, timestamp, response status/body, request ID and webhook event ID.',
  },
  {
    title: 'Reproduce or compare',
    body:  'Attempt the same call using curl or Postman, compare to a known-good request, and validate API documentation or schema.',
  },
  {
    title: 'Follow boundaries',
    body:  'Check authentication, scopes, limits, platform logs, downstream dependencies, webhook delivery and customer receiver logs.',
  },
  {
    title: 'Resolve, communicate, prevent',
    body:  'Give a safe workaround or fix, document evidence, escalate defects clearly, and propose monitoring, documentation or product improvements.',
  },
];

const TOOLS: ToolGroup[] = [
  { title: 'API clients',       items: ['Postman', 'curl', 'OpenAPI / Swagger', 'GraphQL clients']       },
  { title: 'Code & testing',    items: ['VS Code', 'Git / GitHub', 'Node.js / Python', 'Docker']         },
  { title: 'Production signals',items: ['Splunk / Datadog', 'Grafana', 'OpenTelemetry', 'PagerDuty']     },
  { title: 'Collaboration',     items: ['Zendesk', 'Jira', 'Confluence / Notion', 'Slack']               },
];

const DOMAINS: Domain[] = [
  {
    title: 'Communications / Telecom',
    body:  'Real-time delivery, message or call lifecycle, webhooks, carrier dependencies, SIP, VoIP, WebRTC and TLS/network investigation.',
  },
  {
    title: 'Security / DSPM',
    body:  'Cloud connectors, classification scans, identity and permissions, findings ingestion, auditability, least privilege and API security.',
  },
  {
    title: 'AI / Creative Platforms',
    body:  'Request limits, streaming, latency, async jobs, quotas, identity/admin integrations, safety behavior and production usage monitoring.',
  },
];

const EVIDENCE: Evidence[] = [
  {
    title: 'Isolation',
    body:  'You reduced a complex symptom to a specific failing boundary using request evidence and logs.',
  },
  {
    title: 'Incident leadership',
    body:  'You assessed blast radius, aligned teams and communicated clearly during a customer-impacting failure.',
  },
  {
    title: 'Leverage',
    body:  'You transformed repeat work into automation, documentation, training, monitoring or a product improvement.',
  },
];

const RESOURCES: Resource[] = [
  {
    href:  'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    title: 'MDN: HTTP',
    desc:  'Methods, headers, status codes and protocol fundamentals',
  },
  {
    href:  'https://learning.postman.com/docs/sending-requests/requests/',
    title: 'Postman Documentation',
    desc:  'Build, send and inspect API requests',
  },
  {
    href:  'https://spec.openapis.org/oas/latest.html',
    title: 'OpenAPI Specification',
    desc:  'Describe and understand HTTP API contracts',
  },
  {
    href:  'https://owasp.org/API-Security/',
    title: 'OWASP API Security',
    desc:  'Common API security risk awareness',
  },
  {
    href:  'https://opentelemetry.io/docs/what-is-opentelemetry/',
    title: 'OpenTelemetry',
    desc:  'Vendor-neutral observability fundamentals',
  },
  {
    href:  'https://oauth.net/2/',
    title: 'OAuth 2.0',
    desc:  'Authorization concepts and references',
  },
];

const TRAINING_NOTES = [
  {
    title: "Module-level constants keep large data out of the component",
    body: "All the skills, steps, tools, and resources live as typed arrays at the top of the file. The component body stays minimal — just iteration and layout. This pattern scales well before you reach for a CMS.",
  },
  {
    title: "String constants avoid JSX angle-bracket escaping",
    body: "Code examples that include < and > are cleaner as template literals assigned to a const, then rendered inside <pre><code>. Embedding them as JSX strings requires &lt; entities or extra escaping.",
  },
  {
    title: "Anchor-based in-page nav is enough for long single-page layouts",
    body: "Adding id attributes to each section and linking to them from a sticky header gives navigation without a router. For a reference page that doesn't change URLs, this is simpler than nested routes.",
  },
  {
    title: "Small sub-components reduce JSX repetition without a separate file",
    body: "Tag and SectionHeader are defined in the same file and used in multiple sections. Extracting them to their own files only makes sense once they're shared across pages.",
  },
];

// String constant handles the angle brackets safely — no JSX escaping needed
const CODE_EXAMPLE = `POST /v1/notifications HTTP/1.1
Authorization: Bearer <redacted>
Content-Type: application/json
X-Request-ID: req_7f2a91

{
  "recipient": "+15551234567",
  "template_id": "launch_alert"
}

HTTP/1.1 401 Unauthorized
{
  "error": {
    "code": "invalid_token",
    "message": "Access token expired"
  }
}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const card = 'rounded-[18px] border border-[#202431] bg-[#151821] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.23)]';

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="mr-1 mb-1.5 inline-flex rounded-full bg-[#8B6CFF]/10 px-2.5 py-1 text-xs text-[#8B6CFF]">
      {children}
    </span>
  );
}

function SectionHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <>
      <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mb-8 max-w-2xl text-[#6F7684]">{intro}</p>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] font-sans text-[#E9ECF2]">

      <SiteHeader />

      {/* ── Hero ── */}
      <section
        className="py-20"
        style={{
          background:
            'radial-gradient(circle at 80% 12%, rgba(139,108,255,.15), transparent 31%), ' +
            'radial-gradient(circle at 12% 20%, rgba(139,108,255,.07), transparent 22%)',
        }}
      >
        <div className="mx-auto max-w-[1180px] px-5">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
            Technical Support Engineer onboarding
          </p>
          <h1 className="mb-5 mt-4 max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
            Support the builders behind API products.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[#6F7684] sm:text-xl">
            A field guide for diagnosing integrations, communicating clearly during incidents,
            and becoming the engineer customers trust when their production application depends
            on an API platform.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#skills"
              className="inline-block rounded-full bg-[#E9ECF2] px-5 py-3 font-semibold text-[#0A0B0F] transition hover:-translate-y-px"
            >
              Start learning
            </a>
            <a
              href="#lab"
              className="inline-block rounded-full border border-[#6F7684] px-5 py-3 font-semibold text-[#E9ECF2] transition hover:-translate-y-px hover:border-[#8B6CFF]"
            >
              Try the starter lab
            </a>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Core themes">
            {STATS.map(({ value, desc }) => (
              <div key={value} className={card}>
                <strong className="block text-2xl text-[#B7A7FF]">{value}</strong>
                <span className="text-sm text-[#6F7684]">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main ── */}
      <main className="mx-auto max-w-[1180px] px-5">

        {/* Mission */}
        <section id="mission" className="py-14">
          <SectionHeader
            title="The Mission"
            intro="API platform support begins where a customer's application meets a product's behavior. A senior TSE makes that boundary observable, debuggable, and trustworthy."
          />
          <div className="rounded-[18px] border border-[#8B6CFF]/[0.24] bg-gradient-to-br from-[#8B6CFF]/[0.13] to-[#8B6CFF]/[0.06] p-7">
            <blockquote className="m-0 max-w-4xl text-lg leading-relaxed sm:text-xl">
              &ldquo;I debug production integrations end-to-end: customer code, HTTP requests,
              authentication, platform processing, webhooks, logs, incidents, and business impact.&rdquo;
            </blockquote>
            <footer className="mt-4 text-[#6F7684]">
              Portable positioning for telecom, security, AI and enterprise SaaS products
            </footer>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="py-14">
          <SectionHeader
            title="Core skill map"
            intro="Learn these capabilities as a connected system. Strong support engineers do not merely recognize errors; they find the failing boundary and guide the customer to a durable resolution."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map(({ title, body, tags }) => (
              <article key={title} className={card}>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="mb-3 text-sm text-[#6F7684]">{body}</p>
                <div>{tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div>
              </article>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="py-14">
          <SectionHeader
            title="The API support investigation loop"
            intro="Use this repeatable sequence whenever a customer reports a broken integration."
          />
          <div className="flex flex-col gap-3">
            {WORKFLOW_STEPS.map(({ title, body }, i) => (
              <article
                key={title}
                className="grid items-start gap-4 rounded-[18px] border border-[#202431] bg-[#151821] p-5"
                style={{ gridTemplateColumns: '58px 1fr' }}
              >
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#8B6CFF]/[0.12] text-lg font-bold text-[#8B6CFF]">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-[#6F7684]">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section id="tools" className="py-14">
          <SectionHeader
            title="Working toolkit"
            intro="Know the purpose of each tool category. A company may change vendors, but the diagnostic job remains the same."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map(({ title, items }) => (
              <article key={title} className={card}>
                <h3 className="mb-3 font-semibold">{title}</h3>
                <ul className="space-y-1 pl-5">
                  {items.map((item) => (
                    <li key={item} className="text-sm text-[#6F7684]">{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Domains */}
        <section id="domains" className="py-14">
          <SectionHeader
            title="Same core, different product domains"
            intro="Master the portable API-support foundation first; then layer on the terminology and failure modes of a product market."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DOMAINS.map(({ title, body }) => (
              <article key={title} className={card}>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Lab */}
        <section id="lab" className="py-14">
          <SectionHeader
            title="Starter lab: investigate a failed request"
            intro="A customer says their API integration suddenly fails. Review this sanitized response and build your first diagnostic questions."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <pre
              aria-label="Example API response"
              className="m-0 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
            >
              <code>{CODE_EXAMPLE}</code>
            </pre>
            <DiagnosticChecklist />
          </div>
        </section>

        {/* Senior evidence */}
        <section id="interview" className="py-14">
          <SectionHeader
            title="Senior-level evidence"
            intro="An experienced TSE does not stop at closing cases. Build stories that demonstrate these outcomes."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EVIDENCE.map(({ title, body }) => (
              <article key={title} className={card}>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section id="resources" className="py-14">
          <SectionHeader
            title="Trusted learning resources"
            intro="Use primary documentation while building your own reproduction scripts, collections and case studies."
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
