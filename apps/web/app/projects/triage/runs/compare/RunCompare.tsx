"use client";

import { useState } from "react";
import Link from "next/link";
import Mark from "../Mark";
import type { RunSummary } from "@ninjamountain/triage";

import { kilo, pct, seconds } from "@/lib/format";
import { runLabel, type CompareRow, type CompareRun } from "@/lib/triage-compare";

interface Metric {
  label:          string;
  value:          (s: RunSummary) => number;
  format:         (n: number) => string;
  higherIsBetter: boolean;
}

const METRICS: Metric[] = [
  { label: "Category accuracy", value: (s) => s.catAccuracy,  format: pct,                  higherIsBetter: true },
  { label: "Severity exact",    value: (s) => s.sevExact,     format: pct,                  higherIsBetter: true },
  { label: "Severity MAE",      value: (s) => s.sevMae,       format: (n) => n.toFixed(2),  higherIsBetter: false },
  { label: "Failed",            value: (s) => s.failed,       format: String,               higherIsBetter: false },
  { label: "Output tokens",     value: (s) => s.outputTokens, format: kilo,                 higherIsBetter: false },
  { label: "Median latency",    value: (s) => s.p50LatencyMs, format: seconds,              higherIsBetter: false },
];

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

interface PairedRow {
  id:       string;
  goldCat:  CompareRow["goldCat"];
  goldSev:  CompareRow["goldSev"];
  a:        CompareRow;
  b:        CompareRow;
  outcome:  Outcome;
  disagree: boolean;
}

function pairRows(a: CompareRun, b: CompareRun): PairedRow[] {
  const rowsB = new Map(b.rows.map((row) => [row.id, row]));

  return a.rows.flatMap((ra) => {
    const rb = rowsB.get(ra.id);
    if (!rb) return [];

    const aRight = ra.cat === ra.goldCat;
    const bRight = rb.cat === rb.goldCat;
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

function matches(row: PairedRow, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "disagree") return row.disagree;
  return row.outcome === filter;
}

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
  const [aId, setAId] = useState(runs[1].runId);
  const [bId, setBId] = useState(runs[0].runId);
  const [filter, setFilter] = useState<FilterKey>("disagree");

  const a = runs.find((run) => run.runId === aId) ?? runs[1];
  const b = runs.find((run) => run.runId === bId) ?? runs[0];

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