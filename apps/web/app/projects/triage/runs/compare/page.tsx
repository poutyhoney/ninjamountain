import SiteHeader from "../../../../components/SiteHeader";
import SiteFooter from "../../../../components/SiteFooter";
import { loadRuns } from "@/lib/triage-runs";
import { toCompareRun } from "@/lib/triage-compare";
import RunCompare from "./RunCompare";
import Breadcrumbs from "@/app/components/Breadcrumbs";

export const metadata = {
  title: "Compare Triage Runs",
  description: "Side-by-side comparison of two triage scoring runs.",
};

export default function TriageComparePage() {
  const runs = loadRuns().map(toCompareRun);

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: "Support Triage", href: "/projects/triage" },
              { label: "Runs", href: "/projects/triage/runs" },
              { label: "Compare" },
            ]}
          />
        </div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Support tooling
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Compare runs
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#6F7684]">
          Pick two runs to see where the models agree, where they differ, and
          which one matched the gold label.
        </p>

        <div className="mt-10">
          {runs.length < 2 ? (
            <p className="text-[#6F7684]">
              At least two runs are needed to compare.
            </p>
          ) : (
            <RunCompare runs={runs} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
