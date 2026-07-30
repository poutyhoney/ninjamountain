import type Anthropic from "@anthropic-ai/sdk";
import { retrieveRelevantArticles }              from "./retrieve";
import { findAccountByIdentifier, findRecentTickets } from "./mock-data";

// Tool definitions for the v3 agent loop (src/agent.ts), in Anthropic's
// tool-use format. search_kb is real (wraps retrieve.ts / the Voyage
// embeddings pipeline built in Days 8-9); the other three are mocked —
// get_customer_account and check_recent_tickets return mock data on purpose,
// the agent pattern is the interview story, not the data source.
export const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_kb",
    description:
      "Search the support knowledge base for articles relevant to a query. " +
      "Returns up to 3 matching articles with id, title, and body. Use this " +
      "before answering so your response can cite real KB content.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "What to search for — a few keywords describing the customer's problem.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_customer_account",
    description:
      "Look up a customer's account (plan tier, account status, signup date) by a " +
      "phone number, email, or account SID mentioned in the ticket. Returns " +
      "'not found' if there's no match — that's a normal, expected result.",
    input_schema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description: "Phone number, email, or account SID pulled from the ticket text.",
        },
      },
      required: ["identifier"],
    },
  },
  {
    name: "check_recent_tickets",
    description:
      "Look up a customer's recent support ticket history using the same identifier " +
      "as get_customer_account. Useful for spotting repeat issues before deciding severity.",
    input_schema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description: "Phone number, email, or account SID pulled from the ticket text.",
        },
      },
      required: ["identifier"],
    },
  },
  {
    name: "escalate_to_engineering",
    description:
      "File an engineering escalation for this ticket. Only call this for a confirmed " +
      "platform bug or outage that needs engineering investigation — not for config, " +
      "how-to, or billing issues.",
    input_schema: {
      type: "object",
      properties: {
        summary:  { type: "string", description: "One-sentence summary for the engineering queue." },
        severity: { type: "string", enum: ["high", "critical"], description: "Escalation severity." },
      },
      required: ["summary", "severity"],
    },
  },
];

/**
 * Executes one tool call and returns its result as a string (the shape
 * Anthropic's tool_result content expects). Never throws — an unknown tool
 * or bad input produces a descriptive string result instead, so a model
 * mistake shows up as a tool_result the model can react to, not a crash.
 */
export async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "search_kb": {
      const query = String(input.query ?? "");
      const matches = await retrieveRelevantArticles(query, 3);
      if (matches.length === 0) return "No matching KB articles found.";
      return matches
        .map((m) => `[${m.id}] ${m.title} (score ${m.score.toFixed(3)})\n${m.body}`)
        .join("\n\n---\n\n");
    }

    case "get_customer_account": {
      const identifier = String(input.identifier ?? "");
      const account = findAccountByIdentifier(identifier);
      return account
        ? JSON.stringify(account)
        : `No account found for identifier "${identifier}".`;
    }

    case "check_recent_tickets": {
      const identifier = String(input.identifier ?? "");
      const tickets = findRecentTickets(identifier);
      return tickets.length > 0
        ? JSON.stringify(tickets)
        : `No recent ticket history found for identifier "${identifier}".`;
    }

    case "escalate_to_engineering": {
      const summary = String(input.summary ?? "");
      const severity = String(input.severity ?? "unspecified");
      const escalationId = `ESC-${Math.floor(1000 + Math.random() * 9000)}`;
      return `Escalation ${escalationId} filed (severity: ${severity}): ${summary}`;
    }

    default:
      return `Unknown tool "${name}".`;
  }
}
