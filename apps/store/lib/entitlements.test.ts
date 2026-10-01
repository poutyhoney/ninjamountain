import { afterEach, describe, expect, it, vi } from "vitest";

import { getEntitlements } from "./entitlements";

const data = {
  user_id: "demo",
  belt: "brown-belt",
  unlocked_grounds: ["bamboo-grove", "river-crossing", "cliff-steps"],
  owned_addons: ["lantern-gear-pack"],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getEntitlements", () => {
  it("returns the data on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(data));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getEntitlements("http://api.test");

    expect(result).toEqual({ ok: true, data });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/entitlements/me",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("returns an error result when the API responds with an error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("oops", { status: 500 })));

    const result = await getEntitlements("http://api.test");

    expect(result).toEqual({ ok: false, error: "The API returned 500." });
  });

  it("returns an error result when the API cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    const result = await getEntitlements("http://api.test");

    expect(result).toEqual({ ok: false, error: "Could not reach the API." });
  });
});