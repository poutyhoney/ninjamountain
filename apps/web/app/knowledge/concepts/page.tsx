import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Concept = { title: string; body: string; href?: string };

const CONCEPTS: Concept[] = [
  {
    title: 'AI vs. ML: The Basic Distinction',
    body: 'What separates the overall goal of AI from ML as one technique used to build it, with a spam-filter example and a cloud AI-vs-ML tools comparison.',
    href: '/knowledge/concepts/ai-vs-ml',
  },
  {
    title: 'Shared Responsibility Model',
    body: 'Who secures what in the cloud, how the split shifts across IaaS/PaaS/SaaS, and how AWS, Azure, and GCP each frame it.',
    href: '/knowledge/concepts/cloud-shared-responsibility',
  },
  {
    title: 'Regions, Zones & Edge Locations',
    body: 'The geography of the cloud — regions, availability zones, and edge locations — and why the choice affects latency, resilience, and compliance.',
    href: '/knowledge/concepts/cloud-regions-zones-edge',
  },
  {
    title: 'IAM Basics Across Clouds',
    body: 'The shared identity, role, and policy model behind AWS IAM, Microsoft Entra ID, and GCP IAM — same building blocks, different names.',
    href: '/knowledge/concepts/cloud-iam-basics',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Concepts — Knowledge — Ninja Mountain',
  description: "Deeper dives into things I've been learning, added one page at a time.",
};

export default function ConceptsPage() {
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
          <span className="text-[#C8CCD4]">Concepts</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Growing as I learn
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Concepts
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          One page per idea worth writing down properly — added as it comes up in training, not
          all at once.
        </p>

        {/* Concepts list */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {CONCEPTS.map(({ title, body, href }) => {
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
                    Read <span aria-hidden="true">→</span>
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
      </main>

      <SiteFooter />
    </div>
  );
}
