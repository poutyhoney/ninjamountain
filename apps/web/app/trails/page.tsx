import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import TrailsList from './TrailsList';

export const metadata = {
  title: 'Trails — Ninja Mountain',
  description: 'Curated learning paths to level up your skills and ship meaningful work.',
};

export default function TrailsPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-[#202431]">
        {/* Mountain line illustration */}
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
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8B6CFF]">Trails</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Choose your path.</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#6F7684]">
            Curated learning paths to level up your skills and ship meaningful work.
          </p>
        </div>
      </section>

      {/* ── List ── */}
      <main className="mx-auto max-w-[1180px] px-5 py-14">
        <TrailsList />
      </main>

      <SiteFooter />
    </div>
  );
}
