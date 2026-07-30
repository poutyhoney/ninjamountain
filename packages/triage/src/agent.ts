import Anthropic, { APIError } from "@anthropic-ai/sdk";
import type { Ticket, AgentOutcome, ToolCallLogEntry } from "./types";
import { extractJson }        from "./parse";
import { validateTriage }     from "./validate";
import { TOOLS, executeTool } from "./tools";

const client = new Anthropic();
const MODEL  = "claude-sonnet-4-6";

// Hard cap on model turns. A turn that calls tools doesn't produce a final
// answer, so this bounds both API cost and how long a stuck loop can run
// before we give up and report it as a structured failure (see Day 11).
const MAX_ITERATIONS = 6;

const AGENT_SYSTEM_PROMPT = `You are a support ticket triage agent for a SaaS company.
You have tools available — use them as needed before answering:

- search_kb: look up knowledge base articles relevant to the issue.
- get_customer_account: look up account info if the ticket mentions a phone number, email, or account SID.
- check_recent_tickets: look up recent ticket history for the same identifier, to spot repeat issues.
- escalate_to_engineering: file a real escalation — only for a confirmed platform bug or outage.

When you have enough information, stop calling tools and respond with ONLY a JSON object
with exactly these fields (no prose, no markdown fences):
{
    "category": one of "bug" | "config" | "billing" | "how_to" | "feature_request",
    "severity": one of "low" | "medium" | "high" | "critical",
    "summary": a one-sentence summary of the issue,
    "suggested_first_response": a brief, professional response the support engineer could send,
    "needs_engineering_escalation": boolean — true only if you actually called escalate_to_engineering,
    "kb_citations": an array of KB article ids you actually drew on for suggested_first_response,
      from search_kb results. Return [] if none were relevant or you didn't need to search.
}
use the following rubric when determining category:
bug = the platform itself is behaving incorrectly — a defect, including when it fails to honor a setting the customer configured correctly;
config = the root cause is the customer's own setup, credentials, account state, or a registration that needs changing;
billing = invoices, charges, credits, refunds, or billing-driven account status;
how_to = a question asking how to set up or build something where nothing is currently broken;
feature_request = asking for a capability that does not exist yet.

use the following rubric when determining severity:
critical = whole product down or unusable, widespread/urgent;
high = the customer is blocked from completing a task with no workaround (even if the rest of the product still works), or many users are blocked;
medium = a feature is degraded but the customer can still get the job done via a workaround;
low = a question, cosmetic-only issue, or roadmap/feature request.

Do not call the same tool with the same input twice. Do not call escalate_to_engineering
speculatively — only after you've concluded the issue is a confirmed bug or outage.`;

/**
 * Runs the tool-use agent loop for a single ticket: the model decides which
 * tools to call (if any), we execute them and feed results back, and we
 * repeat until the model returns a final JSON answer or MAX_ITERATIONS is
 * hit. Every tool call is recorded in toolLog regardless of outcome.
 *
 * Never throws — always returns a typed AgentOutcome, same discriminated-
 * union pattern as triageTicket() in triage.ts.
 */
export async function runTriageAgent(ticket: Ticket): Promise<AgentOutcome> {
  const toolLog: ToolCallLogEntry[] = [];
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: `Subject: ${ticket.subject}\n\nBody: ${ticket.body}` },
  ];

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
    let message: Anthropic.Message;
    try {
      message = await client.messages.create({
        model:       MODEL,
        max_tokens:  1024,
        temperature: 0,
        system:      AGENT_SYSTEM_PROMPT,
        tools:       TOOLS,
        messages,
      });
    } catch (err) {
      const msg = err instanceof APIError ? err.message : String(err);
      return { ok: false, reason: "api_failure", lastErrors: [msg], toolLog };
    }

    messages.push({ role: "assistant", content: message.content });

    if (message.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of message.content) {
        if (block.type !== "tool_use") continue;
        const input = block.input as Record<string, unknown>;
        const output = await executeTool(block.name, input);
        toolLog.push({ iteration, tool: block.name, input, output });
        console.log(`[agent] iter ${iteration}: ${block.name}(${JSON.stringify(input)}) -> ${output.slice(0, 120)}`);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: output });
      }
      messages.push({ role: "user", content: toolResults });
      continue;
    }

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, reason: "unparseable", lastErrors: ["final response had no text block"], toolLog };
    }

    let parsed: unknown;
    try {
      parsed = extractJson(textBlock.text);
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      return { ok: false, reason: "unparseable", lastErrors: [msg], toolLog };
    }

    const validation = validateTriage(parsed);
    if (!validation.valid) {
      return { ok: false, reason: "invalid_schema", lastErrors: validation.errors, toolLog };
    }

    return { ok: true, result: validation.value, iterations: iteration, toolLog };
  }

  return {
    ok: false,
    reason: "max_iterations",
    lastErrors: [`agent did not produce a final answer within ${MAX_ITERATIONS} iterations`],
    toolLog,
  };
}
