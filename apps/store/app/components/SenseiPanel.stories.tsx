import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { Challenge, SenseiLine } from "@/lib/sensei-types";

import SenseiPanel from "./SenseiPanel";

const CHALLENGES: Challenge[] = [
  {
    id: "bamboo-grove-growth",
    ground: "bamboo-grove",
    title: "The Doubling Stalk",
    prompt:
      "A bamboo stalk doubles in height every day. On day 12 it reaches the top of the grove. On which day was it halfway?",
  },
  {
    id: "river-crossing-incense",
    ground: "river-crossing",
    title: "Two Incense Sticks",
    prompt:
      "You have two incense sticks. Each burns for exactly 60 minutes, but unevenly. How do you measure exactly 45 minutes?",
  },
];

const encoder = new TextEncoder();

function ndjsonResponse(lines: SenseiLine[], keepOpen = false): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(JSON.stringify(line) + "\n"));
      }
      if (!keepOpen) {
        controller.close();
      }
    },
  });
  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson" },
  });
}

function withFetch(makeResponse: () => Response) {
  return () => {
    const original = globalThis.fetch;
    globalThis.fetch = async () => makeResponse();
    return () => {
      globalThis.fetch = original;
    };
  };
}

const meta = {
  title: "Store/SenseiPanel",
  component: SenseiPanel,
  args: { challenges: CHALLENGES },
} satisfies Meta<typeof SenseiPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const askAQuestion: Story["play"] = async ({ canvas, userEvent }) => {
  await userEvent.type(
    canvas.getByLabelText("Your question"),
    "Where do I even start?",
  );
  await userEvent.click(canvas.getByRole("button", { name: "Ask" }));
};

export const Idle: Story = {};

export const Streaming: Story = {
  beforeEach: withFetch(() =>
    ndjsonResponse(
      [{ type: "text", text: "A stalk that doubles each day... " }],
      true,
    ),
  ),
  play: askAQuestion,
};

export const Done: Story = {
  beforeEach: withFetch(() =>
    ndjsonResponse([
      { type: "text", text: "If it doubles each day, how tall was it " },
      { type: "text", text: "the day before it reached the top?" },
      { type: "done", remaining: 7 },
    ]),
  ),
  play: askAQuestion,
};

export const Error: Story = {
  beforeEach: withFetch(() =>
    ndjsonResponse([
      { type: "error", message: "The Sensei is busy. Try again in a moment." },
    ]),
  ),
  play: askAQuestion,
};

export const LimitReached: Story = {
  beforeEach: withFetch(
    () =>
      new Response(JSON.stringify({ detail: "Daily hint limit reached" }), {
        status: 429,
        headers: { "Retry-After": "14400" },
      }),
  ),
  play: askAQuestion,
};
