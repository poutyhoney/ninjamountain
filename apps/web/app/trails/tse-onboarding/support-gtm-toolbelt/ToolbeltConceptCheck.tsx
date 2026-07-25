'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: "A customer's ticket references a Jira issue that's still \"In Progress.\" What should you tell them?",
    a: "That there's an active, related engineering ticket — without overpromising a timeline you don't control. Reference the linked issue rather than restating a guess about when it'll ship.",
  },
  {
    q: 'A customer sees behavior that doesn\'t match the docs, with no bug involved at all. What should you check?',
    a: 'Whether they\'re in (or out of) a feature-flag rollout cohort, before assuming it\'s a code-level bug.',
  },
  {
    q: 'What is Metabase typically used for in a support context?',
    a: 'Self-serve data lookups — like "how many customers are affected" — without waiting on a data engineer to run a query for you.',
  },
  {
    q: "What's the difference between where a customer conversation lives (Zendesk/Intercom) and where the fix is tracked (Jira/Linear)?",
    a: "The support ticket tracks the customer relationship and SLA; the engineering ticket tracks the actual fix. They're linked, but have independent lifecycles and statuses.",
  },
  {
    q: 'A billing complaint turns out to be a proration issue, not a charge error. Where would you look to confirm that?',
    a: "The billing tool's subscription and invoice history (e.g. Stripe), which shows the actual proration calculation behind the charge.",
  },
] as const;

export default function ToolbeltConceptCheck() {
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
