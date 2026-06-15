'use client';

import { useState } from 'react';
import type { TriageOutcome, TriageResult, Severity } from '@ninjamountain/triage';

// A couple of sample tickets (from the support-triage-assistant data set) so the
// page is usable without typing a full ticket from scratch.
const SAMPLES: { label: string; subject: string; body: string }[] = [
  {
    label: 'Webhook not firing',
    subject: 'Webhook not receiving SMS inbound events',
    body:
      'Hi, we configured our messaging service webhook URL to point to https://our-app.example.com/sms/inbound but we are not receiving any POST requests when customers send SMS to our number. We verified the endpoint is publicly accessible and returns 200. This started happening yesterday around 3pm UTC. Can you help?',
  },
  {
    label: 'Billing dispute',
    subject: 'Charged for calls we never made',
    body:
      'We noticed on our invoice for last month there are over 4,000 outbound voice minutes billed to our account. We only use the voice API for inbound calls and have never initiated outbound calls programmatically. The charges total around $380. Please investigate and issue a refund.',
  },
  {
    label: 'Agent UI crash',
    subject: 'Agent UI keeps crashing when accepting a task',
    body:
      "Critical issue affecting our entire contact center. When an agent clicks Accept on an incoming voice task, the React component throws an uncaught exception and the browser tab crashes. Happening across Chrome and Edge for all 47 agents. Console error: 'Cannot read properties of undefined (reading channel)'.",
  },
];

const SEVERITY_STYLES: Record<Severity, string> = {
  low:      'bg-zinc-300/10 text-[#C8CCD4] ring-zinc-300/30',
  medium:   'bg-amber-300/10 text-amber-300 ring-amber-300/30',
  high:     'bg-orange-400/10 text-orange-300 ring-orange-400/30',
  critical: 'bg-red-500/10 text-red-300 ring-red-500/30',
};

const card = 'rounded-2xl border border-[#202431] bg-[#151821] p-6';

export default function TriageForm() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSample = (sample: (typeof SAMPLES)[number]) => {
    setSubject(sample.subject);
    setBody(sample.body);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      const outcome: TriageOutcome = await res.json();

      if (outcome.ok) {
        setResult(outcome.result);
      } else {
        setError(`Triage failed (${outcome.reason}): ${outcome.lastErrors.join('; ')}`);
      }
    } catch {
      setError('Could not reach the triage service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = subject.trim() !== '' && body.trim() !== '' && !loading;

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className={`${card} flex flex-col gap-5`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-[#6F7684]">Try a sample:</span>
          {SAMPLES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => loadSample(sample)}
              className="rounded-full border border-[#202431] px-3 py-1 text-xs text-[#C8CCD4] transition-colors hover:border-[#8B6CFF]/50 hover:text-[#E9ECF2]"
            >
              {sample.label}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#C8CCD4]">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Short summary of the ticket"
            className="rounded-lg border border-[#202431] bg-[#0A0B0F] px-3 py-2 text-[#E9ECF2] outline-none transition-colors placeholder:text-[#6F7684] focus:border-[#8B6CFF]/60"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#C8CCD4]">Ticket body</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            placeholder="Paste the full customer message here…"
            className="resize-y rounded-lg border border-[#202431] bg-[#0A0B0F] px-3 py-2 text-[#E9ECF2] outline-none transition-colors placeholder:text-[#6F7684] focus:border-[#8B6CFF]/60"
          />
        </label>

        <div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-full bg-[#E9ECF2] px-5 py-3 font-semibold text-[#0A0B0F] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {loading ? 'Triaging…' : 'Triage ticket'}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.08] p-5 text-sm text-red-200">
          {error}
        </div>
      )}

      {result && <TriageResultCard result={result} />}
    </div>
  );
}

function TriageResultCard({ result }: { result: TriageResult }) {
  return (
    <div className={`${card} flex flex-col gap-5`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full bg-[#8B6CFF]/10 px-3 py-1 text-xs font-medium text-[#8B6CFF] ring-1 ring-inset ring-[#8B6CFF]/30">
          {result.category}
        </span>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ring-1 ring-inset ${SEVERITY_STYLES[result.severity]}`}
        >
          {result.severity}
        </span>
        {result.needs_engineering_escalation && (
          <span className="inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300 ring-1 ring-inset ring-red-500/30">
            Escalate to engineering
          </span>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Summary</h3>
        <p className="mt-1 text-[#E9ECF2]">{result.summary}</p>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Suggested first response
        </h3>
        <p className="mt-1 whitespace-pre-wrap leading-relaxed text-[#C8CCD4]">
          {result.suggested_first_response}
        </p>
      </div>
    </div>
  );
}
