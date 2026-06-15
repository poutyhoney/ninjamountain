import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export const metadata = {
  title: 'About — Ninja Mountain',
  description:
    'Tom De Carlo — front-end developer, API support lead, and technical communicator based in San Francisco.',
};

const SKILLS = [
  { label: 'Front-end development', detail: '20 years' },
  { label: 'Enterprise technical support', detail: '10 years' },
  { label: 'Python tooling & automation', detail: 'Production' },
  { label: 'OAuth / API debugging', detail: 'Deep end' },
  { label: 'Technical communication', detail: 'Clarity first' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 py-20">

        {/* ── Eyebrow ── */}
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8B6CFF]">About</p>

        {/* ── Two-column layout ── */}
        <div className="grid items-start gap-8 sm:grid-cols-[190px_1fr]">

          {/* Photo */}
          <div className="relative mx-auto w-[190px] sm:mx-0">
            {/* Subtle violet glow behind the image */}
            <div
              className="pointer-events-none absolute -inset-4 rounded-3xl opacity-30"
              style={{
                background:
                  'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(139,108,255,0.35) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-2xl border border-[#202431]">
              <Image
                src="/tom-ninja.jpg"
                alt="Tom — a vintage orange ninja action figure, poised and ready"
                width={190}
                height={210}
                className="w-full object-cover"
                priority
              />
            </div>
            {/* Caption */}
            <p className="mt-3 text-center text-xs text-[#6F7684]">
              Semi-accurate self-portrait.
            </p>
          </div>

          {/* Bio */}
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Some people collect skills.<br />
              <span className="text-[#8B6CFF]">Tom connects them.</span>
            </h1>

            <div className="mt-8 space-y-5 text-lg leading-relaxed text-[#C8CCD4]">
              <p>
                Two decades of front-end development gave him the foundation. Ten years in
                enterprise technical support — most recently as{' '}
                <strong className="font-semibold text-[#E9ECF2]">
                  Principal Technical Support Lead at Twilio
                </strong>{' '}
                — taught him how systems actually behave under pressure.
              </p>
              <p>
                He&apos;s debugged OAuth flows, written Python tooling at 2am, caught architectural
                disasters before they hit production, and explained all of it clearly to people who
                needed to understand, not just be told.
              </p>
              <p>
                He works best at the edge between code and human.
              </p>
              <p className="text-[#6F7684]">
                He&apos;s based in San Francisco, and the climb continues.
              </p>
            </div>

            {/* Skills grid */}
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {SKILLS.map(({ label, detail }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-[#202431] bg-[#151821] px-4 py-3"
                >
                  <span className="text-sm text-[#C8CCD4]">{label}</span>
                  <span className="ml-4 shrink-0 text-xs font-semibold text-[#8B6CFF]">
                    {detail}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/projects/onboard"
                className="inline-flex items-center rounded-full bg-[#8B6CFF] px-6 py-3 font-semibold text-[#0A0B0F] transition hover:-translate-y-px hover:bg-[#B7A7FF]"
              >
                Enter the Dojo
              </Link>
              <Link
                href="/projects/notes"
                className="inline-flex items-center rounded-full border border-[#6F7684] px-6 py-3 font-semibold text-[#E9ECF2] transition hover:-translate-y-px hover:border-[#8B6CFF]"
              >
                Read the Field Notes
              </Link>
            </div>
          </div>
        </div>

        {/* ── Back link ── */}
        <div className="mt-16 border-t border-[#202431] pt-8 text-center">
          <Link
            href="/"
            className="text-sm text-[#8B6CFF] hover:underline"
          >
            ← Back to Ninja Mountain
          </Link>
        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
