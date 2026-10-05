import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import TrainingNotes from "../../components/TrainingNotes";
import TriageForm from "./TriageForm";
import Link from "next/link";
import { loadRuns } from "@/lib/triage-runs";
import { pct } from "@/lib/format";

const TRAINING_NOTES = [
  {
    title: "Split Server and Client Components at the data boundary",
    body: "The page wrapper (page.tsx) stays a Server Component for metadata and layout. The form itself becomes a Client Component (TriageForm.tsx) because it needs useState and event handlers. Only the leaf that needs interactivity opts in to 'use client'.",
  },
  {
    title: "API routes keep credentials server-side",
    body: "The Next.js route at /api/triage proxies the request to FastAPI rather than calling the Claude API directly from the browser. This means the ANTHROPIC_API_KEY never reaches the client.",
  },
  {
    title: "Streaming vs. single-shot responses are a product decision",
    body: "For triage classification, a complete JSON object is easier to parse than a stream. Streaming makes more sense for long-form responses where showing partial output improves perceived speed.",
  },
  {
    title: "Swap the model, keep the pipeline",
    body: "The triage package talks to a small TriageProvider interface instead of a specific SDK. Anthropic and OpenAI each get an adapter with their own retry rules, and both receive a byte-identical prompt, so the comparison measures the model and not the plumbing.",
  },
  {
    title: "Prerender the evidence",
    body: "The runs dashboard reads saved JSON run files during next build and ships static HTML. Nothing reads the file system at request time, which avoids monorepo file-tracing problems on Vercel and makes the pages instant.",
  },
];

export const metadata = {
  title: "Support Triage Assistant",
  description: "Classify and route support tickets with Claude.",
};

export default function TriagePage() {
  const latestRuns = loadRuns().filter(
    (run, i, all) => all.findIndex((r) => r.provider === run.provider) === i
  );
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Support tooling
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Support Triage Assistant
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#6F7684]">
          Paste a support ticket and Claude will classify it — category, severity, a
          one-line summary, a suggested first response, and whether it needs engineering
          escalation.
        </p>

        <div className="mt-10">
          <TriageForm />
        </div>
        {latestRuns.length > 0 && (
          <section className="mt-16 rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold tracking-tight">How do I know it works?</h2>
            <p className="mt-3 leading-relaxed text-[#6F7684]">
              Every prompt change is scored against {latestRuns[0].summary.scored} hand-labeled
              tickets. The same prompt runs on two providers, so the results compare models
              directly. Latest category accuracy:
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {latestRuns.map((run) => (
                <div key={run.runId} className="rounded-md border border-white/10 p-4">
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
