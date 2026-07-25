'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'What does an index actually do, mechanically?',
    a: 'It builds a separate, sorted lookup structure on a column so the database can find matching rows directly instead of scanning every row in the table.',
  },
  {
    q: 'In the example above, why did adding an index fix the "the app is broken" complaint?',
    a: 'The original query had to scan all 12 million rows to find matches on customer_email; the index let the database jump straight to the matching rows instead.',
  },
  {
    q: "What's the difference between a primary key and a foreign key?",
    a: 'A primary key uniquely identifies a row in its own table; a foreign key is a column that references a primary key in another table, establishing the relationship between them.',
  },
  {
    q: 'Why do transactions matter for a multi-step write, like transferring money between two accounts?',
    a: 'Without a transaction, a failure partway through — after debiting one account but before crediting the other — leaves the data in a half-updated, inconsistent state. A transaction ensures both writes succeed or both roll back.',
  },
  {
    q: 'What would GROUP BY be used for in a support or ops context?',
    a: 'Answering aggregate questions like "how many tickets per category this week" — collapsing many rows into one summary row per group.',
  },
] as const;

export default function SqlBasicsConceptCheck() {
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
