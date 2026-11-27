// Guard test over every folder in fixtures/. Fails on any SID or phone number
// that isn't in the fake formats, and on duplicate SIDs within a section.
// It reports counts only, so a failure never prints a real value.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const fixturesDir = fileURLToPath(new URL("../fixtures", import.meta.url));

const SID = /\b[A-Z]{2}[0-9a-f]{32}\b/g;
const FAKE_SID = /^[A-Z]{2}0{28}[0-9a-f]{4}$/;
const PHONE = /\+\d{10,15}|\(\d{3}\)\s?\d{3}-\d{4}/g;
const FAKE_PHONE = /555-?01\d{2}$/;

const names = readdirSync(fixturesDir, {
  recursive: true,
  encoding: "utf8",
}).filter((name) => name.endsWith(".json"));

describe("fixtures", () => {
  it("exist", () => {
    expect(names.length).toBeGreaterThan(0);
  });

  it.each(names)("%s has only fake SIDs and numbers", (name) => {
    const text = readFileSync(join(fixturesDir, name), "utf8");
    const realSids = (text.match(SID) ?? []).filter(
      (sid) => !FAKE_SID.test(sid),
    );
    const realNumbers = (text.match(PHONE) ?? []).filter(
      (number) => !FAKE_PHONE.test(number),
    );
    expect(realSids.length, "real-looking SIDs").toBe(0);
    expect(realNumbers.length, "real-looking phone numbers").toBe(0);
  });

  it.each(names)("%s has unique SIDs in each section", (name) => {
    const snapshot = JSON.parse(
      readFileSync(join(fixturesDir, name), "utf8"),
    ) as Record<string, unknown>;
    for (const [section, value] of Object.entries(snapshot)) {
      if (!isAvailableList(value)) continue;
      const sids = value.data.map((item) => item.sid);
      expect(new Set(sids).size, `duplicate SIDs in ${section}`).toBe(
        sids.length,
      );
    }
  });
});

function isAvailableList(
  value: unknown,
): value is { data: Array<{ sid: unknown }> } {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray(value.data)
  );
}
