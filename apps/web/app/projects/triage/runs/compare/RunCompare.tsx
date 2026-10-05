// Interactive half of /projects/triage/runs/compare.
//
// page.tsx (a Server Component) reads every run file at build time, slims each
// one with toCompareRun(), and passes the result here as props. This Client
// Component holds the interactive state: which two runs are picked and which
// filter is active. Everything else (pairs, counts, visible rows) is derived
// from that state on each render.
//
// "use client" marks the server/client boundary. Props crossing it are
// serialized into the page and sent to the browser, which is why page.tsx
// sends CompareRun (categories and severities only), not full RunFiles.
"use client";

import { useState } from "react";
import Link from "next/link";
import Mark from "../Mark";
import type { RunSummary } from "@ninjamountain/triage";

import { kilo, pct, seconds } from "@/lib/format";
import { runLabel, type CompareRow, type CompareRun } from "@/lib/triage-compare";

// Functions stored as data: each metric carries how to read it (value), how to
// display it (format), and which direction wins. The summary table is a single
// .map over METRICS, and the winner highlight works the same for accuracy
// (higher is better) and latency (lower is better).
interface Metric {
  label:          string;
  value:          (s: RunSummary) => number;
  format:         (n: number) => string;
  higherIsBetter: boolean;
}

// Input tokens are deliberately missing: each provider has its own tokenizer,
// so the counts are not comparable (see the note under the table).
const METRICS: Metric[] = [
  { label: "Category accuracy", value: (s) => s.catAccuracy,  format: pct,                  higherIsBetter: true },
  { label: "Severity exact",    value: (s) => s.sevExact,     format: pct,                  higherIsBetter: true },
  { label: "Severity MAE",      value: (s) => s.sevMae,       format: (n) => n.toFixed(2),  higherIsBetter: false },
  { label: "Failed",            value: (s) => s.failed,       format: String,               higherIsBetter: false },
  { label: "Output tokens",     value: (s) => s.outputTokens, format: kilo,                 higherIsBetter: false },
  { label: "Median latency",    value: (s) => s.p50LatencyMs, format: seconds,              higherIsBetter: false },
];

// How a ticket's category came out across the two runs. "Both wrong" is split
// in two because the cases mean different things:
//   sameWrong: both models gave the same wrong answer, so suspect the gold
//              label first (the label-review queue).
//   diffWrong: each model was wrong its own way, so the ticket is probably
//              hard or ambiguous.
// FilterKey builds a union from another union: a filter is an Outcome or one
// of two special views.
type Outcome = "both" | "onlyA" | "onlyB" | "sameWrong" | "diffWrong";
type FilterKey = "all" | "disagree" | Outcome;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "disagree",  label: "Disagreements" },
  { key: "onlyA",     label: "Only A right" },
  { key: "onlyB",     label: "Only B right" },
  { key: "sameWrong", label: "Both wrong, same answer" },
  { key: "diffWrong", label: "Both wrong, different answers" },
  { key: "both",      label: "Both right" },
  { key: "all",       label: "All tickets" },
];

// One ticket with both runs' answers side by side. CompareRow["goldCat"] is an
// indexed access type: "whatever type CompareRow uses for goldCat".
interface PairedRow {
  id:       string;
  goldCat:  CompareRow["goldCat"];
  goldSev:  CompareRow["goldSev"];
  a:        CompareRow;
  b:        CompareRow;
  outcome:  Outcome;
  disagree: boolean;
}

// The same join as scripts/compare.ts: index run B by ticket id (like a SQL
// join on id), so the pairing works even if the runs cover different tickets.
function pairRows(a: CompareRun, b: CompareRun): PairedRow[] {
  const rowsB = new Map(b.rows.map((row) => [row.id, row]));

  // flatMap returning [] or [row] filters and transforms in one pass: tickets
  // missing from run B drop out, the rest become PairedRows.
  return a.rows.flatMap((ra) => {
    const rb = rowsB.get(ra.id);
    if (!rb) return [];

    // A failed row has cat === null, so it never equals the gold label and
    // counts as wrong.
    const aRight = ra.cat === ra.goldCat;
    const bRight = rb.cat === rb.goldCat;
    // Nested ternary read top to bottom like an if / else-if chain. The
    // `: Outcome` annotation makes TypeScript check every branch is allowed.
    const outcome: Outcome =
      aRight && bRight ? "both"
      : aRight ? "onlyA"
      : bRight ? "onlyB"
      : ra.cat !== null && ra.cat === rb.cat ? "sameWrong"
      : "diffWrong";

    return [{
      id:       ra.id,
      goldCat:  ra.goldCat,
      goldSev:  ra.goldSev,
      a:        ra,
      b:        rb,
      outcome,
      disagree: ra.cat !== rb.cat || ra.sev !== rb.sev,
    }];
  });
}

// The single definition of "this row belongs to this filter". Both the chip
// counts and the table use it, so a chip's number always equals the rows shown
// when it is clicked.
function matches(row: PairedRow, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "disagree") return row.disagree;
  return row.outcome === filter;
}

