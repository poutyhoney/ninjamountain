'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    q: "What does a trace/correlation ID let you do that a plain timestamp doesn't?",
    a: 'Tie together every log line, metric point, and trace span produced by the same request across multiple services — a timestamp alone can\'t disambiguate concurrent requests.',
  },
  {
    q: 'Why prefer structured (JSON) logs over freeform text logs?',
    a: 'Structured fields like level, service, and trace_id can be filtered and aggregated directly by tooling; freeform text requires fragile regex or string parsing to extract the same information.',
  },
  {
    q: "What's the practical difference between Prometheus and Datadog?",
    a: 'Prometheus is a pull-based, self-hosted metrics system with its own query language, common in Kubernetes-native stacks. Datadog is a hosted, unified logs/metrics/traces platform with less setup and less infra control.',
  },
  {
    q: 'An error spike in the logs and a latency alert both start at the same minute. What should you check first?',
    a: 'Whether they share a service and a time window — a coincidence in timing is often actually the same underlying incident showing up in two different tools.',
  },
  {
    q: 'Why is CloudWatch/Azure Monitor often "good enough to start" but not where teams stay long-term?',
    a: "It's the provider's native tool, so it needs zero setup, but it's usually less capable at cross-service correlation and dashboarding than a dedicated observability platform once a system has real complexity.",
  },
] as const;

export default function ObservabilityConceptCheck() {
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
