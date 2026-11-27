import type { Finding, Rule } from "../findings";
import type { StudioFlow } from "../snapshot";

export const addressFlowMissing: Rule = {
  id: "R3",
  title: "Address points at a Studio flow that is missing or unpublished",
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
    const findings: Finding[] = [];

    for (const address of snapshot.addresses.data) {
      const { enabled, type, studioFlowSid } = address.autoCreation;
      if (!enabled || type !== "studio") continue;

      const problem = describeProblem(
        studioFlowSid,
        studioFlowSid ? flows.get(studioFlowSid) : undefined,
      );
      if (!problem) continue;

      findings.push({
        ruleId: "R3",
        severity: "critical",
        title: `Address "${address.friendlyName ?? address.address}" ${problem}`,
        resourceSid: address.sid,
        detail:
          "Inbound messages to this address start a Conversation, but no published flow runs, so no task reaches Flex.",
        fix: `Publish the flow in the Console, or point the Address at a published flow: twilio api:conversations:v1:configuration:addresses:update --sid ${address.sid} --auto-creation.studio-flow-sid FW...`,
      });
    }

    return { status: "ran", findings };
  },
};

function describeProblem(
  studioFlowSid: string | null,
  flow: StudioFlow | undefined,
): string | null {
  if (!studioFlowSid)
    return "has Studio auto-creation turned on but no flow set";
  if (!flow)
    return `points at Studio flow ${studioFlowSid}, which no longer exists`;
  if (flow.status === "draft")
    return `points at Studio flow "${flow.friendlyName}", which is still a draft`;
  return null;
}
