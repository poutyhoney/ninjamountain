import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────

type NamingRow = { concept: string; aws: string; azure: string; gcp: string };

const NAMING: NamingRow[] = [
  { concept: 'Region', aws: 'Region (e.g. us-east-1)', azure: 'Region (e.g. East US)', gcp: 'Region (e.g. us-central1)' },
  { concept: 'Isolated location within a region', aws: 'Availability Zone (AZ)', azure: 'Availability Zone', gcp: 'Zone' },
  { concept: 'Points close to end users for low-latency delivery', aws: 'Edge Location / CloudFront PoP', azure: 'Point of Presence (Azure Front Door)', gcp: 'Edge Point of Presence (Cloud CDN)' },
];

const WHY_IT_MATTERS: { title: string; body: string }[] = [
  { title: 'Latency', body: 'Picking a region close to your users cuts round-trip time; edge locations push cacheable content even closer, without moving the origin.' },
  { title: 'Resilience', body: 'Spreading a workload across multiple AZs within a region means one data center failing (power, network, fire) doesn’t take the whole system down.' },
  { title: 'Data residency & compliance', body: 'Some regulations require customer data to stay within a specific country or region — the region you pick can be a compliance decision, not just a performance one.' },
  { title: 'Disaster recovery', body: 'Multi-region designs protect against a failure that takes out an entire region, not just a single zone — at the cost of more complexity and cross-region data sync.' },
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
  title: 'Regions, Zones & Edge Locations — Knowledge — Ninja Mountain',
  description: 'The geography of the cloud: regions, availability zones, and edge locations, and why the difference matters.',
};

export default function CloudRegionsZonesEdgePage() {
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
          <span className="text-[#C8CCD4]">Regions, Zones &amp; Edge Locations</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Cloud fundamentals
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Regions, Zones &amp; Edge Locations
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          The cloud isn&apos;t one giant computer somewhere &mdash; it&apos;s a hierarchy of physical
          locations, and where you place things changes latency, resilience, and compliance.
        </p>

        {/* Core definitions */}
        <section className="py-14">
          <div className="grid gap-4 sm:grid-cols-3">
            <article className={card}>
              <h3 className="mb-2 font-semibold text-[#8B6CFF]">Region</h3>
              <p className="text-sm leading-relaxed text-[#6F7684]">
                A geographic area a provider operates in (e.g. &ldquo;US East&rdquo;), made up of
                multiple isolated locations. Most resources are created within a single region.
              </p>
            </article>
            <article className={card}>
              <h3 className="mb-2 font-semibold text-[#8B6CFF]">Availability Zone</h3>
              <p className="text-sm leading-relaxed text-[#6F7684]">
                One isolated location within a region &mdash; its own power, cooling, and networking
                &mdash; so a failure in one zone shouldn&apos;t take down the others.
              </p>
            </article>
            <article className={card}>
              <h3 className="mb-2 font-semibold text-[#8B6CFF]">Edge location</h3>
              <p className="text-sm leading-relaxed text-[#6F7684]">
                A smaller facility, in far more cities than regions exist, used to cache or serve
                content close to end users &mdash; the mechanism behind a CDN.
              </p>
            </article>
          </div>
        </section>

        {/* Naming table */}
        <section className="py-14">
          <SectionHeader
            title="Same hierarchy, different names"
            intro="AWS, Azure, and GCP all use a region → zone → edge hierarchy — the terms just don't line up one-to-one."
          />
          <div className="overflow-x-auto rounded-[18px] border border-[#202431]">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#202431] bg-[#151821] text-[#C8CCD4]">
                  <th className="px-5 py-3 font-semibold">Concept</th>
                  <th className="px-5 py-3 font-semibold">AWS</th>
                  <th className="px-5 py-3 font-semibold">Azure</th>
                  <th className="px-5 py-3 font-semibold">GCP</th>
                </tr>
              </thead>
              <tbody>
                {NAMING.map((row, i) => (
                  <tr key={row.concept} className={i % 2 === 0 ? 'bg-[#0A0B0F]' : 'bg-[#0D0F16]'}>
                    <td className="px-5 py-4 align-top font-medium text-[#E9ECF2]">{row.concept}</td>
                    <td className="px-5 py-4 align-top text-[#6F7684]">{row.aws}</td>
                    <td className="px-5 py-4 align-top text-[#6F7684]">{row.azure}</td>
                    <td className="px-5 py-4 align-top text-[#6F7684]">{row.gcp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Why it matters */}
        <section className="py-14">
          <SectionHeader
            title="Why the choice matters"
            intro="Picking a region or spreading across zones isn't just an ops detail — it's a design decision with real tradeoffs."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {WHY_IT_MATTERS.map(({ title, body }) => (
              <article key={title} className={card}>
                <h3 className="mb-2 font-semibold text-[#E9ECF2]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Related */}
        <section className="py-14">
          <div className={card}>
            <h3 className="mb-2 font-semibold text-[#E9ECF2]">Related</h3>
            <p className="text-sm text-[#6F7684]">
              See <strong className="text-[#C8CCD4]">region</strong>,{' '}
              <strong className="text-[#C8CCD4]">availability zone</strong>, and{' '}
              <strong className="text-[#C8CCD4]">edge location</strong> in the{' '}
              <Link href="/knowledge/glossary" className="text-[#8B6CFF] hover:underline">
                Glossary
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
