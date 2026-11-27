import { describe, expect, it } from "vitest";
import { conversationTriggerMissing } from "../../src/rules/conversation-trigger-missing";
import type { Snapshot } from "../../src/snapshot";
import { loadFixture } from "../helpers";

const FLOW_SID = "FW00000000000000000000000000000097";

function legacyFlow(snapshot: Snapshot) {
  if (!snapshot.studioFlows.available)
    throw new Error("fixture should have Studio flows");
  const flow = snapshot.studioFlows.data.find(
    (candidate) => candidate.sid === FLOW_SID,
  );
  if (!flow) throw new Error("fixture should have the legacy flow");
  return flow;
}

describe("R4 no Incoming Conversation transition", () => {
  it("stays quiet on a healthy account", () => {
    expect(conversationTriggerMissing.run(loadFixture("healthy-2x"))).toEqual({
      status: "ran",
      findings: [],
    });
  });

  it("fires once on the legacy mess and names the 1.x wiring", () => {
    const result = conversationTriggerMissing.run(loadFixture("legacy-mess"));
    if (result.status !== "ran")
      throw new Error(`expected ran, got ${result.status}`);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      ruleId: "R4",
      severity: "critical",
      resourceSid: FLOW_SID,
    });
    expect(result.findings[0]?.detail).toContain("Legacy SMS");
    expect(result.findings[0]?.detail).toContain("Flex 1.x wiring");
  });

  it("stays quiet once Incoming Conversation is connected", () => {
    const snapshot = loadFixture("legacy-mess");
    const trigger = legacyFlow(snapshot).states?.find(
      (state) => state.type === "trigger",
    );
    const transition = trigger?.transitions.find(
      (candidate) => candidate.event === "incomingConversationMessage",
    );
    if (!transition) throw new Error("fixture should have the transition");
    transition.next = "send_to_flex_1";
    expect(conversationTriggerMissing.run(snapshot)).toEqual({
      status: "ran",
      findings: [],
    });
  });

  it("reports a shared flow once and lists every Address", () => {
    const snapshot = loadFixture("legacy-mess");
    if (!snapshot.addresses.available)
      throw new Error("fixture should have addresses");
    snapshot.addresses.data.push({
      sid: "IG00000000000000000000000000000097",
      friendlyName: "Second legacy SMS",
      type: "sms",
      address: "+12025550196",
      autoCreation: { enabled: true, type: "studio", studioFlowSid: FLOW_SID },
    });
    const result = conversationTriggerMissing.run(snapshot);
    if (result.status !== "ran")
      throw new Error(`expected ran, got ${result.status}`);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.detail).toContain(
      "Legacy SMS, Second legacy SMS",
    );
  });

  it("reports info when the definition could not be read", () => {
    const snapshot = loadFixture("legacy-mess");
    legacyFlow(snapshot).states = null;
    const result = conversationTriggerMissing.run(snapshot);
    if (result.status !== "ran")
      throw new Error(`expected ran, got ${result.status}`);
    expect(result.findings[0]).toMatchObject({
      severity: "info",
      resourceSid: FLOW_SID,
    });
  });

  it("skips when Addresses were unavailable", () => {
    const snapshot = loadFixture("legacy-mess");
    snapshot.addresses = { available: false, reason: "401 code 8021: test" };
    expect(conversationTriggerMissing.run(snapshot)).toEqual({
      status: "skipped",
      reason: "401 code 8021: test",
    });
  });
});
