import { describe, expect, it } from "vitest";
import { draftStudioFlows } from "../../src/rules/draft-studio-flows";
import { loadFixture } from "../helpers";

const DRAFT_SID = "FW00000000000000000000000000000099";

describe("R10 draft-only Studio flows", () => {
  it("stays quiet on a healthy account", () => {
    expect(draftStudioFlows.run(loadFixture("healthy-2x"))).toEqual({
      status: "ran",
      findings: [],
    });
  });

  it("fires once on the legacy mess", () => {
    const result = draftStudioFlows.run(loadFixture("legacy-mess"));
    if (result.status !== "ran")
      throw new Error(`expected ran, got ${result.status}`);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      ruleId: "R10",
      severity: "info",
      resourceSid: DRAFT_SID,
    });
  });

  it("stays quiet when a number's webhook points at the draft", () => {
    const snapshot = loadFixture("legacy-mess");
    if (!snapshot.phoneNumbers.available)
      throw new Error("fixture should have phone numbers");
    snapshot.phoneNumbers.data.push({
      sid: "PN00000000000000000000000000000099",
      phoneNumber: "+12025550199",
      friendlyName: "Test number",
      smsUrl: `https://webhooks.twilio.com/v1/Accounts/${snapshot.accountSid}/Flows/${DRAFT_SID}`,
      smsApplicationSid: null,
      voiceUrl: null,
    });
    expect(draftStudioFlows.run(snapshot)).toEqual({
      status: "ran",
      findings: [],
    });
  });

  it("says which references it could not check", () => {
    const snapshot = loadFixture("legacy-mess");
    snapshot.flexFlows = { available: false, reason: "401 code 70051: test" };
    const result = draftStudioFlows.run(snapshot);
    if (result.status !== "ran")
      throw new Error(`expected ran, got ${result.status}`);
    expect(result.findings[0]?.detail).toContain(
      "Could not check references from: flexFlows",
    );
  });

  it("skips when Studio flows were unavailable", () => {
    const snapshot = loadFixture("healthy-2x");
    snapshot.studioFlows = { available: false, reason: "401 code 8021: test" };
    expect(draftStudioFlows.run(snapshot)).toEqual({
      status: "skipped",
      reason: "401 code 8021: test",
    });
  });
});
