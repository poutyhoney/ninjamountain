'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'What does "reading fluency" in an unfamiliar language mean, practically, versus being an expert in it?',
    a: 'Being able to navigate the codebase, recognize common idioms and structure, and make a safe, pattern-matching change — not being able to write idiomatic code from scratch without reference.',
  },
  {
    q: 'In the Go/Ruby example, what shape do both snippets implement, regardless of syntax?',
    a: 'Look up a resource by ID, handle the not-found case explicitly, and serialize the result (or error) as a response.',
  },
  {
    q: 'Why does code review matter even when the author is confident the change is correct?',
    a: "A second reader catches what the author's own familiarity with the change blinds them to — assumptions, edge cases, or context the author has but didn't write down.",
  },
  {
    q: "What's the point of a staged or canary rollout instead of deploying to 100% of traffic at once?",
    a: 'It limits a bad change\'s blast radius to a fraction of users, giving you a chance to catch and roll back before everyone is affected.',
  },
  {
    q: 'When picking up an unfamiliar codebase\'s language for the first time, what should you look for before writing any code?',
    a: "The existing test suite (documents intended behavior), the dependency manifest (what's actually available to use), and an existing similar pattern to follow instead of inventing a new one.",
  },
] as const;

export default function ProdBarConceptCheck() {
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
