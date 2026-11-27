import { describe, expect, it } from "vitest";
import {
  isSeverity,
  meetsThreshold,
  summarize,
} from "../../src/report/summary";
import { runRules } from "../../src/rules";
import { loadFixture } from "../helpers";

function findingsFor(name: string) {
  return summarize(runRules(loadFixture(name))).findings;
}

describe("meetsThreshold", () => {
  it.each([
    ["critical", "legacy-mess", true],
    ["critical", "healthy-2x", false],
    ["info", "legacy-mess", true],
  ] as const)("--fail-on %s on %s gives %s", (threshold, fixture, expected) => {
    expect(meetsThreshold(findingsFor(fixture), threshold)).toBe(expected);
  });

  it("ignores levels below the threshold", () => {
    const infoOnly = findingsFor("legacy-mess").filter(
      (f) => f.severity === "info",
    );
    expect(meetsThreshold(infoOnly, "warning")).toBe(false);
    expect(meetsThreshold(infoOnly, "info")).toBe(true);
  });
});

describe("isSeverity", () => {
  it("accepts the three levels and nothing else", () => {
    expect(["critical", "warning", "info", "high"].map(isSeverity)).toEqual([
      true,
      true,
      true,
      false,
    ]);
  });
});
