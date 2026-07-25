'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'What is the difference between a "root cause" and a "contributing factor" in an RCA?',
    a: 'The root cause is the fundamental condition that, if removed, would have prevented the incident. Contributing factors made it worse or more likely but wouldn’t have caused it alone. Good RCAs document both, but corrective actions should target the root cause first.',
  },
  {
    q: 'Why do most incident-response frameworks insist an RCA be "blameless"?',
    a: 'Blaming an individual discourages honest reporting and hides the systemic conditions — missing tests, unclear alerts, a risky deploy process — that actually let the incident happen. A blameless postmortem asks "what let this happen," which surfaces more durable fixes than "who caused this."',
  },
  {
    q: 'Why assign a severity level before you even know the root cause?',
    a: 'Severity should reflect customer and business impact, not root cause. Assigning it early sets the right urgency, staffing, and communication cadence — you don’t need to know why something broke to know how badly it’s hurting customers right now.',
  },
  {
    q: 'Why should an RCA include a timeline, not just a final explanation?',
    a: 'A timeline exposes detection gaps (how long until someone noticed) and response gaps (how long until the right people engaged) — and often reveals more than one contributing factor that a single summary paragraph would hide.',
  },
  {
    q: 'An RCA’s action item says "add more monitoring." Why is that a weak corrective action?',
    a: 'It’s vague and unowned — it doesn’t specify what signal, threshold, or alert. Strong action items are specific, assigned to an owner, and have a target date; vague ones tend to never get done and don’t actually prevent recurrence.',
  },
] as const;

export default function RcaConceptCheck() {
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
