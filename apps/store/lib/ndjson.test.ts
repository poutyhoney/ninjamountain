// @vitest-environment node
import { describe, expect, it } from "vitest";

import { readNdjson } from "./ndjson";

const encoder = new TextEncoder();

function streamOf(
  chunks: Array<string | Uint8Array>,
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(
          typeof chunk === "string" ? encoder.encode(chunk) : chunk,
        );
      }
      controller.close();
    },
  });
}

async function collect(chunks: Array<string | Uint8Array>): Promise<unknown[]> {
  const lines: unknown[] = [];
  for await (const line of readNdjson(streamOf(chunks))) {
    lines.push(line);
  }
  return lines;
}

describe("readNdjson", () => {
  it("parses one object per line", async () => {
    expect(await collect(['{"n":1}\n', '{"n":2}\n'])).toEqual([
      { n: 1 },
      { n: 2 },
    ]);
  });

  it("joins a line split across two chunks", async () => {
    expect(await collect(['{"text":"hel', 'lo"}\n'])).toEqual([
      { text: "hello" },
    ]);
  });

  it("splits several lines that arrive in one chunk", async () => {
    expect(await collect(['{"n":1}\n{"n":2}\n{"n":3}\n'])).toEqual([
      { n: 1 },
      { n: 2 },
      { n: 3 },
    ]);
  });

  it("keeps a character whose bytes are split across chunks", async () => {
    const bytes = encoder.encode('{"text":"🥷"}\n');
    const emojiStart = bytes.findIndex((byte) => byte >= 0xf0);
    const chunks = [
      bytes.slice(0, emojiStart + 2),
      bytes.slice(emojiStart + 2),
    ];

    expect(await collect(chunks)).toEqual([{ text: "🥷" }]);
  });

  it("parses a last line with no newline", async () => {
    expect(await collect(['{"n":1}\n{"n":2}'])).toEqual([{ n: 1 }, { n: 2 }]);
  });

  it("skips blank lines", async () => {
    expect(await collect(['{"n":1}\n\n\n{"n":2}\n'])).toEqual([
      { n: 1 },
      { n: 2 },
    ]);
  });

  it("throws on a line that isn't JSON", async () => {
    await expect(collect(["not json\n"])).rejects.toThrow(SyntaxError);
  });
});
