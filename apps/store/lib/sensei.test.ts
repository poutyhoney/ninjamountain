import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { apiHeaders, getChallenges } from "./sensei";

const challenges = [
  {
    id: "bamboo-grove-growth",
    ground: "bamboo-grove",
    title: "The Doubling Stalk",
    prompt: "A bamboo stalk doubles in height every day.",
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("apiHeaders", () => {
  it("is empty when API_TOKEN isn't set", () => {
    vi.stubEnv("API_TOKEN", "");
    expect(apiHeaders()).toEqual({});
  });

  it("sends a bearer token when API_TOKEN is set", () => {
    vi.stubEnv("API_TOKEN", "test-token");
    expect(apiHeaders()).toEqual({ Authorization: "Bearer test-token" });
  });
});

describe("getChallenges", () => {
  it("returns the challenges on success", async () => {
    vi.stubEnv("API_TOKEN", "test-token");
    const fetchMock = vi.fn().mockResolvedValue(Response.json(challenges));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getChallenges("http://api.test");

    expect(result).toEqual({ ok: true, data: challenges });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/sensei/challenges",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" },
      }),
    );
  });

  it("returns an error result when the API responds with an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("oops", { status: 401 })),
    );

    expect(await getChallenges("http://api.test")).toEqual({
      ok: false,
      error: "The API returned 401.",
    });
  });

  it("returns an error result when the API cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed")),
    );

    expect(await getChallenges("http://api.test")).toEqual({
      ok: false,
      error: "Could not reach the API.",
    });
  });
});
