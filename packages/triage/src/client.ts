import Anthropic, { APIError } from "@anthropic-ai/sdk";
import type { Ticket, CallTriageModelOptions } from "./types";

// Next.js loads environment variables automatically (.env.local), so unlike the
// CLI version we do not import "dotenv/config" here. The ANTHROPIC_API_KEY env
// var must be set for this to work.
const client = new Anthropic();
const MODEL  = "claude-sonnet-4-6";

// The contract between this prompt and TriageResult in types.ts must stay in sync.
// TypeScript won't enforce the JSON field names inside a string literal —
// that's the job of validate.ts.
const SYSTEM_PROMPT = `You are a support ticket triage assistant for a SaaS company.
For each ticket, return a JSON object with exactly these fields:
{
    "category": one of "bug" | "config" | "billing" | "how_to" | "feature_request",
    "severity": one of "low" | "medium" | "high" | "critical",
    "summary": a one-sentence summary of the issue,
    "suggested_first_response": a brief, professional response the support engineer could send,
    "needs_engineering_escalation": boolean
}
use the following rubric when determining severity:
critical = whole product down or unusable, widespread/urgent;
high = the customer is blocked from completing a task and there is no workaround (even if the rest of the product still works), or many users are blocked;
medium = a feature is degraded but the customer can still get the job done — a workaround exists, or the core task still completes with only partial/intermittent/cosmetic impact;
low = a question, cosmetic-only issue, or roadmap/feature request

Tie-breaker for high vs medium: if a task is fully broken with no workaround, choose high; if a usable workaround exists, choose medium.

Severity reflects how blocked or at-risk the customer is, not the dollar amount.
Billing questions and routine credit/refund requests are low or medium; escalate
them only if the account is blocked/suspended or there is suspected unauthorized
access or fraud.

Return ONLY valid JSON. No prose. No markdown fences. No commentary.`;

/**
 * Makes a single triage API call.
 * Retries ONLY on transient API errors (rate limit, overloaded, network).
 * Bad-output handling is the orchestrator's job (triage.ts).
 *
 * Ported from support-triage-assistant/ts/client.ts
 */
export async function callTriageModel(
  ticket: Ticket,
  { maxAPIRetries = 3 }: CallTriageModelOptions = {}
): Promise<string> {
  let lastError: APIError | undefined;

  for (let attempt = 1; attempt <= maxAPIRetries; attempt++) {
    try {
      const message = await client.messages.create({
        model:       MODEL,
        max_tokens:  1024,
        temperature: 0, // deterministic output so eval scores reflect prompt changes, not sampling noise
        system:      SYSTEM_PROMPT,
        messages:   [
          {
            role:    "user",
            content: `Subject: ${ticket.subject}\n\nBody: ${ticket.body}`,
          },
        ],
      });

      // SDK types message.content as an array of blocks — narrow before accessing
      const block = message.content[0];
      if (block.type !== "text") {
        throw new Error(`callTriageModel: unexpected content block type "${block.type}"`);
      }
      return block.text;

    } catch (err) {
      // Anthropic SDK exports typed error classes — no need for err?.status guessing
      if (err instanceof APIError) {
        lastError = err;
        const retryable = err.status === 429 || err.status === 529 || (err.status ?? 0) >= 500;

        if (!retryable || attempt === maxAPIRetries) {
          throw new Error(
            `callTriageModel: API call failed after ${attempt} attempt(s): ${err.message}`
          );
        }
        const backoffMs = 1000 * 2 ** (attempt - 1); // 1s, 2s, 4s
        console.warn(`API error (status ${err.status}), retry ${attempt}/${maxAPIRetries} in ${backoffMs}ms`);
        await new Promise((r) => setTimeout(r, backoffMs));
      } else {
        throw err; // Non-API errors propagate immediately
      }
    }
  }

  throw lastError ?? new Error("callTriageModel: exhausted retries");
}
