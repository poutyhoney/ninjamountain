import SiteHeader from "../../components/SiteHeader";
import TriageForm from "./TriageForm";

export const metadata = {
  title: "Support Triage Assistant",
  description: "Classify and route support tickets with Claude.",
};

export default function TriagePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-300">
          Support tooling
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Support Triage Assistant
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Paste a support ticket and Claude will classify it — category, severity, a
          one-line summary, a suggested first response, and whether it needs engineering
          escalation.
        </p>

        <div className="mt-10">
          <TriageForm />
        </div>
      </main>
    </div>
  );
}
