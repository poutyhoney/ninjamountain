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
});
