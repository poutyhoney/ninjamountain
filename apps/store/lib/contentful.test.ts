import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getTierOffers } from "./contentful";

beforeEach(() => {
  vi.stubEnv("CONTENTFUL_SPACE_ID", "space-123");
  vi.stubEnv("CONTENTFUL_ACCESS_TOKEN", "token-abc");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getTierOffers", () => {
  it("maps Contentful entries to offers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        total: 1,
        items: [
          {
            sys: { id: "entry-1" },
            fields: {
              name: "White Belt",
              slug: "white-belt",
              kind: "tier",
              priceCents: 0,
              billingPeriod: "month",
            },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const offers = await getTierOffers();

    expect(offers).toEqual([
      { id: "white-belt", name: "White Belt", priceCents: 0, billingPeriod: "month", perks: [] },
    ]);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/spaces/space-123/");
    expect(options.headers.Authorization).toBe("Bearer token-abc");
  });

  it("throws when the env vars are missing", async () => {
    vi.stubEnv("CONTENTFUL_ACCESS_TOKEN", "");

    await expect(getTierOffers()).rejects.toThrow("must be set");
  });

  it("throws when Contentful responds with an error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 401 })));

    await expect(getTierOffers()).rejects.toThrow("Contentful returned 401.");
  });
});