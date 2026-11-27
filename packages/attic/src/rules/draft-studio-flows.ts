import type { Finding, Rule } from "../findings";
import type { Snapshot } from "../snapshot";

const FLOW_SID = /FW[0-9a-f]{32}/;

export const draftStudioFlows: Rule = {
  id: "R10",
  title: "Studio flows that are drafts only",
  run(snapshot) {
    if (!snapshot.studioFlows.available) {
      return { status: "skipped", reason: snapshot.studioFlows.reason };
    }

    const { referenced, unchecked } = flowReferences(snapshot);
    const note =
      unchecked.length > 0
        ? ` Could not check references from: ${unchecked.join(", ")}.`
        : "";

    const findings = snapshot.studioFlows.data
      .filter((flow) => flow.status === "draft" && !referenced.has(flow.sid))
      .map(
        (flow): Finding => ({
          ruleId: "R10",
          severity: "info",
          title: `Studio flow "${flow.friendlyName}" was never published`,
          resourceSid: flow.sid,
          detail: `Draft-only flow (revision ${flow.revision}) with no number, Address, or Flex Flow pointing at it.${note}`,
          fix: `Remove it if it's an abandoned experiment: twilio api:studio:v2:flows:remove --sid ${flow.sid}`,
        }),
      );

    return { status: "ran", findings };
  },
};

function flowReferences(snapshot: Snapshot): {
  referenced: Set<string>;
  unchecked: string[];
} {
  const referenced = new Set<string>();
  const unchecked: string[] = [];

  if (snapshot.addresses.available) {
    for (const address of snapshot.addresses.data) {
      if (address.autoCreation.studioFlowSid)
        referenced.add(address.autoCreation.studioFlowSid);
    }
  } else {
    unchecked.push("addresses");
  }

  if (snapshot.flexFlows.available) {
    for (const flexFlow of snapshot.flexFlows.data) {
      if (flexFlow.studioFlowSid) referenced.add(flexFlow.studioFlowSid);
    }
  } else {
    unchecked.push("flexFlows");
  }

  if (snapshot.phoneNumbers.available) {
    for (const number of snapshot.phoneNumbers.data) {
      for (const url of [number.voiceUrl, number.smsUrl]) {
        const match = url?.match(FLOW_SID);
        if (match) referenced.add(match[0]);
      }
    }
  } else {
    unchecked.push("phoneNumbers");
  }

  return { referenced, unchecked };
}
