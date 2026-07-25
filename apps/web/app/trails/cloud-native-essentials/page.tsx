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
    title: 'Containers & Orchestration',
    body: 'Images vs. containers, core Kubernetes objects, and the failure modes you’ll actually see in production.',
    href: '/trails/cloud-native-essentials/containers-orchestration',
  },
  {
    title: 'Cloud Platforms & Core Ops',
    body: 'AWS/GCP/Azure equivalents, CI/CD pipeline stages, and the Linux/networking fundamentals underneath both.',
    href: '/trails/cloud-native-essentials/cloud-platforms-core-ops',
  },
  {
    title: 'Infrastructure as Code',
    body: 'Terraform, Pulumi, and CloudFormation — declarative infra, state, and diagnosing drift.',
    href: '/trails/cloud-native-essentials/infrastructure-as-code',
  },
  {
    title: 'Production Security & Deployment Models',
    body: 'Least-privilege access, secrets handling, and what changes when a customer needs an on-prem or air-gapped install.',
    href: '/trails/cloud-native-essentials/production-security-deployment',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This trail leads with a gap, not a warm-up',
    body: 'Containers & Orchestration is sequenced first because it was the #1 self-identified gap from a scan of 30+ job descriptions — not because it’s the easiest starting point. Expect it to take longer than the others.',
  },
  {
    title: 'Only build the link once the destination exists',
    body: 'Each topic card only becomes clickable when its lesson page ships, matching the convention set by TSE Onboarding — the trail stays honest about what’s actually built versus what’s still planned.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Cloud Native Essentials — Ninja Mountain',
  description: 'Structured lessons for containers, orchestration, cloud platforms, infrastructure as code, and production deployment models.',
};

export default function CloudNativeEssentialsPage() {
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
          <span className="text-[#C8CCD4]">Cloud Native Essentials</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Containers, cloud platforms, and the infra underneath them
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Cloud Native Essentials
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Four topics, one lesson each: a short primer, links to primary documentation, and
          exercises to prove the concept has stuck. Start with Containers &amp; Orchestration.
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
