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

    const addressesByFlow = new Map<string, string[]>();
    for (const address of snapshot.addresses.data) {
      const { enabled, type, studioFlowSid } = address.autoCreation;
      if (!enabled || type !== "studio" || !studioFlowSid) continue;
      const labels = addressesByFlow.get(studioFlowSid) ?? [];
      labels.push(address.friendlyName ?? address.address);
      addressesByFlow.set(studioFlowSid, labels);
    }

    const findings: Finding[] = [];
    for (const [flowSid, labels] of addressesByFlow) {
      const flow = flows.get(flowSid);
      if (!flow || flow.status !== "published") continue;

      const usedBy = `Used by: ${labels.join(", ")}.`;

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

      const trigger = flow.states.find((state) => state.type === "trigger");
      if (isWired(trigger, "incomingConversationMessage")) continue;

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

function isWired(trigger: StudioState | undefined, event: string): boolean {
  return (
    trigger?.transitions.some(
      (transition) => transition.event === event && transition.next !== null,
    ) ?? false
  );
}
