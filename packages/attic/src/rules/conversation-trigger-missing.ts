// R4 (critical): a published Studio flow used by an Address has nothing
// connected to the Trigger's Incoming Conversation output.
//
// A Conversations Address starts the flow through incomingConversationMessage.
// Flows built for Flex UI 1.x only wire incomingMessage, so the flow starts,
// runs no widgets, and never creates a task. This was the real root cause of
// "texts arrive but no task" on the account this tool was built against.
// Reads addresses and studioFlows, including each flow's definition
// (states). R3 covers missing and draft flows, so this rule only looks at
// published ones.
import type { Finding, Rule } from "../findings";
import type { StudioState } from "../snapshot";

export const conversationTriggerMissing: Rule = {
  id: "R4",
  title: "Address flow has no Incoming Conversation transition",
  run(snapshot) {
    if (!snapshot.addresses.available) {
      return { status: "skipped", reason: snapshot.addresses.reason };
    }
    if (!snapshot.studioFlows.available) {
      return { status: "skipped", reason: snapshot.studioFlows.reason };
    }

    const flows = new Map(
      snapshot.studioFlows.data.map((flow) => [flow.sid, flow] as const),
    );

    // Groups Addresses by the flow they use, so a flow shared by several
    // Addresses gives one finding that names them all, not one per Address.
    const addressesByFlow = new Map<string, string[]>();
    for (const address of snapshot.addresses.data) {
      const { enabled, type, studioFlowSid } = address.autoCreation;
      if (!enabled || type !== "studio" || !studioFlowSid) continue;
      // Get the list so far, or start a new one. ?? only falls back on
      // undefined or null, which is what Map.get returns for a missing key.
      const labels = addressesByFlow.get(studioFlowSid) ?? [];
      labels.push(address.friendlyName ?? address.address);
      addressesByFlow.set(studioFlowSid, labels);
    }

    const findings: Finding[] = [];
    // Iterating a Map gives [key, value] pairs, destructured here.
    for (const [flowSid, labels] of addressesByFlow) {
      const flow = flows.get(flowSid);
      // Missing or draft flows are R3's job. Skipping them here avoids two
      // findings about the same Address.
      if (!flow || flow.status !== "published") continue;

      const usedBy = `Used by: ${labels.join(", ")}.`;

      // states is null when the flow definition couldn't be read. Say the
      // check didn't run, as info, rather than guessing either way.
      if (flow.states === null) {
        findings.push({
          ruleId: "R4",
          severity: "info",
          title: `Could not read the definition of Studio flow "${flow.friendlyName}"`,
          resourceSid: flow.sid,
          detail: `${usedBy} The Incoming Conversation check did not run for this flow.`,
          fix: "Rerun with a key that can read Studio flows, or check the Trigger in the Console.",
        });
        continue;
      }

      // Every Studio flow has one Trigger widget. find returns undefined if
      // it's somehow missing, and isWired handles that.
      const trigger = flow.states.find((state) => state.type === "trigger");
      if (isWired(trigger, "incomingConversationMessage")) continue;

      // An extra sentence only when the 1.x wiring is there. It tells the
      // reader why the flow looked fine in the Console.
      const legacy = isWired(trigger, "incomingMessage")
        ? " Only Incoming Message is connected. That is the Flex 1.x wiring, which Conversations never uses."
        : "";

      findings.push({
        ruleId: "R4",
        severity: "critical",
        title: `Studio flow "${flow.friendlyName}" never handles incoming Conversations`,
        resourceSid: flow.sid,
        detail: `${usedBy} The Trigger's Incoming Conversation output is not connected, so the flow starts and ends with no widgets and no task.${legacy}`,
        fix: "In the Console, open the flow, connect the Trigger's Incoming Conversation output to Send to Flex, and publish. There is no safe CLI one-liner, since it means editing the definition JSON.",
      });
    }

    return { status: "ran", findings };
  },
};

// True when the trigger has a transition for this event that leads to a
// widget. A transition with next === null exists in the definition but is
// not connected to anything.
function isWired(trigger: StudioState | undefined, event: string): boolean {
  // trigger?.transitions short-circuits to undefined when there's no
  // trigger, and ?? false turns that into a plain boolean.
  return (
    trigger?.transitions.some(
      (transition) => transition.event === event && transition.next !== null,
    ) ?? false
  );
}
