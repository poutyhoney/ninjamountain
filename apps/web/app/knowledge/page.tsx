import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const SECTIONS = [
  {
    title: 'Glossary',
    body: 'Short, plain-language definitions for terms that show up across the trails and projects — one page, alphabetized, quick to scan.',
    href: '/knowledge/glossary',
    cta: 'Browse the glossary',
  },
  {
    title: 'Concepts',
    body: "Deeper dives into things I've been learning — one page per concept, added as I go rather than all at once.",
    href: '/knowledge/concepts',
    cta: 'Explore concepts',
  },
];

export const metadata = {
  title: 'Knowledge — Ninja Mountain',
  description: 'A glossary of terms and a growing set of concept notes from ongoing training.',
};

export default function KnowledgePage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-[#202431]">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 hidden h-48 w-1/2 opacity-[0.15] md:block"
          viewBox="0 0 600 200"
          fill="none"
          preserveAspectRatio="xMaxYMax slice"
        >
          <path d="M0 200 L180 70 L300 130 L420 30 L520 100 L600 50" stroke="#8B6CFF" strokeWidth="1.5" />
        </svg>
        <div className="relative mx-auto max-w-[1180px] px-5 py-20">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8B6CFF]">Knowledge</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Terms and concepts, as they stick.</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#6F7684]">
            A reference for vocabulary and ideas picked up along the trails — not a curriculum, just
            notes that get added to as the learning happens.
          </p>
        </div>
      </section>

      {/* ── Sections ── */}
      <main className="mx-auto max-w-[1180px] px-5 py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map(({ title, body, href, cta }) => (
            <Link
              key={title}
              href={href}
              className="group block rounded-[18px] border border-[#202431] bg-[#151821] p-8 shadow-[0_18px_55px_rgba(0,0,0,0.23)] transition hover:border-[#8B6CFF]/40"
            >
              <h2 className="mb-3 text-2xl font-bold tracking-tight">{title}</h2>
              <p className="text-[#6F7684]">{body}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#8B6CFF]">
                {cta}{' '}
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
