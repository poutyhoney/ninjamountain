'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'When would Bash be the right choice for a script instead of Python?',
    a: "When the task is mostly chaining existing CLI tools together and doesn't need real data structures, error handling, or reuse by someone else later.",
  },
  {
    q: 'What does TypeScript add over plain JavaScript, concretely?',
    a: 'A type system that catches a whole category of bugs — wrong shape, undefined access — at compile time instead of surfacing as a runtime error in production.',
  },
  {
    q: 'Why is Node.js relevant to a "web developer" even if they mostly write browser-side JavaScript?',
    a: "It runs the same language on the server, plus most of the web's build tooling — bundlers, dev servers, package managers — is itself a Node program.",
  },
  {
    q: 'In the two code examples above, what does the Python version get you that the one-liner Bash version does not?',
    a: "A version that's testable, easier to extend — like adding filtering — and handles edge cases explicitly rather than relying on shell tool defaults.",
  },
  {
    q: 'What is a practical downside of always defaulting to Bash for automation, even as scripts grow?',
    a: "Bash's error handling and data structures are much weaker than a real language's — a script that grows past a few dozen lines usually becomes harder to maintain and debug in Bash than in Python or Node.",
  },
] as const;

export default function ScriptingConceptCheck() {
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
