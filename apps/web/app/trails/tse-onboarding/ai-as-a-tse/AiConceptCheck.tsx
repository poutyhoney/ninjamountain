'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'What is a "hallucination," and why is it dangerous in support work?',
    a: 'A hallucination is when a model states something confidently and fluently that isn’t actually true — a made-up parameter, a wrong status-code meaning, a fabricated log line. It’s dangerous because a wrong answer delivered confidently looks identical to a correct one, so it must be checked against real evidence before you act on it or send it to a customer.',
  },
  {
    q: 'Why does pasting the actual log or error text produce a better answer than describing the problem from memory?',
    a: 'A model works from the context you give it, not your internal systems. Pasting the real request, response, or log line grounds the answer in what actually happened; describing it from memory risks the model reasoning about a slightly — or entirely — wrong version of the problem.',
  },
  {
    q: 'What kind of customer data should you avoid pasting into a general-purpose AI tool?',
    a: 'Anything that identifies a customer or exposes a secret — full account numbers, tokens or API keys, personal contact details, payment information. Scrub or redact those first, and use your company’s approved tooling with the right data-handling guarantees for anything sensitive.',
  },
  {
    q: 'An AI tool drafts an RCA in seconds. What’s your job before it goes out?',
    a: 'Verify every factual claim against the actual evidence — timestamps, error codes, the real root cause — the same way you’d check a draft written by a junior teammate. The tool can save you the first-draft effort; it doesn’t remove your responsibility for accuracy.',
  },
  {
    q: 'Name one task AI is well-suited for in a TSE’s daily workflow, and one it’s poorly suited for.',
    a: 'Well-suited: summarizing a long, noisy ticket thread or log dump into a short brief, or drafting a first pass at an explanation. Poorly suited: being the sole source of truth for something you could instead verify directly against a live system, a spec, or your own runbook — treat it as a drafting assistant, not an oracle.',
  },
] as const;

export default function AiConceptCheck() {
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
