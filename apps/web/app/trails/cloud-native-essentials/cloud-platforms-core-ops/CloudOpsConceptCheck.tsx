'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'You get a different answer from your local resolver than from `dig @8.8.8.8`. What does that suggest?',
    a: 'A stale or cached DNS entry on your local resolver — the record changed, but the cache hasn\'t expired (or the resolver is misconfigured).',
  },
  {
    q: '`curl -v` reports "Connection refused" rather than timing out. What does that tell you?',
    a: 'The host was reachable and responded — nothing is listening on that port. A timeout would point to the host itself being unreachable instead.',
  },
  {
    q: "What's the practical difference between a serverless function and a container on managed Kubernetes?",
    a: "A serverless function scales to zero and you never think about the runtime or host. A container on Kubernetes runs continuously (or via autoscaling) and you're still working at the pod/node layer, just not raw servers.",
  },
  {
    q: 'Why do CI/CD pipelines run tests before deploy, not after?',
    a: 'To fail as early and cheaply as possible — deploy is the expensive, user-facing step, so you want problems caught before that.',
  },
  {
    q: 'What is a rollback, and why does it need to be fast?',
    a: "Reverting to the last known-good deployed artifact. Speed matters because it's the primary mitigation for a bad deploy already affecting users — waiting on a fresh pipeline run costs more incident time.",
  },
] as const;

export default function CloudOpsConceptCheck() {
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
