import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import DotConstellation from './components/DotConstellation';
import NewsletterSignup from './components/NewsletterSignup';

// ─── Hero background: faint dot grid + connector path ────────────────────────

function HeroDotPattern() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="46" height="46" patternUnits="userSpaceOnUse">
          <circle cx="23" cy="23" r="1" fill="#8B6CFF" opacity="0.08" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
    </svg>
  );
}

// ─── Pathway icons (simple line icons) ───────────────────────────────────────

const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: '#8B6CFF',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const PATH_ICONS: Record<string, React.ReactNode> = {
  dojo: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  ),
  trails: (
    <svg {...iconProps}>
      <path d="M3 20 L9 8 L13 14 L16 9 L21 20 Z" />
      <path d="M7.5 13.5 L10.5 13.5" />
    </svg>
  ),
  artifacts: (
    <svg {...iconProps}>
      <path d="M12 2.5 L20.5 7 V17 L12 21.5 L3.5 17 V7 Z" />
      <path d="M3.5 7 L12 11.5 L20.5 7 M12 11.5 V21.5" />
    </svg>
  ),
  notes: (
    <svg {...iconProps}>
      <path d="M5 3.5h11l3 3V20.5H5Z" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  ),
};

type Pathway = { icon: keyof typeof PATH_ICONS; title: string; body: string; href: string; cta: string };

const PATHWAYS: Pathway[] = [
  { icon: 'dojo',      title: 'Dojo',        body: 'Focused lessons and practices for builders.',       href: '/projects/onboard', cta: 'Enter the Dojo'  },
  { icon: 'trails',    title: 'Trails',      body: 'Curated learning paths through real topics.',        href: '/trails',           cta: 'Explore Trails'  },
  { icon: 'artifacts', title: 'Artifacts',   body: 'Reusable code, tools, and reference materials.',     href: '/projects/gallery', cta: 'Browse Artifacts' },
  { icon: 'notes',     title: 'Field Notes', body: 'Notes from the climb — insights and logs.',          href: '/projects/notes',   cta: 'Read Notes'      },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-[#202431]">
        <HeroDotPattern />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(139,108,255,0.10) 0%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-[1180px] px-5 py-28 sm:py-36">
        {/* Large faint logo watermark — aligned to right edge of content container */}
        <div className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 opacity-[0.12] lg:block">
          <Image src="/nmb_transparent_logo_pack/ninja_mountain_logo_symbol_transparent.png" alt="" width={440} height={440} aria-hidden="true" />
        </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
            <span className="block text-[#E9ECF2]">You&apos;re not a dot.</span>
            <span className="block text-[#E9ECF2]">You&apos;re the one who</span>
            <span className="block">
              <span className="text-[#8B6CFF]">connects</span> the dots.
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-relaxed text-[#6F7684]">
            Ninja Mountain is a quiet dojo for builders and thinkers. We share trails, artifacts,
            and field notes to help you ship with intention.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/projects/onboard"
              className="inline-flex items-center rounded-full bg-[#8B6CFF] px-6 py-3 font-semibold text-[#0A0B0F] transition hover:-translate-y-px hover:bg-[#B7A7FF]"
            >
              Enter the Dojo
            </Link>
            <Link
              href="/trails"
              className="inline-flex items-center rounded-full border border-[#6F7684] px-6 py-3 font-semibold text-[#E9ECF2] transition hover:-translate-y-px hover:border-[#8B6CFF]"
            >
              Explore Trails
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pathways ── */}
      <section className="mx-auto max-w-[1180px] px-5 py-20">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pathways</h2>
        <p className="mt-2 text-[#6F7684]">Four ways we climb together.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PATHWAYS.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="group flex flex-col rounded-2xl border border-[#202431] bg-[#151821] p-6 transition hover:-translate-y-1 hover:border-[#8B6CFF]/40"
            >
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#8B6CFF]/10 ring-1 ring-inset ring-[#8B6CFF]/20">
                {PATH_ICONS[p.icon]}
              </span>
              <h3 className="mb-2 font-semibold text-[#E9ECF2]">{p.title}</h3>
              <p className="mb-5 flex-1 text-sm leading-relaxed text-[#6F7684]">{p.body}</p>
              <span className="text-sm font-medium text-[#8B6CFF] group-hover:underline">
                {p.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured project ── */}
      <section className="border-y border-[#202431] bg-[#151821] py-20">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8B6CFF]">
              Featured project
            </p>
            <h2 className="text-4xl font-bold tracking-tight">Support Triage Assistant</h2>
            <p className="mt-4 max-w-md leading-relaxed text-[#6F7684]">
              Paste a support ticket and Claude classifies it — category, severity, a one-line
              summary, a suggested first response, and whether it needs engineering escalation.
            </p>
            <Link
              href="/projects/triage"
              className="mt-8 inline-flex items-center rounded-full border border-[#6F7684] px-5 py-2.5 text-sm font-semibold text-[#E9ECF2] transition hover:-translate-y-px hover:border-[#8B6CFF]"
            >
              View Project →
            </Link>
          </div>
          <div className="rounded-2xl border border-[#202431] bg-[#0A0B0F] p-6">
            <DotConstellation className="h-56 w-full" />
          </div>
        </div>
      </section>

      {/* ── Quote band (also the About anchor) ── */}
      <section id="about" className="relative overflow-hidden py-24">
        {/* Mountain silhouette */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 h-40 w-2/3 opacity-[0.18]"
          viewBox="0 0 600 160"
          preserveAspectRatio="xMaxYMax slice"
        >
          <path d="M0 160 L160 60 L260 110 L380 20 L480 90 L600 30 L600 160 Z" fill="#202431" />
        </svg>
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <span className="font-heading text-6xl leading-none text-[#8B6CFF]/40">&ldquo;</span>
          <blockquote className="-mt-4 text-3xl font-bold leading-snug tracking-tight sm:text-4xl">
            Clarity comes from connection.
            <br />
            Action comes from intention.
          </blockquote>
          <p className="mt-6 text-sm text-[#6F7684]">— Ninja Mountain</p>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="border-t border-[#202431] bg-[#151821]">
        <div className="mx-auto flex max-w-[1180px] flex-col items-start gap-8 px-5 py-14 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#8B6CFF]/10 ring-1 ring-inset ring-[#8B6CFF]/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B6CFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Stay in the loop.</h2>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-[#6F7684]">
                Field notes, new trails, and dojo updates — delivered with intention.
              </p>
            </div>
          </div>
          <NewsletterSignup />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
