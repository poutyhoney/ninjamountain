// R3 (critical): a Conversations Address hands new Conversations to a Studio
// flow that is missing, deleted, or still a draft.
//
// When that happens, an inbound message starts a Conversation, no published
// flow runs, and no task ever reaches Flex. Nothing errors, so it's easy to
// miss. Reads addresses and studioFlows from the snapshot. Listed in
// rules/index.ts. R10 (draft-studio-flows.ts) treats a draft that an Address
// points at as "in use", so the two rules never report the same draft twice.
import type { Finding, Rule } from "../findings";
import type { StudioFlow } from "../snapshot";

// An object that satisfies the Rule interface. The `: Rule` annotation lets
// TypeScript infer run()'s parameter and return types (contextual typing), so
// they don't have to be written out.
export const addressFlowMissing: Rule = {
  id: "R3",
  title: "Address points at a Studio flow that is missing or unpublished",
  run(snapshot) {
    // Guard clauses: without both sections, the rule can't give a real
    // answer, so it reports why instead of returning an empty list.
    if (!snapshot.addresses.available) {
      return { status: "skipped", reason: snapshot.addresses.reason };
    }
    if (!snapshot.studioFlows.available) {
      return { status: "skipped", reason: snapshot.studioFlows.reason };
    }

    // A lookup table from flow SID to flow. `as const` makes each pair a
    // fixed two-item tuple, which is the shape the Map constructor needs
    // (otherwise it's typed as a plain array of mixed values).
    const flows = new Map(
      snapshot.studioFlows.data.map((flow) => [flow.sid, flow] as const),
    );
    const findings: Finding[] = [];

    for (const address of snapshot.addresses.data) {
      // Destructuring pulls three fields out of the nested object at once.
      const { enabled, type, studioFlowSid } = address.autoCreation;
      // Only Addresses that actually hand off to Studio can have this
      // problem. Webhook auto-creation or auto-creation turned off is a
      // different setup.
      if (!enabled || type !== "studio") continue;

      // Map.get needs a string, so the lookup only runs when a SID is set.
      // Passing both values lets describeProblem tell "no SID" apart from
      // "SID set, but no such flow".
      const problem = describeProblem(
        studioFlowSid,
        studioFlowSid ? flows.get(studioFlowSid) : undefined,
      );
      if (!problem) continue;

      findings.push({
        ruleId: "R3",
        severity: "critical",
        // ?? falls back to the address itself (the number) when the Address
        // has no friendly name.
        title: `Address "${address.friendlyName ?? address.address}" ${problem}`,
        resourceSid: address.sid,
        detail:
          "Inbound messages to this address start a Conversation, but no published flow runs, so no task reaches Flex.",
        // FW... is left for the reader to fill in, since only they know
        // which published flow is the right one.
        fix: `Publish the flow in the Console, or point the Address at a published flow: twilio api:conversations:v1:configuration:addresses:update --sid ${address.sid} --auto-creation.studio-flow-sid FW...`,
      });
    }

    return { status: "ran", findings };
  },
};

// Returns the end of the finding title, or null when the flow is fine. Kept
// as its own function so the three cases read top to bottom, each as an early
// return.
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
