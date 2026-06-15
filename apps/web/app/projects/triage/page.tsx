import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import TrainingNotes from "../../components/TrainingNotes";
import TriageForm from "./TriageForm";

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
];

export const metadata = {
  title: "Support Triage Assistant",
  description: "Classify and route support tickets with Claude.",
};

export default function TriagePage() {
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

        <TrainingNotes notes={TRAINING_NOTES} />
      </main>
      <SiteFooter />
    </div>
  );
}
