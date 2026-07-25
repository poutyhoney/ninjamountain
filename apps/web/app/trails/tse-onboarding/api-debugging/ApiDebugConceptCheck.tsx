'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'A customer says "the API just stopped working." What do you actually need before touching Postman?',
    a: 'A concrete example — the exact request, or as close as you can reconstruct it — not the customer\'s paraphrase of what happened.',
  },
  {
    q: 'Why build a Postman collection instead of just re-sending one request?',
    a: 'A collection is shareable and reproducible — engineering (or you, tomorrow) can rerun the exact same set of requests instead of reconstructing them from a paraphrased bug report.',
  },
  {
    q: 'The response is a 429 with a Retry-After header. What does that tell you, and what do customers usually miss about it?',
    a: "It's rate limiting, not a fault — the fix is respecting Retry-After and X-RateLimit-Remaining. Customers often only report \"it failed\" without ever looking at these headers.",
  },
  {
    q: "Why does an Idempotency-Key matter when you're retrying a customer's failed request yourself?",
    a: 'Reusing the same key on retry ensures you don\'t double-create whatever the request would create — a duplicate message or charge — which matters a lot when you\'re replaying someone else\'s failed call.',
  },
  {
    q: "What's the difference between a response's `error.code` and `error.message`, and why does it matter which one you match on?",
    a: '`code` is a stable, machine-matchable identifier for the error type; `message` is human-readable and can change wording. Build tooling and checks against `code`, never against `message` text.',
  },
] as const;

export default function ApiDebugConceptCheck() {
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
