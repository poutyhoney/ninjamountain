'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'What three concepts does almost every low-code automation tool share, regardless of vendor?',
    a: 'A trigger, one or more actions, and mapping data from earlier steps into later ones.',
  },
  {
    q: 'In the trace above, why did Action 3 never run?',
    a: 'Action 2 failed (a Zendesk rate limit) and there was no retry or error-handling branch configured, so the workflow just stopped instead of continuing or alerting.',
  },
  {
    q: "What's the main practical difference between Zapier and Make for someone building the same workflow?",
    a: 'Zapier is simpler and more linear (trigger → action chain); Make supports more complex branching and routing visually, at the cost of a steeper learning curve.',
  },
  {
    q: 'Why might a team choose n8n over Zapier or Make even though it takes more setup?',
    a: 'n8n is open-source and self-hostable — useful when workflow logic needs to live in your own infrastructure, or when you need capabilities SaaS tools gate behind higher pricing tiers.',
  },
  {
    q: "What's a sign that a workflow has outgrown a visual automation builder?",
    a: 'It needs more than a few conditional branches, real error handling and retries, or touches sensitive data — that\'s usually the point to write actual code instead of adding another branch.',
  },
] as const;

export default function AutomationConceptCheck() {
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
