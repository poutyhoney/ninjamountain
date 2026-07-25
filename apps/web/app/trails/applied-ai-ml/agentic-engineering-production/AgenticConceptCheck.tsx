'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'What makes a workflow "agentic" rather than a single LLM call?',
    a: 'A loop where the model can call tools, observe results, and decide the next action — rather than one prompt in, one response out.',
  },
  {
    q: 'In the trace above, what went wrong before the refund tool was even called?',
    a: 'The model never called a lookup tool to find the actual last order — it hallucinated a plausible-looking order_id instead of retrieving a real one.',
  },
  {
    q: "What problem does RAG solve that a bigger context window alone doesn't?",
    a: "RAG retrieves only the relevant slice of your own data at request time, so the model can act on current, specific information it was never trained on — a bigger window still requires deciding what to put in it.",
  },
  {
    q: 'Why do evals matter more once an agent has tools, compared to a plain chat prompt?',
    a: 'With tools, wrong behavior can have real side effects — a bad refund, a bad API call. Evals catch regressions from a prompt or model change before they hit production, not after.',
  },
  {
    q: "What does MCP standardize that plain function-calling doesn't?",
    a: 'A consistent protocol for how a model discovers and calls tools/resources across different clients and servers, instead of every integration defining its own bespoke schema.',
  },
] as const;

export default function AgenticConceptCheck() {
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
