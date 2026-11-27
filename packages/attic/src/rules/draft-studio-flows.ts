// R10 (info): Studio flows that were never published and that nothing points
// at.
//
// Usually abandoned experiments or "Copy of ..." flows. Harmless, but clutter
// that makes the real flows harder to find. A draft that something DOES point
// at is a real break, and R3 reports that one instead. Reads studioFlows, and
// looks for references in addresses, flexFlows, and phone number webhooks.
import type { Finding, Rule } from "../findings";
import type { Snapshot } from "../snapshot";

// A Studio flow SID inside a URL. Numbers point at Studio through a webhook
// such as https://webhooks.twilio.com/v1/Accounts/AC.../Flows/FW...
const FLOW_SID = /FW[0-9a-f]{32}/;

export const draftStudioFlows: Rule = {
  id: "R10",
  title: "Studio flows that are drafts only",
  run(snapshot) {
    if (!snapshot.studioFlows.available) {
      return { status: "skipped", reason: snapshot.studioFlows.reason };
    }

    // Destructuring the returned object into two local names.
    const { referenced, unchecked } = flowReferences(snapshot);
    // The rule still runs when some sections are missing, but it says which
    // ones it couldn't check. "Nothing points at it" is less certain then,
    // and the reader should know.
    const note =
      unchecked.length > 0
        ? ` Could not check references from: ${unchecked.join(", ")}.`
        : "";

    // A filter-then-map chain. The `(flow): Finding =>` return annotation
    // keeps severity typed as the Severity union. Without it, TypeScript
    // widens "info" to plain string (literal widening) and the result no
    // longer fits Finding.
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

// Collects every flow SID that something in the account points at. Returns
// two things in one object: the SIDs found, and the names of sections that
// couldn't be read.
function flowReferences(snapshot: Snapshot): {
  referenced: Set<string>;
  unchecked: string[];
} {
  // A Set ignores duplicates and gives a quick has() check.
  const referenced = new Set<string>();
  const unchecked: string[] = [];

  // Conversations Addresses (Flex UI 2.x routing).
  if (snapshot.addresses.available) {
    for (const address of snapshot.addresses.data) {
      if (address.autoCreation.studioFlowSid)
        referenced.add(address.autoCreation.studioFlowSid);
    }
  } else {
    unchecked.push("addresses");
  }

  // Legacy Flex Flows (Flex UI 1.x routing).
  if (snapshot.flexFlows.available) {
    for (const flexFlow of snapshot.flexFlows.data) {
      if (flexFlow.studioFlowSid) referenced.add(flexFlow.studioFlowSid);
    }
  } else {
    unchecked.push("flexFlows");
  }

  // Phone number webhooks, for voice and SMS.
  if (snapshot.phoneNumbers.available) {
    for (const number of snapshot.phoneNumbers.data) {
      for (const url of [number.voiceUrl, number.smsUrl]) {
        // url?.match: optional chaining skips null URLs. match[0] is the
        // whole matched text, the FW SID.
        const match = url?.match(FLOW_SID);
        if (match) referenced.add(match[0]);
      }
    }
  } else {
    unchecked.push("phoneNumbers");
  }

  return { referenced, unchecked };
}
