import { describe, expect, it } from "vitest";
import { majorVersion } from "../src/flex-version";

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
