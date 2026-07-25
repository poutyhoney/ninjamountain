'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: "What's the difference between the system message and a user message?",
    a: 'The system message sets persistent behavior and constraints for the whole conversation; the user message is the actual per-turn request. Fix misbehavior in the system prompt first.',
  },
  {
    q: 'Why ask for structured JSON output instead of parsing free text?',
    a: 'Downstream code can parse a schema reliably instead of relying on fragile string matching against prose that can vary in wording run to run.',
  },
  {
    q: "A model states a false fact with full confidence. What's this called, and what shouldn't you assume?",
    a: "Hallucination — don't assume confidence correlates with correctness. There's no built-in signal distinguishing a hallucinated answer from a correct one.",
  },
  {
    q: 'What is prompt injection, for a model that reads external content like a webpage or document?',
    a: 'Untrusted content contains instructions the model follows as if they came from the actual operator or user — a security concern any time the model reads content you don\'t control.',
  },
  {
    q: 'Why can the same prompt produce a different response on two separate runs, even at low temperature?',
    a: "LLM output is inherently non-deterministic to some degree — design systems and evals around variation rather than assuming exact repeatability.",
  },
] as const;

export default function LlmApiConceptCheck() {
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
