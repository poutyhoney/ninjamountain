import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import AiDevConceptCheck from './AiDevConceptCheck';
import AiDevScenarioChecklist from './AiDevScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Tool = { name: string; body: string };
type Shift = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const TOOLS: Tool[] = [
  { name: 'GitHub Copilot', body: 'Inline, autocomplete-style suggestions inside your existing editor — the lowest-friction entry point, least autonomous.' },
  { name: 'Cursor',         body: 'An AI-native editor built around multi-file edits and chat-driven changes inside a familiar IDE.' },
  { name: 'Claude Code / Codex (CLI agents)', body: 'Terminal-based agents that can read a whole repo, run commands, and make multi-file changes autonomously, with the developer reviewing rather than typing every keystroke.' },
  { name: 'ChatGPT (general assistant)', body: 'Used outside the editor entirely — for explaining an unfamiliar error, drafting a script, or reasoning about an approach before writing any code.' },
];

const SHIFTS: Shift[] = [
  { name: 'Review discipline', body: 'The bottleneck shifts from writing code to reviewing it — read every diff as critically as a teammate\'s PR, not a rubber stamp because "the AI wrote it."' },
  { name: 'Prompting as a skill', body: 'Vague prompts get vague code. Specifying constraints, file paths, and the pattern to follow up front saves more time than iterating on a bad first attempt.' },
  { name: 'Trust boundaries', body: "Treat AI-generated code touching auth, payments, or data deletion with more scrutiny than a boilerplate change — the tool doesn't know which lines are load-bearing." },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://docs.github.com/en/copilot/get-started/quickstart',
    title: 'GitHub Docs: Quickstart for GitHub Copilot',
    desc: 'The lowest-friction entry point into AI-assisted coding, from the source',
  },
  {
    href: 'https://cursor.com/docs/get-started/quickstart',
    title: 'Cursor Docs: Quickstart',
    desc: 'How multi-file, chat-driven editing actually works in practice',
  },
  {
    href: 'https://docs.claude.com/en/docs/claude-code/overview',
    title: 'Claude Docs: Claude Code overview',
    desc: 'A terminal-based agent that reads a repo, edits files, and runs commands',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This module isn\'t a flagged gap, but it changes how the others get done',
    body: 'Full-Stack Production Bar and every other module in this curriculum will likely get built with one of these tools — this lesson is about using them well, not just fast.',
  },
  {
    title: 'The vague/specific example is a real pattern, not an extreme case',
    body: 'Most low-quality AI-generated code traces back to an underspecified prompt, not a model limitation — the fix is almost always adding the missing constraint, not switching tools.',
  },
];

const CODE_EXAMPLE = `Vague: "fix the bug in the login form"

Specific: "In LoginForm.tsx, the submit handler doesn't disable
the button while the request is in flight, so a slow network
lets a user double-submit. Add a \`pending\` state and disable
the button while \`pending\` is true — follow the pattern already
used in SignupForm.tsx."`;

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
  title: 'AI-Assisted Development Tooling — Applied AI/ML — Ninja Mountain',
  description: 'A primer on Copilot, Cursor, CLI coding agents, and how code review changes once they write a share of your code, with exercises.',
};

export default function AiDevToolingLessonPage() {
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
          <Link href="/trails/applied-ai-ml" className="hover:text-[#E9ECF2]">Applied AI/ML</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">AI-Assisted Development Tooling</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 3 of 4
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          AI-Assisted Development Tooling
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          Onboarding onto a codebase with an AI pair-programmer for the first time changes what
          &quot;reading code&quot; and &quot;writing code&quot; actually mean day to day.
        </p>

        {/* Definitions: the tools */}
        <section className="py-14">
          <SectionHeader
            title="The tools, by autonomy level"
            intro="Four tools cover most of the space, from least to most autonomous."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {TOOLS.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: workflow shifts */}
        <section className="py-14">
          <SectionHeader
            title="What actually changes about your workflow"
            intro="Three shifts matter more than which specific tool you pick."
          />
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {SHIFTS.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Compare the two prompts below, then work through both exercises."
          />
          <pre
            aria-label="Example vague versus specific prompt"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <AiDevConceptCheck />
            <AiDevScenarioChecklist />
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
