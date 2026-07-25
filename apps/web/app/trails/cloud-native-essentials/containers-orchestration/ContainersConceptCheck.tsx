'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: "What's the difference between an image and a container?",
    a: 'An image is a read-only template — a compiled Dockerfile. A container is a running (or stopped) instance of that image, with its own writable layer on top.',
  },
  {
    q: 'A Pod shows ImagePullBackOff. What are the two most common causes?',
    a: 'A wrong or missing image tag, or the node lacking credentials to pull from a private registry.',
  },
  {
    q: 'Why check `kubectl logs --previous` instead of `kubectl logs`?',
    a: '`logs` shows the current, already-restarted container. `--previous` shows the crashed instance — which is usually where the actual error lives.',
  },
  {
    q: 'A container was OOMKilled. What should you check first?',
    a: "Whether the memory limit is simply set too low for real usage, versus an actual leak in the application — the fix is very different depending on which it is.",
  },
  {
    q: 'What does a Deployment give you that creating a Pod directly does not?',
    a: 'Self-healing (replacing failed Pods automatically) and rolling updates across a set of replicas.',
  },
] as const;

export default function ContainersConceptCheck() {
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
