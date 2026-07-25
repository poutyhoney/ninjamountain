'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'What is the difference between what Airflow does and what dbt does in the same stack?',
    a: 'Airflow orchestrates and schedules the pipeline — when tasks run and in what order. dbt defines what a specific transformation actually does. They\'re typically used together, not as alternatives.',
  },
  {
    q: 'In the trace above, why did nobody notice the pipeline had been failing for three days?',
    a: 'No alert was configured on this DAG, so failures only showed up if someone happened to check the scheduler UI — nothing proactively surfaced the problem.',
  },
  {
    q: 'What actually broke the load_to_warehouse task?',
    a: 'An upstream schema change — a column ("region") was dropped from the source data, which the task wasn\'t written to tolerate.',
  },
  {
    q: 'What is a backfill, and when would you need one here?',
    a: 'Re-running a DAG for past dates to fill in or correct historical data — needed once the schema issue is fixed, to recover the three days of data that failed to load.',
  },
  {
    q: 'Why must a DAG be acyclic (no cycles)?',
    a: "A cycle would mean a task depends on another task that indirectly depends on it finishing first — an unresolvable ordering, so the scheduler couldn't determine what to run when.",
  },
] as const;

export default function PipelinesConceptCheck() {
  const [revealed, setRevealed] = useState<boolean[]>(() => QUESTIONS.map(() => false));

  const toggle = (i: number) => {
    setRevealed((prev) => prev.map((value, index) => (index === i ? !value : value)));
  };

  return (
    <div className="rounded-[18px] border border-[#202431] bg-[#151821] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.23)]">
      <h3 className="mb-1 text-lg font-semibold text-[#E9ECF2]">Concept check</h3>
      <p className="mb-4 text-sm text-[#6F7684]">
        Answer in your head first, then click a question to reveal the answer.
      </p>
      <div className="space-y-2">
        {QUESTIONS.map(({ q, a }, i) => (
          <div key={q} className="rounded-2xl border border-[#202431] bg-[#0A0B0F]">
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={revealed[i]}
              className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left text-sm text-[#C8CCD4]"
            >
              <span>{q}</span>
              <span className="shrink-0 text-[#8B6CFF]" aria-hidden="true">
                {revealed[i] ? '−' : '+'}
              </span>
            </button>
            {revealed[i] && (
              <p className="border-t border-[#202431] px-4 py-3 text-sm text-[#6F7684]">{a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
