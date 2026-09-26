'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'An agent clicks Accept on a voice task and the reservation shows accepted, but there\'s no audio. What\'s the likely cause?',
    a: 'AcceptTask was called without first registering a VoiceClientEvent listener — the reservation succeeds at the TaskRouter layer while the Voice client never gets the call context it needs.',
  },
  {
    q: 'A worker\'s activity is stuck on WrapUp long after the call ended. Which SDK call is probably missing?',
    a: 'CompleteTask (and WrapUpTask, if wrap-up is configured) — the reservation only clears once the client actually calls it. A silent error in that call leaves the worker parked.',
  },
  {
    q: 'You see error 45775 in the logs. Is regenerating a token on the backend enough to fix the live session?',
    a: 'No — the backend can issue a valid new token, but the running client still uses the stale one until it calls client.updateToken with the new token and refresh token.',
  },
  {
    q: 'A session log shows "SessionState: setting degraded to true." What does that actually mean for the agent?',
    a: 'One of the underlying SDK clients (TaskRouter, Conversations, Voice, or Sync) failed to initialize. Flex still loads, but with reduced capability — which channel is affected depends on which client degraded.',
  },
  {
    q: 'A chat task gets accepted, but the agent ends up in a conversation with no customer in it. Name one concrete cause.',
    a: 'The invited participant was already in another non-closed conversation, so the add silently failed — check the Participant Conversation Resource before inviting to catch this ahead of time.',
  },
] as const;

export default function FlexConceptCheck() {
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
