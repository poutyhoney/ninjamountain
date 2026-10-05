import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import TrainingNotes from "../../components/TrainingNotes";
import TriageForm from "./TriageForm";
import Link from "next/link";
import { latestRunPerProvider } from "@/lib/triage-runs";
import { pct } from "@/lib/format";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const TRAINING_NOTES = [
  {
    title: "Pin temperature before you measure",
    body: "The first scores looked good at the default temperature. Pinning temperature to 0 made them drop, which showed the earlier numbers were partly luck. A lower score you can reproduce beats a higher one you cannot, because only a stable score can tell you whether a prompt change helped.",
  },
  {
    title: "A failing score can mean the label is wrong",
    body: "Twice in the first version, the model was right and the hand-written gold label was wrong. Later, when Claude and GPT gave the same wrong answer on the same ticket, the label became the first suspect. An eval checks your data as much as your model.",
  },
  {
    title: "Ground the answer where the model is confidently wrong",
    body: "Retrieval was tested on the same tickets with and without the knowledge base. It helped on 3 of 5, and its real wins were fixing 2 confident factual errors: a wrong claim about SSO and error codes from the wrong product. It never made an answer worse, and when no article fit, the model cited none.",
  },
  {
    title: "Prove an agent's exit paths, not just its happy path",
    body: "An agent decides which tools to call, so some code paths only run when the model chooses them. Forcing the iteration cap to 1 confirmed the loop fails cleanly with its tool log intact. The tool log is the main debugging artifact: it shows whether a wrong answer came from a skipped tool or a bad conclusion.",
  },
  {
    title: "A prompt tuned on one model favors it",
    body: "With the same prompt, Claude scored 68% on category and GPT scored 45%. But the rubric was refined against Claude's mistakes, so part of that gap is the prompt, not the model. A fair comparison names what it was tuned on.",
  },
  {
    title: "Swap the model, keep the pipeline",
    body: "The triage package talks to a small TriageProvider interface instead of a specific SDK. Anthropic and OpenAI each get an adapter with their own retry rules, and both receive a byte-identical prompt, so the comparison measures the model and not the plumbing.",
  },
  {
    title: "Prerender the evidence",
    body: "The runs dashboard reads saved JSON run files during next build and ships static HTML. Nothing reads the file system at request time, which avoids monorepo file-tracing problems on Vercel and makes the pages instant.",
  },
  {
    title: "Split Server and Client Components at the data boundary",
    body: "The page wrapper (page.tsx) stays a Server Component for metadata and layout. The form itself becomes a Client Component (TriageForm.tsx) because it needs useState and event handlers. Only the leaf that needs interactivity opts in to 'use client'.",
  },
  {
    title: "API routes keep credentials server-side",
    body: "The browser never calls Claude. It posts the ticket to the Next.js route at /api/triage, which runs the shared triage package in a Node.js serverless function. The API keys live in Vercel's environment settings for that project and never reach the client. Those settings are read when a deployment is created, so a new or changed key needs a redeploy.",
  },
  {
    title: "Streaming vs. single-shot responses are a product decision",
    body: "For triage classification, a complete JSON object is easier to parse than a stream. Streaming makes more sense for long-form responses where showing partial output improves perceived speed.",
  },
];

export const metadata = {
  title: "Support Triage Assistant",
  description: "Classify and route support tickets with Claude.",
};

export default function TriagePage() {
  const latestRuns = latestRunPerProvider();
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: "Support Triage" },
            ]}
          />
        </div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Support tooling
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Support Triage Assistant
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#6F7684]">
          Paste a support ticket and Claude will classify it — category,
          severity, a one-line summary, a suggested first response, and whether
          it needs engineering escalation.
        </p>

        <div className="mt-10">
          <TriageForm />
        </div>
        {latestRuns.length > 0 && (
          <section className="mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold tracking-tight">
              How do I know it works?
            </h2>
            <p className="mt-3 leading-relaxed text-[#6F7684]">
              Every prompt change is scored against{" "}
              {latestRuns[0].summary.scored} hand-labeled tickets. The same
              prompt runs on two providers, so the results compare models
              directly. Latest category accuracy:
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {latestRuns.map((run) => (
                <div
                  key={run.runId}
                  className="rounded-md border border-white/10 p-4"
                >
                  <dt className="text-sm text-[#6F7684]">
                    {run.provider} · {run.model}
                  </dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums">
                    {pct(run.summary.catAccuracy)}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              <Link
                href="/projects/triage/runs/compare"
                className="text-[#8B6CFF] underline-offset-4 hover:underline"
              >
                Compare the models ticket by ticket →
              </Link>
              <Link
                href="/projects/triage/runs"
                className="text-[#8B6CFF] underline-offset-4 hover:underline"
              >
                All scored runs →
              </Link>
            </div>
          </section>
        )}
        <TrainingNotes notes={TRAINING_NOTES} />
      </main>
      <SiteFooter />
    </div>
  );
}
