'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: "What's the practical difference between Copilot-style autocomplete and a CLI agent like Claude Code?",
    a: "Autocomplete suggests the next few lines as you type, staying fully in your control. A CLI agent can read a whole repo, plan, and make multi-file changes autonomously, with you reviewing the result rather than typing it.",
  },
  {
    q: 'Why does a vague prompt tend to produce worse code than a specific one, even for a capable model?',
    a: 'A vague prompt leaves the model to guess at constraints, file locations, and existing patterns — specifying them upfront removes guesswork instead of hoping a second iteration fixes it.',
  },
  {
    q: 'Why should AI-generated code touching auth or payments get more scrutiny than a boilerplate change?',
    a: "The tool doesn't know which lines are load-bearing — it can produce plausible-looking code for a security or financial path that's subtly wrong in ways a quick skim won't catch.",
  },
  {
    q: 'What shifts in your workflow once an AI tool is writing a meaningful share of your code?',
    a: "The bottleneck moves from writing to reviewing — every diff needs the same scrutiny you'd give a teammate's PR, not a rubber stamp because a tool produced it.",
  },
  {
    q: 'When would you reach for a general assistant like ChatGPT instead of an IDE-integrated tool?',
    a: 'For reasoning about an approach or explaining an unfamiliar error outside the context of a specific file — before you\'re ready to actually write or change code.',
  },
] as const;

export default function AiDevConceptCheck() {
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
