#!/usr/bin/env node
// A real MCP (Model Context Protocol) server exposing the account/ticket-history/
// escalation tools built in Day 10 — same mock data (mock-data.ts), but now reachable
// over the actual protocol (stdio transport) instead of an in-process function call.
// search_kb stays out of this server: it needs the Voyage/retrieve.ts pipeline and its
// own env vars, and keeping it in-process on the agent side keeps this server focused
// on the "account system" it's standing in for.
//
// Run standalone for testing: npx @modelcontextprotocol/inspector tsx src/mcp-server.ts
import { McpServer }         from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { findAccountByIdentifier, findRecentTickets } from "./mock-data";

const server = new McpServer({ name: "triage-account-tools", version: "0.1.0" });

server.registerTool(
  "get_customer_account",
  {
    title: "Get customer account",
    description:
      "Look up a customer's account (plan tier, account status, signup date) by a " +
      "phone number, email, or account SID mentioned in the ticket. Returns " +
      "'not found' if there's no match — that's a normal, expected result.",
    inputSchema: {
      identifier: z.string().describe("Phone number, email, or account SID pulled from the ticket text."),
    },
  },
  async ({ identifier }) => {
    const account = findAccountByIdentifier(identifier);
    const text = account
      ? JSON.stringify(account)
      : `No account found for identifier "${identifier}".`;
    return { content: [{ type: "text", text }] };
  }
);

server.registerTool(
  "check_recent_tickets",
  {
    title: "Check recent tickets",
    description:
      "Look up a customer's recent support ticket history using the same identifier " +
      "as get_customer_account. Useful for spotting repeat issues before deciding severity.",
    inputSchema: {
      identifier: z.string().describe("Phone number, email, or account SID pulled from the ticket text."),
    },
  },
  async ({ identifier }) => {
    const tickets = findRecentTickets(identifier);
    const text = tickets.length > 0
      ? JSON.stringify(tickets)
      : `No recent ticket history found for identifier "${identifier}".`;
    return { content: [{ type: "text", text }] };
  }
);

server.registerTool(
  "escalate_to_engineering",
  {
    title: "Escalate to engineering",
    description:
      "File an engineering escalation for this ticket. Only call this for a confirmed " +
      "platform bug or outage that needs engineering investigation — not for config, " +
      "how-to, or billing issues.",
    inputSchema: {
      summary:  z.string().describe("One-sentence summary for the engineering queue."),
      severity: z.enum(["high", "critical"]).describe("Escalation severity."),
    },
  },
  async ({ summary, severity }) => {
    const escalationId = `ESC-${Math.floor(1000 + Math.random() * 9000)}`;
    const text = `Escalation ${escalationId} filed (severity: ${severity}): ${summary}`;
    return { content: [{ type: "text", text }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
