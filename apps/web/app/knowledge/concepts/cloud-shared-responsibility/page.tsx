import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────

type ServiceModelRow = { model: string, example: string, provider: string, customer: string };

const SERVICE_MODELS: ServiceModelRow[] = [
  {
    model: 'IaaS',
    example: 'AWS EC2 · Azure VMs · GCP Compute Engine',
    provider: 'Physical hosts, hypervisor, networking, storage hardware, facility security',
    customer: 'Guest OS patching, runtime, applications, data, network/firewall config, IAM',
  },
  {
    model: 'PaaS',
    example: 'AWS RDS · Azure App Service · GCP Cloud SQL',
    provider: 'Everything in IaaS, plus the OS, runtime patching, and platform availability',
    customer: 'Application code, data, access configuration, and how the service is used',
  },
  {
    model: 'SaaS',
    example: 'Google Workspace · Microsoft 365 · Salesforce',
    provider: 'Nearly the entire stack, including the application itself',
    customer: 'Data entered into the service, user access, and account-level configuration',
  },
];

const PROVIDER_NOTES: { provider: string; body: string }[] = [
  { provider: 'AWS', body: 'Calls it the "Shared Responsibility Model" — AWS is responsible for security of the cloud, the customer is responsible for security in the cloud.' },
  { provider: 'Azure', body: 'Uses the same "Shared Responsibility Model" name and the same of/in split, with a chart showing responsibility shifting further toward Microsoft as you move from IaaS to SaaS.' },
  { provider: 'GCP', body: 'Uses "Shared Fate" — framing security as a partnership rather than a strict handoff: Google takes on more operational responsibility (e.g. secure-by-default infrastructure) and provides guidance/tooling to help customers hold up their side, rather than leaving them fully on their own.' },
];

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
  title: 'Shared Responsibility Model — Knowledge — Ninja Mountain',
  description: 'Who secures what in the cloud, how the split shifts across IaaS/PaaS/SaaS, and how AWS, Azure, and GCP each frame it.',
};

export default function CloudSharedResponsibilityPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] font-sans text-[#E9ECF2]">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#6F7684]">
          <Link href="/" className="hover:text-[#E9ECF2]">Home</Link>
          <span>›</span>
          <Link href="/knowledge" className="hover:text-[#E9ECF2]">Knowledge</Link>
          <span>›</span>
          <Link href="/knowledge/concepts" className="hover:text-[#E9ECF2]">Concepts</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Shared Responsibility Model</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Cloud fundamentals
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Shared Responsibility Model
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Moving to the cloud doesn&apos;t make security someone else&apos;s problem — it splits the
          problem in two, and where the line falls depends on what you&apos;re buying.
        </p>

        {/* Core split */}
        <section className="py-14">
          <div className="grid gap-4 sm:grid-cols-2">
            <article className={card}>
              <h3 className="mb-2 font-semibold text-[#8B6CFF]">Security of the cloud</h3>
              <p className="text-sm leading-relaxed text-[#6F7684]">
                The provider&apos;s job: physical data-center security, host hardware, the
                virtualization layer, and the global network — the infrastructure everything else
                runs on top of. Customers can&apos;t inspect or change this layer, and generally
                don&apos;t need to.
              </p>
            </article>
            <article className={card}>
              <h3 className="mb-2 font-semibold text-[#8B6CFF]">Security in the cloud</h3>
              <p className="text-sm leading-relaxed text-[#6F7684]">
                The customer&apos;s job: what you configure and put on top — data, access
                permissions, network rules, and (depending on the service) the OS and application
                code. Most real-world cloud breaches trace back to a misconfiguration here, not a
                failure of the provider&apos;s infrastructure.
              </p>
            </article>
          </div>
        </section>

        {/* Service model table */}
        <section className="py-14">
          <SectionHeader
            title="The split shifts by service model"
            intro="The more managed the service, the more the provider absorbs — but the customer is never fully off the hook."
          />
          <div className="overflow-x-auto rounded-[18px] border border-[#202431]">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#202431] bg-[#151821] text-[#C8CCD4]">
                  <th className="px-5 py-3 font-semibold">Model</th>
                  <th className="px-5 py-3 font-semibold">Provider handles</th>
                  <th className="px-5 py-3 font-semibold">Customer handles</th>
                </tr>
              </thead>
              <tbody>
                {SERVICE_MODELS.map((row, i) => (
                  <tr key={row.model} className={i % 2 === 0 ? 'bg-[#0A0B0F]' : 'bg-[#0D0F16]'}>
                    <td className="px-5 py-4 align-top">
                      <span className="font-medium text-[#E9ECF2]">{row.model}</span>
                      <span className="mt-1 block text-xs text-[#6F7684]">{row.example}</span>
                    </td>
                    <td className="px-5 py-4 align-top text-[#6F7684]">{row.provider}</td>
                    <td className="px-5 py-4 align-top text-[#6F7684]">{row.customer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Provider framing */}
        <section className="py-14">
          <SectionHeader
            title="How each provider frames it"
            intro="The underlying split is nearly identical — the language and emphasis differ slightly."
          />
          <div className="space-y-4">
            {PROVIDER_NOTES.map(({ provider, body }) => (
              <article key={provider} className={card}>
                <h3 className="mb-2 font-semibold text-[#E9ECF2]">{provider}</h3>
                <p className="text-sm leading-relaxed text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Analogy */}
        <section className="py-14">
          <SectionHeader title="A practical analogy" intro="" />
          <article className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              Think of it like <strong className="text-[#C8CCD4]">renting an apartment</strong>.
              The landlord secures the building — the foundation, the locks on the main entrance,
              the fire suppression system. You secure your own unit — you lock your door, you don&apos;t
              prop a window open, and you decide who gets a key. If someone walks in because you left
              the door unlocked, that&apos;s not a building failure.
            </p>
          </article>
        </section>

        {/* Related */}
        <section className="py-14">
          <div className={card}>
            <h3 className="mb-2 font-semibold text-[#E9ECF2]">Related</h3>
            <p className="text-sm text-[#6F7684]">
              See <strong className="text-[#C8CCD4]">shared responsibility model</strong> and{' '}
              <strong className="text-[#C8CCD4]">IAM</strong> in the{' '}
              <Link href="/knowledge/glossary" className="text-[#8B6CFF] hover:underline">
                Glossary
              </Link>
              , and least-privilege IAM in{' '}
              <Link
                href="/trails/cloud-native-essentials/production-security-deployment"
                className="text-[#8B6CFF] hover:underline"
              >
                Production Security &amp; Deployment Models
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
