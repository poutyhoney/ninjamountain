import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────

type NamingRow = { concept: string; aws: string; azure: string; gcp: string };

const NAMING: NamingRow[] = [
  { concept: 'Human identity', aws: 'IAM User', azure: 'Microsoft Entra ID account', gcp: 'Google Account' },
  { concept: 'Non-human (app/workload) identity', aws: 'IAM Role (assumed)', azure: 'Managed Identity / Service Principal', gcp: 'Service Account' },
  { concept: 'Permission grant', aws: 'IAM Policy (JSON, attached to user/role/group)', azure: 'RBAC Role Assignment', gcp: 'IAM Policy Binding' },
  { concept: 'Grouping resources for permission scope', aws: 'Account / Organization', azure: 'Resource Group / Subscription / Management Group', gcp: 'Project / Folder / Organization' },
];

const BUILDING_BLOCKS: { title: string; body: string }[] = [
  { title: 'Identity', body: 'Who or what is making the request — a person, or a non-human identity representing an application or workload.' },
  { title: 'Role', body: 'A named set of permissions, designed to be assumed temporarily rather than tied permanently to one identity.' },
  { title: 'Policy', body: 'The actual grant — a statement of which actions are allowed or denied on which resources.' },
  { title: 'Resource hierarchy', body: 'Permissions are usually inherited down a tree (organization → project/account → resource), so a policy set high up can apply broadly without repeating it everywhere.' },
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
  title: 'IAM Basics Across Clouds — Knowledge — Ninja Mountain',
  description: 'The shared identity, role, and policy model behind AWS IAM, Microsoft Entra ID, and GCP IAM.',
};

export default function CloudIamBasicsPage() {
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
          <span className="text-[#C8CCD4]">IAM Basics Across Clouds</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Cloud fundamentals
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          IAM Basics Across Clouds
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Every provider answers the same question &mdash; who can do what, to which resource
          &mdash; with the same handful of building blocks under different names.
        </p>

        {/* Building blocks */}
        <section className="py-14">
          <SectionHeader
            title="The shared building blocks"
            intro="Four pieces show up in every provider's IAM model, whichever vendor's console you're looking at."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {BUILDING_BLOCKS.map(({ title, body }) => (
              <article key={title} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Naming table */}
        <section className="py-14">
          <SectionHeader
            title="Same model, different names"
            intro="The mental model transfers directly between providers — only the vocabulary and console layout change."
          />
          <div className="overflow-x-auto rounded-[18px] border border-[#202431]">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
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

        {/* Note on GCP hierarchy nuance */}
        <section className="py-14">
          <article className={card}>
            <h3 className="mb-2 font-semibold text-[#E9ECF2]">One nuance worth remembering</h3>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              GCP&apos;s resource hierarchy (Organization → Folder → Project → Resource) is the
              most explicit about permission inheritance flowing downward. AWS Organizations and
              Azure Management Groups do the same thing conceptually, but it&apos;s easier to miss
              since a plain AWS account or Azure subscription can exist without ever touching the
              org-level tooling.
            </p>
          </article>
        </section>

        {/* Related */}
        <section className="py-14">
          <div className={card}>
            <h3 className="mb-2 font-semibold text-[#E9ECF2]">Related</h3>
            <p className="text-sm text-[#6F7684]">
              See <strong className="text-[#C8CCD4]">IAM</strong>,{' '}
              <strong className="text-[#C8CCD4]">IAM role</strong>,{' '}
              <strong className="text-[#C8CCD4]">IAM policy</strong>, and{' '}
              <strong className="text-[#C8CCD4]">service account</strong> in the{' '}
              <Link href="/knowledge/glossary" className="text-[#8B6CFF] hover:underline">
                Glossary
              </Link>
              . For the security principle behind role design, see least-privilege IAM in{' '}
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
