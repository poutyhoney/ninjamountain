import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import ScriptingConceptCheck from './ScriptingConceptCheck';
import ScriptingScenarioChecklist from './ScriptingScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Language = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const LANGUAGES: Language[] = [
  { name: 'Python',              body: 'The default choice for a quick script, data wrangling, or gluing two APIs together — a huge standard library, minimal ceremony to get started.' },
  { name: 'JavaScript / Node.js', body: "Runs everywhere a browser does, plus the server via Node — the one language you can't avoid as a web developer regardless of what else you know." },
  { name: 'TypeScript',           body: 'JavaScript plus a type system — catches a whole category of bugs (wrong shape, undefined access) at compile time instead of in production.' },
  { name: 'Bash',                 body: 'The glue between everything else — chaining commands, automating a repetitive terminal task, or writing the script that runs in CI.' },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://docs.python.org/3/tutorial/index.html',
    title: 'Python Docs: The Python Tutorial',
    desc: 'The official starting point for reading and writing Python',
  },
  {
    href: 'https://nodejs.org/learn/getting-started/introduction-to-nodejs',
    title: 'Node.js Docs: Introduction to Node.js',
    desc: 'What Node actually is, and how it differs from JavaScript in the browser',
  },
  {
    href: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    title: 'TypeScript Docs: The Handbook',
    desc: 'The type system layered on top of JavaScript',
  },
  {
    href: 'https://www.gnu.org/software/bash/manual/bash.html',
    title: 'GNU: Bash Reference Manual',
    desc: 'The definitive reference for the shell scripting glue behind CI and automation',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This module is the prerequisite, not the flagged gap',
    body: "Full-Stack Production Bar (the next lesson) was the named gap in the job-hunting scan. This lesson comes first because picking up an unfamiliar language under pressure assumes general scripting fluency already exists.",
  },
  {
    title: 'The comparison below is illustrative, not a recommendation to always prefer one',
    body: 'Neither Bash nor Python is "better" in general — the point of the exercise is recognizing which trade-offs matter for a given script\'s expected lifespan and audience.',
  },
];

const CODE_EXAMPLE = `# Bash: quick, one-off, fine for this scope
du -ah . | sort -rh | head -n 5

# Python: same task, but now it's testable, reusable, and handles edge cases
from pathlib import Path

sizes = sorted(
    ((p, p.stat().st_size) for p in Path('.').rglob('*') if p.is_file()),
    key=lambda x: x[1],
    reverse=True,
)
for path, size in sizes[:5]:
    print(f"{size:>12} {path}")`;

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
  title: 'Scripting Fluency — Modern Web Foundations — Ninja Mountain',
  description: 'A primer on Python, JavaScript/Node.js, TypeScript, and Bash, and when to reach for each, with exercises.',
};

export default function ScriptingLessonPage() {
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
          <Link href="/trails/modern-web-foundations" className="hover:text-[#E9ECF2]">Modern Web Foundations</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Scripting Fluency</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 1 of 2
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Scripting Fluency
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Writing a one-off migration script under time pressure starts with knowing which
          language actually fits the job, not defaulting to whichever one you know best.
        </p>

        {/* Definitions: the four languages */}
        <section className="py-14">
          <SectionHeader
            title="The four languages"
            intro="Four languages cover most of the scripting and tooling work a web developer actually does."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {LANGUAGES.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: picking the right tool */}
        <section className="py-14">
          <SectionHeader
            title="Picking the right tool for a one-off script"
            intro="A few heuristics cover most decisions."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              Reach for <strong className="text-[#E9ECF2]">Bash</strong> when the task is mostly
              chaining existing CLI tools together. Reach for{' '}
              <strong className="text-[#E9ECF2]">Python</strong> when you need real data
              structures, explicit error handling, or the script will be read and modified by
              someone else later. Reach for{' '}
              <strong className="text-[#E9ECF2]">Node/TypeScript</strong> when the script needs to
              share code or types with an existing JS/TS codebase.
            </p>
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Compare the two implementations below, then work through both exercises."
          />
          <pre
            aria-label="Example Bash versus Python implementation"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <ScriptingConceptCheck />
            <ScriptingScenarioChecklist />
          </div>
        </section>

        {/* Resources */}
        <section className="py-14">
          <SectionHeader
            title="Go deeper"
            intro="These primers are a starting point. Read the primary sources to build real fluency."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {RESOURCES.map(({ href, title, desc }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-[#202431] bg-[#151821] px-5 py-4 transition-colors hover:border-[#8B6CFF]/30"
              >
                <strong className="text-[#E9ECF2]">{title}</strong>
                <small className="mt-1 block text-[#6F7684]">{desc}</small>
              </a>
            ))}
          </div>
        </section>

        {/* Training Notes */}
        <section className="py-14">
          <TrainingNotes notes={TRAINING_NOTES} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
