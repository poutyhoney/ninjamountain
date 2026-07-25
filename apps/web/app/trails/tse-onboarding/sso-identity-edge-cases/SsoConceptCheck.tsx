'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: "A customer's whole company suddenly can't log in at the same time. What's a likely SSO-specific cause?",
    a: 'The IdP rotated its SAML signing certificate and your app still has the old one — every assertion now fails signature validation at once.',
  },
  {
    q: "What does SCIM do that plain SSO/SAML doesn't?",
    a: "SCIM provisions and deprovisions accounts automatically based on IdP directory changes. SSO/SAML only handles authentication at login time, not account lifecycle.",
  },
  {
    q: "A former employee at a customer's company can still log in after being removed from their IdP. What's the likely cause?",
    a: "SCIM deprovisioning didn't run, failed, or ran late — the app's local account was never deactivated even though the IdP-side identity was removed.",
  },
  {
    q: 'A SAML login fails with an "assertion expired" error even though the user just logged in. What should you check?',
    a: "Clock skew between the IdP and your service provider — SAML assertions have a tight validity window, and drift on either side causes valid-looking assertions to be rejected.",
  },
  {
    q: 'Users log in successfully via SSO but get the wrong (or no) permissions. What\'s a likely cause?',
    a: "An attribute or claim mapping mismatch — the IdP is sending role or group info under a field name your app isn't reading.",
  },
] as const;

export default function SsoConceptCheck() {
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
