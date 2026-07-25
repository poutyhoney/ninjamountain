import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import TrainingNotes from '../../../components/TrainingNotes';
import LiveDemoConceptCheck from './LiveDemoConceptCheck';
import LiveDemoScenarioChecklist from './LiveDemoScenarioChecklist';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Tactic = { name: string; body: string };
type Resource = { href: string; title: string; desc: string };

const WHEN_IT_BREAKS: Tactic[] = [
  { name: 'Have a recorded fallback',  body: "Record a backup video of the golden path before you present live — never let the first time something runs live be in front of the customer." },
  { name: 'Narrate while you debug',   body: "If something breaks, describe what you're checking out loud instead of going silent. Silence reads as \"lost\"; narration reads as \"still in control.\"" },
  { name: 'Know your escape hatch',    body: "Have a pre-built example or staging account ready to jump to if the primary path is broken." },
];

const RESOURCES: Resource[] = [
  {
    href: 'https://medium.com/@emilymcmc/how-to-give-a-good-basic-tech-demo-c676fa88f154',
    title: 'Emily McManus: How to give a good basic tech demo',
    desc: 'A short, concrete guide from a TED editor who has coached hundreds of technical talks',
  },
  {
    href: 'https://storage.ted.com/tedx/manuals/tedxspeakerguide.pdf',
    title: 'TEDx Speaker Guide (official)',
    desc: 'Structure, scripting, and delivery guidance — built for technical and non-technical speakers alike',
  },
  {
    href: 'https://www.storylane.io/blog/how-to-give-great-product-demo',
    title: 'Storylane: An ultimate guide to giving a great product demo',
    desc: 'A broader walkthrough of demo structure, pacing, and audience framing',
  },
];

const TRAINING_NOTES = [
  {
    title: 'This is a flagged gap-priority module',
    body: "Live demo delivery was one of the self-identified gaps from Tom's job-hunting skills scan — it's a soft skill, but a specifically technical one: the thing that breaks live is usually the thing you understand best, which is exactly what makes narrating through it credible.",
  },
  {
    title: 'This lesson has no code to run',
    body: "Unlike the other TSE Onboarding lessons, there's no request/response or CLI output to reproduce here. The \"exercises\" below are about drafting language, not verifying a technical result.",
  },
];

const CODE_EXAMPLE = `[Open] "Today I'll show how a webhook retry actually recovers from
a dropped delivery — this is the exact flow your team hit last week."

[Show] Trigger a test event, point at the dashboard, and call out the
retry count and backoff interval as they update live.

[If it breaks] "Interesting — let's look at why," then open the logs
panel on screen instead of going quiet. Narrate what you're checking.

[Unscripted question] "Good question — I don't have the exact number
on retry limits for the Enterprise tier. Let me confirm and send that
to you by end of day."

[Close] Restate the one thing you want them to remember, in one sentence.`;

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
  title: 'Live Demo & Technical Storytelling — TSE Onboarding — Ninja Mountain',
  description: 'A primer on structuring a walkthrough, recovering from a live failure, and handling unscripted questions, with exercises.',
};

export default function LiveDemoLessonPage() {
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
          <Link href="/trails/tse-onboarding" className="hover:text-[#E9ECF2]">TSE Onboarding</Link>
          <span>›</span>
          <span className="text-[#C8CCD4]">Live Demo &amp; Technical Storytelling</span>
        </nav>

        {/* Hero */}
        <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Lesson 8 of 9 · ⭐ Gap priority
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Live Demo &amp; Technical Storytelling
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[#6F7684]">
          A prospect escalates live on a screen-share, or the golden path breaks two minutes in.
          What you say next matters more than what you&apos;d planned to say.
        </p>

        {/* Definitions: structuring a walkthrough */}
        <section className="py-14">
          <SectionHeader
            title="Structuring a walkthrough"
            intro="Three beats cover almost every good technical demo, in this order."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              <strong className="text-[#E9ECF2]">What</strong>: state the problem this solves in
              one sentence. <strong className="text-[#E9ECF2]">Why</strong>: say why it matters to
              this specific audience, not audiences in general.{' '}
              <strong className="text-[#E9ECF2]">Show</strong>: take the shortest path to proving
              it works, cutting anything that doesn&apos;t serve those first two beats.
            </p>
          </div>
        </section>

        {/* Definitions: when it breaks */}
        <section className="py-14">
          <SectionHeader
            title="When the demo breaks live"
            intro="Something will eventually fail mid-walkthrough. These three habits are what separate a recoverable moment from a lost room."
          />
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {WHEN_IT_BREAKS.map(({ name, body }) => (
              <article key={name} className={card}>
                <h3 className="mb-2 font-semibold text-[#8B6CFF]">{name}</h3>
                <p className="text-sm text-[#6F7684]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Definitions: unscripted Q&A */}
        <section className="py-14">
          <SectionHeader
            title="Handling unscripted Q&A"
            intro="You will get a question you don't have the answer to. The response matters more than the answer."
          />
          <div className={card}>
            <p className="text-sm leading-relaxed text-[#6F7684]">
              Acknowledge the question directly, answer the part you actually know, and commit to
              a specific follow-up for the rest — a named time, not &quot;I&apos;ll look into it.&quot; A confident
              guess that turns out wrong costs more credibility than an honest &quot;let me confirm and
              get back to you by end of day.&quot;
            </p>
          </div>
        </section>

        {/* Exercises */}
        <section className="py-14">
          <SectionHeader
            title="Exercises"
            intro="Read the annotated demo script below, then work through both exercises."
          />
          <pre
            aria-label="Example annotated demo script"
            className="mb-6 overflow-auto rounded-[18px] border border-[#202431] bg-[#0A0B0F] p-5 font-mono text-sm text-[#C8CCD4]"
          >
            <code>{CODE_EXAMPLE}</code>
          </pre>
          <div className="grid gap-4 lg:grid-cols-2">
            <LiveDemoConceptCheck />
            <LiveDemoScenarioChecklist />
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
