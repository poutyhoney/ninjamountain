// R3 tests. Each case loads a fixture and changes one field to set up the
// situation, including how R3 and R10 split the work on draft flows.
import { describe, expect, it } from "vitest";
import { addressFlowMissing } from "../../src/rules/address-flow-missing";
import { draftStudioFlows } from "../../src/rules/draft-studio-flows";
import type { Snapshot } from "../../src/snapshot";
import { loadFixture } from "../helpers";

const ADDRESS_SID = "IG00000000000000000000000000000099";
const DRAFT_SID = "FW00000000000000000000000000000099";

function leftoverAddress(snapshot: Snapshot) {
  if (!snapshot.addresses.available)
    throw new Error("fixture should have addresses");
  const address = snapshot.addresses.data.find(
    (candidate) => candidate.sid === ADDRESS_SID,
  );
  if (!address) throw new Error("fixture should have the leftover address");
  return address;
}

describe("R3 Address flow missing or unpublished", () => {
  it("stays quiet on a healthy account", () => {
    expect(addressFlowMissing.run(loadFixture("healthy-2x"))).toEqual({
      status: "ran",
      findings: [],
    });
  });

  it("fires once on the legacy mess, for a deleted flow", () => {
    const result = addressFlowMissing.run(loadFixture("legacy-mess"));
    if (result.status !== "ran")
      throw new Error(`expected ran, got ${result.status}`);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      ruleId: "R3",
      severity: "critical",
      resourceSid: ADDRESS_SID,
    });
    expect(result.findings[0]?.title).toContain("no longer exists");
  });

  it("flags a draft flow, and R10 then leaves that draft alone", () => {
    const snapshot = loadFixture("legacy-mess");
    leftoverAddress(snapshot).autoCreation.studioFlowSid = DRAFT_SID;

    const r3 = addressFlowMissing.run(snapshot);
    if (r3.status !== "ran") throw new Error(`expected ran, got ${r3.status}`);
    expect(r3.findings[0]?.title).toContain("still a draft");

    expect(draftStudioFlows.run(snapshot)).toEqual({
      status: "ran",
      findings: [],
    });
  });

  it("ignores an Address with auto-creation turned off", () => {
    const snapshot = loadFixture("legacy-mess");
    leftoverAddress(snapshot).autoCreation.enabled = false;
    expect(addressFlowMissing.run(snapshot)).toEqual({
      status: "ran",
      findings: [],
    });
  });

  it("skips when Studio flows were unavailable", () => {
    const snapshot = loadFixture("legacy-mess");
    snapshot.studioFlows = { available: false, reason: "401 code 8021: test" };
    expect(addressFlowMissing.run(snapshot)).toEqual({
      status: "skipped",
      reason: "401 code 8021: test",
    });
  });
});
