import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { RunFile, RunRow } from "@ninjamountain/triage";

import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import Mark from "../../Mark";
import { seconds, when } from "@/lib/format";
import { loadRuns, loadTicket, runTicketIds } from "@/lib/triage-runs";

export const dynamicParams = false;

export function generateStaticParams() {
  return runTicketIds().map((ticketId) => ({ ticketId }));
}

export const metadata = {
  title: "Triage Ticket",
  description: "Every saved run's output for one labeled support ticket.",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#6F7684]">{label}</h3>
      <p className="mt-1 leading-relaxed">{children}</p>
    </div>
  );
}

function ResultCard({ run, row }: { run: RunFile; row: RunRow }) {
  return (
    <article className="rounded-lg border border-white/10 p-5">
      <p className="font-semibold">
        {run.provider} · {run.model}
      </p>
      <p className="text-xs text-[#6F7684]">
        {when(run.createdAt)} · prompt {run.promptHash.slice(0, 7)}
      </p>

      {row.ok ? (
        <div className="mt-4 space-y-4 text-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <Mark ok={row.result.category === row.goldCat} text={row.result.category} />
            <Mark ok={row.result.severity === row.goldSev} text={row.result.severity} />
            <span className="text-[#6F7684]">
              escalate: {row.result.needs_engineering_escalation ? "yes" : "no"}
            </span>
          </div>
          <Field label="Summary">{row.result.summary}</Field>
          <Field label="Suggested first response">{row.result.suggested_first_response}</Field>
          <Field label="KB citations">
            {row.result.kb_citations.length ? row.result.kb_citations.join(", ") : "none"}
          </Field>
          <p className="text-xs text-[#6F7684]">
            {row.usage.outputTokens} output tokens · {seconds(row.latencyMs)} · {row.attempts} attempt(s)
          </p>
        </div>
      ) : (
        <div className="mt-4 text-sm text-red-400">
          <p>Failed: {row.reason}</p>
          <ul className="mt-2 list-disc pl-5">
            {row.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export default async function TriageTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const ticket = loadTicket(ticketId);
  if (!ticket) notFound();

  const results = loadRuns().flatMap((run) => {
    const row = run.rows.find((r) => r.id === ticketId);
    return row ? [{ run, row }] : [];
  });

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E9ECF2]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <Link
          href="/projects/triage/runs/compare"
          className="text-sm text-[#8B6CFF] underline-offset-4 hover:underline"
        >
          ← Compare runs
        </Link>
        <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[.2em] text-[#8B6CFF]">
          {ticket.id}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{ticket.subject}</h1>

        <section className="mt-8 rounded-lg border border-white/10 bg-white/5 p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#6F7684]">Ticket</h2>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed">{ticket.body}</p>
          {ticket.gold && (
            <div className="mt-6 border-t border-white/10 pt-4 text-sm">
              <p>
                <span className="text-[#6F7684]">Gold label:</span>{" "}
                <span className="font-semibold">
                  {ticket.gold.category} / {ticket.gold.severity}
                </span>
              </p>
              {ticket.gold.notes && (
                <p className="mt-2 leading-relaxed text-[#6F7684]">{ticket.gold.notes}</p>
              )}
            </div>
          )}
        </section>

        <h2 className="mt-12 text-xl font-bold">Results by run</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {results.map(({ run, row }) => (
            <ResultCard key={run.runId} run={run} row={row} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}