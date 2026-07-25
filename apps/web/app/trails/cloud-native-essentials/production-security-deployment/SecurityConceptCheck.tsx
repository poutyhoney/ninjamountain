'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'What\'s wrong with `"Action": "s3:*", "Resource": "*"` for a service that only ever reads one bucket?',
    a: "It grants far more than needed — write/delete access, plus every bucket in the account, not just the one it uses. If that service is compromised, the blast radius is the whole account's S3, not one bucket.",
  },
  {
    q: 'Where should an API key or database password live?',
    a: 'In a dedicated secrets manager (Vault, AWS Secrets Manager, etc.), injected at runtime — never committed to source control or left in a plaintext .env file in the repo.',
  },
  {
    q: 'What does network segmentation actually buy you if one service is compromised?',
    a: "It limits the blast radius — a compromised service can only reach what it's explicitly allowed to reach, not every other service in the environment.",
  },
  {
    q: "A customer requires an air-gapped install. What's the single biggest operational change versus a normal cloud deploy?",
    a: 'Every dependency — container images, OS packages, license/update checks — has to be manually mirrored in. Nothing can reach the public internet at runtime or install time.',
  },
  {
    q: 'Why is an overly broad IAM policy described as the most common production incident, ahead of more sophisticated exploits?',
    a: 'Because it turns a small, contained compromise (one service, one bug) into full account or environment access — the failure is usually a misconfiguration, not a novel attack technique.',
  },
] as const;

export default function SecurityConceptCheck() {
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
