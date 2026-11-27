import { describe, expect, it } from "vitest";
import { majorVersion, readUiVersion, withFlexUi } from "../src/flex-version";
import { runRules } from "../src/rules";
import { loadFixture } from "./helpers";

describe("majorVersion", () => {
  it.each([
    ["2.18.0", 2],
    ["~2.18.0", 2],
    ["1.34.2", 1],
    ["not a version", null],
    [null, null],
  ] as const)("%s gives %s", (input, expected) => {
    expect(majorVersion(input)).toBe(expected);
  });
});

describe("withFlexUi", () => {
  it("lets R1 run on a restricted key, while R2 still skips", () => {
    const outcomes = runRules(withFlexUi(loadFixture("restricted-key"), "2"));
    const status = Object.fromEntries(
      outcomes.map((o) => [o.ruleId, o.result.status]),
    );
    expect(status.R1).toBe("ran");
    expect(status.R2).toBe("skipped");
  });

  it("keeps the real version when the key could read it", () => {
    expect(readUiVersion(withFlexUi(loadFixture("healthy-2x"), "1"))).toBe(
      "2.18.0",
    );
  });

  it("does not change the snapshot it was given", () => {
    const original = loadFixture("restricted-key");
    withFlexUi(original, "2");
    expect(original.flexConfiguration.available).toBe(false);
  });
});
