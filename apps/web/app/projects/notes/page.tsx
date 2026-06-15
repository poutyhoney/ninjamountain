import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import TrainingNotes from '../../components/TrainingNotes';

// ─── Sample field note (first entry) ─────────────────────────────────────────

const NOTE = {
  title: 'Building Ninja Mountain',
  subtitle:
    'Starting from a blank repo and rebuilding web development craft — one small project at a time.',
  date: 'Day 1 — Jun 2025',
  readTime: '5 min read',
  tags: ['Foundations', 'Practice', 'Monorepo'],
  sections: [
    {
      heading: 'What is this place?',
      body: `Ninja Mountain is a personal training ground for rebuilding web development skills. I've started shaping it into a local-first development playground — a place where scattered ideas become working projects.

The structure is a monorepo: apps/web for a Next.js/TypeScript frontend, apps/api for a FastAPI backend, packages for shared types and UI, and a public folder for brand assets.`,
    },
    {
      heading: 'The first foothold',
      body: `The first goal was simple: get a homepage with project cards loading from an API. That meant wiring Next.js to FastAPI, understanding how the App Router handles server components, and getting the Tailwind v4 @theme system working correctly.

Small loops matter. Edit a file, refresh the browser, see the change, commit the checkpoint.`,
    },
    {
      heading: 'What connects to what',
      body: `Every project on this site is a dot. The Training Notes at the bottom of each page record what that dot connects to: which pattern it reinforces, which mental model it sharpens.

The goal isn't a portfolio. It's a visible, growing practice.`,
    },
  ],
  quote: {
    text: 'Small builds. Sharp skills. Every project reveals a path.',
    attribution: '— Ninja Mountain',
  },
  framework: [
    { icon: '◎', step: 'Build', body: 'Start with one small working thing.' },
    { icon: '⟶', step: 'Connect', body: 'Understand what it touches.' },
    { icon: '△', step: 'Climb', body: 'Strengthen the pattern over time.' },
    { icon: '⟳', step: 'Revisit', body: 'Notes compound. Review them.' },
  ],
  furtherReading: [
    { label: 'APIs for TSEs',             href: '/projects/onboard' },
    { label: 'Support Triage Assistant',  href: '/projects/triage'  },
    { label: 'Photo Dojo',                href: '/projects/gallery'  },
  ],
};

const QUICK_NOTES = [
  {
    title: 'Localhost is enough at the beginning',
    body: 'Plain localhost instead of custom local domains keeps setup simple while rebuilding muscle memory.',
  },
  {
    title: 'The root package.json controls the workspace',
    body: 'From the project root, npm run dev:web starts the Next.js app inside apps/web.',
  },
  {
    title: 'Small loops matter',
    body: 'Edit a file, refresh the browser, see the change, commit the checkpoint.',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotesPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />

      <main className="mx-auto max-w-[760px] px-5 py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#6F7684]">
          <Link href="/" className="hover:text-[#E9ECF2]">Home</Link>
          <span>›</span>
          <Link href="/projects/notes" className="hover:text-[#E9ECF2]">Field Notes</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">{NOTE.title}</span>
        </nav>

        {/* Hero */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#202431]">
          <div
            className="relative h-56 w-full"
            style={{
              background:
                'radial-gradient(ellipse 80% 80% at 50% 80%, rgba(139,108,255,0.25) 0%, transparent 70%), #151821',
            }}
          >
            {/* Mountain silhouette */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 760 224" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
              <path d="M0 224 L220 80 L380 150 L500 40 L640 120 L760 60 L760 224 Z" fill="#202431" opacity="0.6" />
              <path d="M380 150 L500 40" stroke="#8B6CFF" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" />
              <circle cx="500" cy="40" r="4" fill="#8B6CFF" />
              <circle cx="380" cy="150" r="3" fill="#B7A7FF" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {NOTE.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#8B6CFF]/10 px-3 py-1 text-xs font-medium text-[#8B6CFF] ring-1 ring-inset ring-[#8B6CFF]/30"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {NOTE.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[#6F7684]">{NOTE.subtitle}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#6F7684]">
          <span>Ninja Mountain</span>
          <span>·</span>
          <span>{NOTE.date}</span>
          <span>·</span>
          <span>{NOTE.readTime}</span>
        </div>

        <hr className="mt-10 border-[#202431]" />

        {/* Body sections */}
        <div className="mt-10 space-y-12">
          {NOTE.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="mb-4 text-2xl font-bold tracking-tight">{s.heading}</h2>
              {s.body.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4 leading-relaxed text-[#C8CCD4]">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* Pull quote */}
        <blockquote className="my-12 rounded-2xl border border-[#8B6CFF]/20 bg-[#8B6CFF]/5 p-7">
          <p className="text-xl font-semibold leading-snug text-[#E9ECF2]">
            &ldquo;{NOTE.quote.text}&rdquo;
          </p>
          <footer className="mt-3 text-sm text-[#6F7684]">{NOTE.quote.attribution}</footer>
        </blockquote>

        {/* Framework */}
        <section className="mt-6">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">A simple framework</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {NOTE.framework.map((step) => (
              <div
                key={step.step}
                className="flex flex-col items-center rounded-2xl border border-[#202431] bg-[#151821] p-5 text-center"
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#8B6CFF]/10 text-lg text-[#8B6CFF] ring-1 ring-inset ring-[#8B6CFF]/30">
                  {step.icon}
                </span>
                <h3 className="mb-1 font-semibold text-[#E9ECF2]">{step.step}</h3>
                <p className="text-xs leading-relaxed text-[#6F7684]">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Further reading */}
        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">Further reading</h2>
          <ul className="space-y-2">
            {NOTE.furtherReading.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="group inline-flex items-center gap-2 text-[#8B6CFF] hover:underline"
                >
                  <span>{item.label}</span>
                  <span className="text-sm transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Helpfulness vote */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#202431] bg-[#151821] p-5">
          <span className="text-sm text-[#6F7684]">Was this note helpful?</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full border border-[#202431] px-4 py-1.5 text-sm text-[#C8CCD4] transition-colors hover:border-[#8B6CFF]/50 hover:text-[#8B6CFF]"
            >
              Yes
            </button>
            <button
              type="button"
              className="rounded-full border border-[#202431] px-4 py-1.5 text-sm text-[#C8CCD4] transition-colors hover:border-[#6F7684] hover:text-[#E9ECF2]"
            >
              No
            </button>
            <span className="ml-2 text-sm text-[#6F7684]">Share</span>
          </div>
        </div>

        {/* Training notes for this page */}
        <TrainingNotes notes={QUICK_NOTES} />
      </main>

      <SiteFooter />
    </div>
  );
}
