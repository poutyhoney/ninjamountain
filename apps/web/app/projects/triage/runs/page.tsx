import Link from "next/link";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import { loadRuns } from "@/lib/triage-runs";
import { kilo, pct, seconds, when } from "@/lib/format";
import Breadcrumbs from "@/app/components/Breadcrumbs";

export const metadata = {
  title: "Triage Runs",
  description:
    "Saved scoring runs of the support triage assistant, by provider and model.",
};

const HEADERS = [
  { label: "Started", numeric: false },
  { label: "Provider", numeric: false },
  { label: "Model", numeric: false },
  { label: "Split", numeric: false },
  { label: "Category", numeric: true },
  { label: "Severity", numeric: true },
  { label: "MAE", numeric: true },
  { label: "Failed", numeric: true },
  { label: "Tokens", numeric: true },
  { label: "Latency", numeric: true },
  { label: "Prompt", numeric: false },
];

export default function TriageRunsPage() {
  const runs = loadRuns();

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: "Support Triage", href: "/projects/triage" },
              { label: "Runs" },
            ]}
          />
        </div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          Support tooling
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Triage runs
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#6F7684]">
          Every scored run of the triage pipeline against the labeled dataset.
          Runs with the same prompt hash used the same system prompt, so their
          numbers compare fairly.
        </p>

        <Link
          href="/projects/triage/runs/compare"
          className="mt-6 inline-block text-sm font-semibold text-[#8B6CFF] underline-offset-4 hover:underline"
        >
          Compare two runs →
        </Link>

        {runs.length === 0 ? (
          <p className="mt-10 text-[#6F7684]">
            No runs yet. Run <code>npm run score</code> in packages/triage.
          </p>
        ) : (
          <div className="mt-10 overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-[#6F7684]">
                <tr>
                  {HEADERS.map((h) => (
                    <th
                      key={h.label}
                      scope="col"
                      className={`whitespace-nowrap px-4 py-3 font-semibold ${h.numeric ? "text-right" : ""}`}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {runs.map((run) => (
                  <tr key={run.runId} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-4 py-3 text-[#6F7684]">
                      {when(run.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold">{run.provider}</td>
                    <td className="whitespace-nowrap px-4 py-3">{run.model}</td>
                    <td className="px-4 py-3">{run.split}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {pct(run.summary.catAccuracy)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {pct(run.summary.sevExact)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {run.summary.sevMae.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {run.summary.failed}/{run.summary.scored}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {kilo(run.summary.inputTokens)} /{" "}
                      {kilo(run.summary.outputTokens)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {seconds(run.summary.p50LatencyMs)}
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
                        {run.promptHash.slice(0, 7)}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
