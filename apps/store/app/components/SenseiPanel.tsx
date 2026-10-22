"use client";

import { useEffect, useRef, useState } from "react";

import { readNdjson } from "@/lib/ndjson";
import type { Challenge, SenseiLine } from "@/lib/sensei-types";

type Status = "idle" | "streaming" | "done" | "stopped" | "error" | "limited";

type HintRequest = {
  challengeId: string;
  question: string;
};

type SenseiPanelProps = {
  challenges: Challenge[];
};

function hoursUntil(seconds: number): string {
  const hours = Math.max(1, Math.ceil(seconds / 3600));
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

export default function SenseiPanel({ challenges }: SenseiPanelProps) {
  const [challengeId, setChallengeId] = useState(challenges[0]?.id ?? "");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [answer, setAnswer] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [retryAfter, setRetryAfter] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<HintRequest | null>(null);
  const stopButtonRef = useRef<HTMLButtonElement>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const wasStreamingRef = useRef(false);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const challenge = challenges.find((item) => item.id === challengeId);
  const streaming = status === "streaming";

  useEffect(() => {
    if (streaming) {
      stopButtonRef.current?.focus();
    } else if (wasStreamingRef.current) {
      questionRef.current?.focus();
    }
    wasStreamingRef.current = streaming;
  }, [streaming]);

  function fail(message: string) {
    setErrorMessage(message);
    setStatus("error");
  }

  async function ask(request: HintRequest) {
    const controller = new AbortController();
    controllerRef.current = controller;
    lastRequestRef.current = request;
    setAnswer("");
    setErrorMessage("");
    setStatus("streaming");

    try {
      const res = await fetch("/api/sensei", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_id: request.challengeId,
          question: request.question,
        }),
        signal: controller.signal,
      });

      if (res.status === 429) {
        setRetryAfter(Number(res.headers.get("Retry-After") ?? 0));
        setRemaining(0);
        setStatus("limited");
        return;
      }
      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => null)) as {
          detail?: string;
        } | null;
        fail(
          body?.detail ?? `The Sensei couldn't answer (error ${res.status}).`,
        );
        return;
      }

      let finished = false;
      for await (const line of readNdjson<SenseiLine>(res.body)) {
        if (line.type === "text") {
          setAnswer((previous) => previous + line.text);
        } else if (line.type === "done") {
          finished = true;
          setRemaining(line.remaining);
        } else {
          fail(line.message);
          return;
        }
      }

      if (finished) {
        setStatus("done");
      } else {
        fail("The answer was cut off. Try again.");
      }
    } catch {
      if (controller.signal.aborted) {
        setStatus("stopped");
      } else {
        fail("Can't reach the Sensei right now.");
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || streaming) {
      return;
    }
    void ask({ challengeId, question: trimmed });
  }

  function retry() {
    if (lastRequestRef.current) {
      void ask(lastRequestRef.current);
    }
  }

  return (
    <section
      aria-labelledby="sensei-heading"
      className="flex flex-col gap-4 rounded-2xl border border-nm-slate bg-nm-charcoal p-6"
    >
      <h2 id="sensei-heading" className="text-lg font-semibold">
        Ask the Sensei
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="sensei-challenge" className="text-sm text-nm-silver">
            Challenge
          </label>
          <select
            id="sensei-challenge"
            value={challengeId}
            onChange={(event) => setChallengeId(event.target.value)}
            disabled={streaming}
            className="rounded-lg border border-nm-slate bg-nm-obsidian px-3 py-2"
          >
            {challenges.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        {challenge && <p className="text-nm-silver">{challenge.prompt}</p>}

        <div className="flex flex-col gap-1">
          <label htmlFor="sensei-question" className="text-sm text-nm-silver">
            Your question
          </label>
          <textarea
            ref={questionRef}
            id="sensei-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={500}
            rows={3}
            disabled={streaming}
            className="rounded-lg border border-nm-slate bg-nm-obsidian px-3 py-2"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {streaming ? (
            <button
              key="stop"
              ref={stopButtonRef}
              type="button"
              onClick={() => controllerRef.current?.abort()}
              className="rounded-full border border-nm-violet px-4 py-2 font-semibold text-nm-violet"
            >
              Stop
            </button>
          ) : (
            <button
              key="ask"
              type="submit"
              disabled={!question.trim() || status === "limited"}
              className="rounded-full bg-nm-violet px-4 py-2 font-semibold text-nm-obsidian disabled:opacity-50"
            >
              Ask
            </button>
          )}
          {remaining !== null && (
            <p className="text-sm text-nm-silver">
              {remaining === 1
                ? "1 hint left today"
                : `${remaining} hints left today`}
            </p>
          )}
        </div>
      </form>

      <div
        aria-live="polite"
        aria-busy={streaming}
        className="min-h-32 whitespace-pre-wrap"
      >
        {answer}
        {status === "stopped" && (
          <p className="mt-2 text-sm text-nm-silver">Stopped.</p>
        )}
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 text-nm-honey"
        >
          <p>{errorMessage}</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-full border border-nm-honey px-4 py-2 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {status === "limited" && (
        <p role="alert" className="text-nm-honey">
          You&apos;ve used today&apos;s hints. More in {hoursUntil(retryAfter)}.
        </p>
      )}
    </section>
  );
}
