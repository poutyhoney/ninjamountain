'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'Why prepare a recorded fallback before presenting a live demo?',
    a: "So the first time the golden path runs isn't live in front of the customer. If the live version breaks, you have a working recording to fall back to instead of losing the room.",
  },
  {
    q: 'Something breaks mid-demo. What should you do instead of going silent while you troubleshoot?',
    a: 'Narrate what you\'re checking out loud — silence reads as "lost," narration reads as "still in control," even while you\'re actually debugging.',
  },
  {
    q: "You get a question you don't know the answer to. What's better than guessing?",
    a: 'Acknowledge it directly, answer what you do know, and commit to a specific follow-up — a named time — rather than improvising a guess.',
  },
  {
    q: 'What is the "What / Why / Show" structure for opening a walkthrough?',
    a: 'State the problem in one sentence, say why it matters to this specific audience, then take the shortest path to showing it actually working.',
  },
  {
    q: 'Why call out specific details (like a retry count updating) while a demo runs, instead of just letting it play?',
    a: "It directs attention to the thing that actually matters, and proves you understand what's happening rather than just clicking through a script.",
  },
] as const;

export default function LiveDemoConceptCheck() {
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
