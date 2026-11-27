import { describe, expect, it } from "vitest";
import type { RuleResult } from "../src/findings";
import { rules } from "../src/rules";
import { loadFixture } from "./helpers";

type Outcome = number | "skipped";

const expected: Record<string, Record<string, Outcome>> = {
  "healthy-2x": { R1: 0, R2: 0, R3: 0, R4: 0, R7: 0, R10: 0 },
  "legacy-mess": { R1: 2, R2: 2, R3: 1, R4: 1, R7: 1, R10: 1 },
  "flex-1x": { R1: 0, R2: 0, R3: 1, R4: 1, R7: 1, R10: 1 },
  "restricted-key": {
    R1: "skipped",
    R2: "skipped",
    R3: 1,
    R4: 1,
    R7: 1,
    R10: 1,
  },
};

function outcome(result: RuleResult): Outcome {
  return result.status === "ran" ? result.findings.length : "skipped";
}

describe("every rule on every fixture", () => {
  it.each(Object.entries(expected))("%s", (name, counts) => {
    const snapshot = loadFixture(name);
    const actual = Object.fromEntries(
      rules.map((rule) => [rule.id, outcome(rule.run(snapshot))]),
    );
    expect(actual).toEqual(counts);
  });
});
