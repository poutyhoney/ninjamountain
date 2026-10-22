import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Challenge, SenseiLine } from "@/lib/sensei-types";

import SenseiPanel from "./SenseiPanel";

const CHALLENGES: Challenge[] = [
  {
    id: "bamboo-grove-growth",
    ground: "bamboo-grove",
    title: "The Doubling Stalk",
    prompt: "A bamboo stalk doubles in height every day.",
  },
  {
    id: "river-crossing-incense",
    ground: "river-crossing",
    title: "Two Incense Sticks",
    prompt: "Measure 45 minutes with two incense sticks.",
  },
];

const encoder = new TextEncoder();

function fakeStream() {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(streamController) {
      controller = streamController;
    },
  });

  return {
    body,
    async send(line: SenseiLine) {
      await act(async () => {
        controller.enqueue(encoder.encode(JSON.stringify(line) + "\n"));
      });
    },
    async close() {
      await act(async () => {
        controller.close();
      });
    },
    abort() {
      controller.error(new DOMException("Aborted", "AbortError"));
    },
  };
}

type FakeStream = ReturnType<typeof fakeStream>;

function mockFetch(...responses: Array<FakeStream | Response>) {
  const fetchMock = vi.fn();
  for (const item of responses) {
    fetchMock.mockImplementationOnce((_url: string, init: RequestInit) => {
      if (item instanceof Response) {
        return Promise.resolve(item);
      }
      init.signal?.addEventListener("abort", () => item.abort());
      return Promise.resolve(
        new Response(item.body, {
          headers: { "Content-Type": "application/x-ndjson" },
        }),
      );
    });
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function askQuestion(question = "Where do I start?") {
  const user = userEvent.setup();
  render(<SenseiPanel challenges={CHALLENGES} />);
  await user.type(screen.getByLabelText("Your question"), question);
  await user.click(screen.getByRole("button", { name: "Ask" }));
  return user;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SenseiPanel", () => {
  it("shows the first challenge's prompt", () => {
    render(<SenseiPanel challenges={CHALLENGES} />);
    expect(screen.getByText(CHALLENGES[0].prompt)).toBeInTheDocument();
  });

  it("streams a hint and shows hints left", async () => {
    const stream = fakeStream();
    const fetchMock = mockFetch(stream);
    await askQuestion();

    await stream.send({ type: "text", text: "Think about " });
    expect(await screen.findByText("Think about")).toBeInTheDocument();
    await stream.send({ type: "text", text: "yesterday." });
    await stream.send({ type: "done", remaining: 7 });
    await stream.close();

    expect(
      await screen.findByText("Think about yesterday."),
    ).toBeInTheDocument();
    expect(screen.getByText("7 hints left today")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ask" })).toBeInTheDocument();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      challenge_id: "bamboo-grove-growth",
      question: "Where do I start?",
    });
  });

  it("stops the stream with Stop and sends only one request", async () => {
    const stream = fakeStream();
    const fetchMock = mockFetch(stream);
    const user = await askQuestion();

    await stream.send({ type: "text", text: "Think " });
    const stop = await screen.findByRole("button", { name: "Stop" });
    expect(stop).toHaveFocus();
    await user.click(stop);

    expect(await screen.findByText("Stopped.")).toBeInTheDocument();
    expect(screen.getByText("Think")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Your question")).toHaveFocus();
  });

  it("shows an error line with Retry, and Retry asks again", async () => {
    const first = fakeStream();
    const second = fakeStream();
    const fetchMock = mockFetch(first, second);
    const user = await askQuestion();

    await first.send({
      type: "error",
      message: "The Sensei is busy. Try again in a moment.",
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The Sensei is busy",
    );

    await user.click(screen.getByRole("button", { name: "Retry" }));
    await second.send({ type: "text", text: "Look back one day." });
    await second.send({ type: "done", remaining: 8 });
    await second.close();

    expect(await screen.findByText("Look back one day.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].body).toBe(
      fetchMock.mock.calls[0][1].body,
    );
  });

  it("treats a stream with no done line as cut off", async () => {
    const stream = fakeStream();
    mockFetch(stream);
    await askQuestion();

    await stream.send({ type: "text", text: "Think " });
    await stream.close();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The answer was cut off",
    );
  });

  it("shows the limit message on a 429", async () => {
    mockFetch(
      new Response(JSON.stringify({ detail: "Daily hint limit reached" }), {
        status: 429,
        headers: { "Retry-After": "7200" },
      }),
    );
    await askQuestion();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "More in 2 hours",
    );
    expect(screen.getByRole("button", { name: "Ask" })).toBeDisabled();
  });

  it("shows the API's message for a locked ground", async () => {
    mockFetch(
      Response.json(
        { detail: "Upgrade your belt to unlock this training ground" },
        { status: 403 },
      ),
    );
    await askQuestion();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Upgrade your belt",
    );
  });
});
