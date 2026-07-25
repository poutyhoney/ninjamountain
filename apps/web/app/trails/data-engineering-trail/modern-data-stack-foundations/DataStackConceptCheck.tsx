'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'Why do modern data stacks typically load raw data first and transform it after (ELT), instead of transforming before loading (ETL)?',
    a: "Warehouse compute became cheap and scalable enough that it's more practical to do transforms inside the warehouse itself, rather than in a separate pipeline stage before loading.",
  },
  {
    q: "What does dbt actually do that a raw SQL script run manually doesn't?",
    a: 'Version-controls transformations like application code, with testing, documentation, and dependency tracking (lineage) between models — not just running a query once.',
  },
  {
    q: "You're new to a warehouse and see tables prefixed stg_, fct_, and dim_. What do those typically signal?",
    a: 'stg_ (staging) is lightly cleaned raw data; fct_ (fact) tables hold events or transactions; dim_ (dimension) tables hold descriptive attributes you join facts against — a common dbt/dimensional-modeling convention.',
  },
  {
    q: 'Why is a "how many customers churned last month" question usually answered against a BI/semantic layer rather than raw tables?',
    a: 'The semantic layer encodes the correct joins and business logic once, so every analyst gets the same answer instead of each person re-deriving — and potentially miscalculating — it independently.',
  },
  {
    q: "What's the practical difference between a data warehouse and a regular application database?",
    a: 'The warehouse is built for large analytical scans and aggregations across huge datasets; an application database is built for fast, small transactional reads/writes — using one for the other\'s job usually performs badly.',
  },
] as const;

export default function DataStackConceptCheck() {
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
