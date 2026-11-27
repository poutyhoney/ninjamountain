// The first test in the package. Checks Vitest runs and Node is 22 or newer,
// since the code uses Node 22 built-ins such as process.loadEnvFile.
import { describe, expect, it } from "vitest";

describe("environment", () => {
  it("runs on Node 22 or newer", () => {
    const major = Number(process.versions.node.split(".")[0]);
    expect(major).toBeGreaterThanOrEqual(22);
  });
});
