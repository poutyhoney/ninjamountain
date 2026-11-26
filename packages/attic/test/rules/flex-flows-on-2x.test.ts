import { describe, expect, it } from "vitest";
import { flexFlowsOn2x } from "../../src/rules/flex-flows-on-2x";
import { loadFixture } from "../helpers";

describe("R2 Flex Flows on a 2.x account", () => {
  it("stays quiet on a healthy account", () => {
    expect(flexFlowsOn2x.run(loadFixture("healthy-2x"))).toEqual({
      status: "ran",
      findings: [],
    });
  });

  it("flags the overlap as critical and the leftover as a warning", () => {
    const result = flexFlowsOn2x.run(loadFixture("legacy-mess"));
    if (result.status !== "ran")
      throw new Error(`expected ran, got ${result.status}`);
    expect(result.findings).toHaveLength(2);
    expect(result.findings[0]).toMatchObject({
      ruleId: "R2",
      severity: "critical",
      resourceSid: "FO00000000000000000000000000000099",
    });
    expect(result.findings[1]).toMatchObject({
      ruleId: "R2",
      severity: "warning",
      resourceSid: "FO00000000000000000000000000000098",
    });
  });

  it("stays quiet on a 1.x account", () => {
    const snapshot = loadFixture("legacy-mess");
    snapshot.flexConfiguration = {
      available: true,
      data: { uiVersion: "1.34.2" },
    };
    expect(flexFlowsOn2x.run(snapshot)).toEqual({
      status: "ran",
      findings: [],
    });
  });

  it("downgrades to warnings when Addresses were unavailable", () => {
    const snapshot = loadFixture("legacy-mess");
    snapshot.addresses = { available: false, reason: "401 code 8021: test" };
    const result = flexFlowsOn2x.run(snapshot);
    if (result.status !== "ran")
      throw new Error(`expected ran, got ${result.status}`);
    expect(result.findings.map((f) => f.severity)).toEqual([
      "warning",
      "warning",
    ]);
    expect(result.findings[0]?.detail).toContain(
      "Could not check for a matching",
    );
  });

  it("skips when the Flex UI version is unreadable", () => {
    const snapshot = loadFixture("legacy-mess");
    snapshot.flexConfiguration = { available: true, data: { uiVersion: null } };
    expect(flexFlowsOn2x.run(snapshot).status).toBe("skipped");
  });

  it("skips when Flex Flows were unavailable", () => {
    const snapshot = loadFixture("legacy-mess");
    snapshot.flexFlows = { available: false, reason: "401 code 70051: test" };
    expect(flexFlowsOn2x.run(snapshot)).toEqual({
      status: "skipped",
      reason: "401 code 70051: test",
    });
  });
});
