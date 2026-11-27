import { describe, expect, it } from "vitest";
import { ngrokTwimlApps } from "../../src/rules/ngrok-twiml-apps";
import { loadFixture } from "../helpers";

describe("R7 ngrok TwiML Apps", () => {
  it("stays quiet on a healthy account", () => {
    expect(ngrokTwimlApps.run(loadFixture("healthy-2x"))).toEqual({
      status: "ran",
      findings: [],
    });
  });

  it("fires once on the legacy mess", () => {
    const result = ngrokTwimlApps.run(loadFixture("legacy-mess"));
    if (result.status !== "ran")
      throw new Error(`expected ran, got ${result.status}`);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      ruleId: "R7",
      severity: "warning",
      resourceSid: "AP00000000000000000000000000000099",
    });
  });

  it("skips when TwiML Apps were unavailable", () => {
    const snapshot = loadFixture("healthy-2x");
    snapshot.twimlApps = { available: false, reason: "401 code 8021: test" };
    expect(ngrokTwimlApps.run(snapshot)).toEqual({
      status: "skipped",
      reason: "401 code 8021: test",
    });
  });
});
