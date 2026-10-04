import type { ModelCall, Ticket, TriageOutcome, TriageTicketOptions } from "./types";
import type { Usage }               from "./providers";
import { callTriageModel }          from "./client";
import { extractJson }              from "./parse";
import { validateTriage }           from "./validate";
import { retrievalQuery, retrieveRelevantArticles } from "./retrieve";

/**
 * Full triage pipeline for a single ticket.
 *
 * Error layers:
 *   API failures    → handled inside callTriageModel (typed errors + backoff)
 *   Output failures → retried here with a corrective hint injected into the prompt
 *
 * Always returns a typed TriageOutcome — never throws.
 *
 * Ported from support-triage-assistant/ts/triage.ts
 * kb_citations / retrieval added in v2 (RAG).
 */
export async function triageTicket(
  ticket: Ticket,
  { maxOutputRetries = 2, useRetrieval = true, provider, model, embedQuery }: TriageTicketOptions = {}
): Promise<TriageOutcome> {
  let correctionHint = "";
  const usage: Usage = { inputTokens: 0, outputTokens: 0 };
  let latencyMs = 0;

  // Retrieved once per ticket, reused across retries — a retry means the model's
  // OUTPUT was malformed, not that the ticket itself or its relevant KB context changed.
  let kbContext = "";
  if (useRetrieval) {
    try {
      const kbMatches = await retrieveRelevantArticles(retrievalQuery(ticket), 3, embedQuery);
      kbContext = kbMatches
        .map((m) => `[${m.id}] ${m.title}\n${m.body}`)
        .join("\n\n---\n\n");
    } catch (retrievalErr) {
      const message = retrievalErr instanceof Error ? retrievalErr.message : String(retrievalErr);
      return { ok: false, reason: "api_failure", lastErrors: [`retrieval: ${message}`] };
    }
  }

  for (let attempt = 1; attempt <= maxOutputRetries + 1; attempt++) {
    const ticketForModel: Ticket = correctionHint
      ? { ...ticket, body: `${ticket.body}\n\n[SYSTEM CORRECTION]: ${correctionHint}` }
      : ticket;

    let call: ModelCall;
    try {
      call = await callTriageModel(ticketForModel, { kbContext, provider, model });
    } catch (apiErr) {
      const message = apiErr instanceof Error ? apiErr.message : String(apiErr);
      return { ok: false, reason: "api_failure", lastErrors: [message] };
    }

    usage.inputTokens  += call.usage.inputTokens;
    usage.outputTokens += call.usage.outputTokens;
    latencyMs          += call.latencyMs;

    let parsed: unknown;
    try {
      parsed = extractJson(call.text);
    } catch (parseErr) {
      correctionHint =
        "Your previous response could not be parsed as JSON. Return ONLY a valid JSON object, no fences, no prose.";
      if (attempt === maxOutputRetries + 1) {
        const message = parseErr instanceof Error ? parseErr.message : String(parseErr);
        return { ok: false, reason: "unparseable", lastErrors: [message] };
      }
      continue;
    }

    const validation = validateTriage(parsed);
    if (validation.valid) {
      return {
        ok:       true,
        result:   validation.value,
        attempts: attempt,
        provider: call.provider,
        model:    call.model,
        usage,
        latencyMs,
      };
    }

    correctionHint = `Your previous response had these problems: ${validation.errors.join("; ")}. Fix them and return ONLY valid JSON.`;
    if (attempt === maxOutputRetries + 1) {
      return { ok: false, reason: "invalid_schema", lastErrors: validation.errors };
    }
  }

  // Unreachable given the loop structure, but TypeScript requires a return
  return { ok: false, reason: "invalid_schema", lastErrors: ["exhausted retries"] };
}