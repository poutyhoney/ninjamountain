'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'What is the difference between authentication and authorization?',
    a: 'Authentication proves who is making the request (identity). Authorization determines what that identity is allowed to do (permission). A request can be authenticated and still be unauthorized.',
  },
  {
    q: 'A request fails — is a 401 an identity problem or a permission problem? What about a 403?',
    a: '401 Unauthorized means the request has no valid identity attached (missing, expired or malformed credentials). 403 Forbidden means the identity is valid, but it does not have permission for that resource.',
  },
  {
    q: 'What are the three parts of a JWT, separated by dots?',
    a: 'Header (algorithm/type), payload (claims — e.g. subject, scopes, expiry), and signature (verifies the token was not tampered with). Only the signature is meant to be secret-dependent; the header and payload are just base64, not encrypted.',
  },
  {
    q: 'Why is storing a long-lived API key directly in client-side JavaScript risky?',
    a: 'Anything shipped to the browser is visible to the end user — they can read it from the page source or network tab. Long-lived, high-privilege secrets belong server-side; the browser should hold short-lived, narrowly-scoped tokens instead.',
  },
  {
    q: 'What does a token "scope" control that a user "role" does not necessarily capture?',
    a: 'A scope limits what a specific token can do (e.g. read-only vs. read-write), independent of the user. A role describes what the underlying user is allowed to do in general — a user with an admin role can still hold a token scoped down to read-only for a particular integration.',
  },
] as const;

export default function AuthConceptCheck() {
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
