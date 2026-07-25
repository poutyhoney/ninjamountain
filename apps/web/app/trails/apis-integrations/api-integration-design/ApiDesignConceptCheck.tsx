'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'Why is GET /getUserData?id=123 a design smell compared to GET /v1/users/123?',
    a: "The verb (\"get\") is baked into the path instead of relying on the HTTP method itself, and the resource — the user — isn't represented as a clean, addressable path. Both make the API harder to extend consistently.",
  },
  {
    q: 'Why does an unbounded list endpoint need pagination even if it "only has a few hundred rows today"?',
    a: 'The data will grow, and un-paginated responses eventually become slow or unbounded — building pagination from day one avoids a breaking change to add it later.',
  },
  {
    q: 'Why is cursor-based pagination usually preferred over offset-based for data that changes while someone is paging through it?',
    a: "Offset-based pagination can skip or duplicate rows if data is inserted or deleted between page requests; a cursor anchors to a specific position that isn't affected by shifts elsewhere in the list.",
  },
  {
    q: 'What problem does an idempotency key solve for a write request specifically?',
    a: 'It lets a client safely retry a write after a timeout or dropped connection without risking a duplicate — the server recognizes the repeated key and returns the original result instead of creating a second record.',
  },
  {
    q: 'Why maintain an official SDK instead of leaving every integrator to call the raw HTTP API?',
    a: 'A shared SDK centralizes auth handling, retries, and typed request/response shapes once, instead of every consumer re-implementing — and potentially getting wrong — the same logic independently.',
  },
] as const;

export default function ApiDesignConceptCheck() {
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
