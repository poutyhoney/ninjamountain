import type Anthropic from "@anthropic-ai/sdk";
import { retrieveRelevantArticles } from "./retrieve";

// search_kb is the one tool that stays in-process: it needs the Voyage
// embeddings pipeline (and VOYAGE_API_KEY) from Days 8-9, which lives in
// this same package. get_customer_account, check_recent_tickets, and
// escalate_to_engineering moved to src/mcp-server.ts (Day 12-13) — the
// agent now discovers those dynamically via MCP instead of a hardcoded
// list here (see src/mcp-client.ts and agent.ts).
export const SEARCH_KB_TOOL: Anthropic.Tool = {
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
};

export async function executeSearchKb(input: Record<string, unknown>): Promise<string> {
  const query = String(input.query ?? "");
  const matches = await retrieveRelevantArticles(query, 3);
  if (matches.length === 0) return "No matching KB articles found.";
  return matches
    .map((m) => `[${m.id}] ${m.title} (score ${m.score.toFixed(3)})\n${m.body}`)
    .join("\n\n---\n\n");
}
