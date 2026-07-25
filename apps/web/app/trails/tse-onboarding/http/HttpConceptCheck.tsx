'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'Which HTTP method is meant to update part of an existing resource without replacing the whole thing?',
    a: 'PATCH. PUT typically replaces the entire resource; PATCH applies a partial update.',
  },
  {
    q: 'A client sends a request with a malformed JSON body. What status code family should the server return?',
    a: '4xx — client error. Specifically 400 Bad Request, since the request itself could not be parsed.',
  },
  {
    q: 'A request is missing a valid access token. Is that a 401 or a 403?',
    a: '401 Unauthorized — the client has not authenticated (or the token is missing/invalid). 403 Forbidden means the client is authenticated but not allowed to access that resource.',
  },
  {
    q: 'What does a 5xx status code tell you about where the failure most likely happened?',
    a: 'The server accepted a valid request but failed while processing it — the problem is on the server side, not the client’s request.',
  },
  {
    q: 'Why do requests carry a Content-Type header?',
    a: "It tells the server (or client, on a response) how to parse the body — e.g. application/json vs. application/x-www-form-urlencoded — so the same bytes aren't misread.",
  },
] as const;

export default function HttpConceptCheck() {
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
