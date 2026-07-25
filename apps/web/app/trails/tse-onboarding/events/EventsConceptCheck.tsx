'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'What is the fundamental difference between a webhook and polling an API?',
    a: 'A webhook is push-based — the provider calls your endpoint the moment something happens. Polling is pull-based — your system repeatedly asks "did anything change?" Webhooks cut latency and wasted requests, but require you to expose and secure a receiving endpoint.',
  },
  {
    q: 'Why might your system receive the exact same webhook event twice?',
    a: 'Most providers guarantee "at-least-once" delivery — if they don’t get a fast 2xx response, they retry. That means your endpoint must be idempotent (deduplicate by event ID) rather than assume exactly-once delivery.',
  },
  {
    q: 'Can you assume webhook events arrive in the order they were generated?',
    a: 'No. Retries, queueing, and parallel delivery mean order isn’t guaranteed. Use a timestamp or sequence number in the payload to reconstruct order — never rely on arrival order.',
  },
  {
    q: 'A customer says they never received a webhook. What’s the first artifact you’d ask for?',
    a: 'The provider’s delivery log for that event — most platforms record every delivery attempt along with the response code the receiving endpoint returned. That tells you whether it was sent, and how the receiver responded.',
  },
  {
    q: 'Why should a webhook receiver verify a signature header before trusting the payload?',
    a: 'Without verification, anyone who discovers your endpoint URL could POST fake events to it. A signature (usually an HMAC over the raw body with a shared secret) proves the payload actually came from the provider and wasn’t tampered with in transit.',
  },
] as const;

export default function EventsConceptCheck() {
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
