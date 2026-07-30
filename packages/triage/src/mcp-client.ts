import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Client }               from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type Anthropic from "@anthropic-ai/sdk";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Manages a connection to src/mcp-server.ts, spawned as a real subprocess
 * over stdio — the actual MCP transport, not an in-process function call.
 * Converts the server's protocol-level responses into the shapes agent.ts
 * already works with (Anthropic.Tool[] for the tool list, a plain string
 * for each tool_result).
 */
export class McpToolClient {
  private client: Client;
  private transport: StdioClientTransport;

  constructor() {
    this.transport = new StdioClientTransport({
      command: "npx",
      args:    ["tsx", "src/mcp-server.ts"],
      cwd:     packageRoot,
      env:     process.env as Record<string, string>,
    });
    this.client = new Client({ name: "triage-agent", version: "0.1.0" });
  }

  async connect(): Promise<void> {
    await this.client.connect(this.transport);
  }

  async close(): Promise<void> {
    await this.client.close();
  }

  /** Tool list is discovered from the server's tools/list response — nothing hardcoded here. */
  async listTools(): Promise<Anthropic.Tool[]> {
    const { tools } = await this.client.listTools();
    return tools.map((t) => ({
      name:          t.name,
      description:   t.description ?? "",
      input_schema:  t.inputSchema as Anthropic.Tool["input_schema"],
    }));
  }

  async callTool(name: string, input: Record<string, unknown>): Promise<string> {
    const result = await this.client.callTool({ name, arguments: input });
    const blocks = result.content as Array<{ type: string; text?: string }>;
    return blocks
      .filter((b): b is { type: "text"; text: string } => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text)
      .join("\n");
  }
}