// One run's answer for one ticket. Mark (../Mark.tsx) shows a check or cross
// plus color plus screen-reader text, so color is never the only signal
// (WCAG 1.4.1, Use of Color).
function Prediction({ row }: { row: CompareRow }) {
  if (row.cat === null || row.sev === null) {
    return <span className="text-red-400">failed</span>;
  }
  return (
    <div className="space-y-0.5">
      <Mark ok={row.cat === row.goldCat} text={row.cat} />
      <Mark ok={row.sev === row.goldSev} text={row.sev} />
    </div>
  );
}

// A controlled <select>: React state owns the value, and onChange reports the
// new run id up to RunCompare. Small and used only here, so it stays in this
// file.
function RunPicker({
  label,
  runs,
  value,
  onChange,
}: {
  label:    string;
  runs:     CompareRun[];
  value:    string;
  onChange: (runId: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-[#6F7684]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 block w-full rounded-md border border-white/10 bg-[#12141A] px-3 py-2 text-sm"
      >
        {runs.map((run) => (
          <option key={run.runId} value={run.runId}>
            {runLabel(run)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function RunCompare({ runs }: { runs: CompareRun[] }) {
  // Minimal state: just ids and the filter key. runs arrive newest first, so
  // the defaults compare the two latest runs (older as A, newer as B).
  // page.tsx only renders this component when there are at least two runs.
  const [aId, setAId] = useState(runs[1].runId);
  const [bId, setBId] = useState(runs[0].runId);
  const [filter, setFilter] = useState<FilterKey>("disagree");

  // Derived state: the run objects are looked up from the ids on every render,
  // so they can never drift out of sync with the selection. .find returns
  // T | undefined, and the ?? fallback satisfies TypeScript.
  const a = runs.find((run) => run.runId === aId) ?? runs[1];
  const b = runs.find((run) => run.runId === bId) ?? runs[0];

  // Recomputed on every render. With ~22 tickets that is instant; useMemo would
  // only be worth adding if a profiler showed it was slow.
  const paired = pairRows(a, b);
  const visible = paired.filter((row) => matches(row, filter));

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <RunPicker label="Run A" runs={runs} value={aId} onChange={setAId} />
        <RunPicker label="Run B" runs={runs} value={bId} onChange={setBId} />
      </div>

      {a.runId === b.runId && (
        <p className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Both pickers point at the same run.
        </p>
      )}
      {a.promptHash !== b.promptHash && (
        <p className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          These runs used different prompts ({a.promptHash.slice(0, 7)} vs {b.promptHash.slice(0, 7)}),
          so differences mix prompt changes with model differences.
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-[#6F7684]">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Metric</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">A · {a.provider}</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">B · {b.provider}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {METRICS.map((m) => {
              const va = m.value(a.summary);
              const vb = m.value(b.summary);
              const aWins = m.higherIsBetter ? va > vb : va < vb;
              const bWins = m.higherIsBetter ? vb > va : vb < va;
              return (
                <tr key={m.label}>
                  <th scope="row" className="px-4 py-3 font-normal text-[#6F7684]">{m.label}</th>
                  <td className={`px-4 py-3 text-right tabular-nums ${aWins ? "font-bold text-[#8B6CFF]" : ""}`}>
                    {m.format(va)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${bWins ? "font-bold text-[#8B6CFF]" : ""}`}>
                    {m.format(vb)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[#6F7684]">
        Input tokens are left out on purpose: each provider uses its own tokenizer, so counts
        are not comparable. Output tokens include hidden reasoning tokens.
      </p>

      <h2 className="mt-12 text-xl font-bold">Tickets</h2>
      {/* Filter chips. role="group" + aria-label names the set; aria-pressed
          makes each chip a toggle button for screen readers; focus-visible
          gives keyboard users a focus ring. */}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter tickets">
        {FILTERS.map((f) => {
          const count = paired.filter((row) => matches(row, f.key)).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B6CFF] ${
                active
                  ? "border-[#8B6CFF] bg-[#8B6CFF]/20 text-[#E9ECF2]"
                  : "border-white/10 text-[#6F7684] hover:text-[#E9ECF2]"
              }`}
            >
              {f.label} <span className="tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-[#6F7684]">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Ticket</th>
              <th scope="col" className="px-4 py-3 font-semibold">Gold</th>
              <th scope="col" className="px-4 py-3 font-semibold">A · {a.provider}</th>
              <th scope="col" className="px-4 py-3 font-semibold">B · {b.provider}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[#6F7684]">
                  No tickets match this filter.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                // Keep each tag on its own line inside <tr>: whitespace between
                // tags on the same line becomes a text node, which HTML does
                // not allow in a table row (that caused a hydration warning).
                <tr key={row.id} className="align-top hover:bg-white/5">
                  <th scope="row" className="px-4 py-3 font-mono font-normal">
                    <Link
                      href={`/projects/triage/runs/tickets/${row.id}`}
                      className="text-[#8B6CFF] underline-offset-4 hover:underline"
                    >
                      {row.id}
                    </Link>
                  </th>                  
                  <td className="px-4 py-3">
                    <div>{row.goldCat}</div>
                    <div className="text-[#6F7684]">{row.goldSev}</div>
                  </td>
                  <td className="px-4 py-3"><Prediction row={row.a} /></td>
                  <td className="px-4 py-3"><Prediction row={row.b} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}