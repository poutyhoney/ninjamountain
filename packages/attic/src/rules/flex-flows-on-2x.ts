import { majorVersion } from "../flex-version";
import type { Finding, Rule } from "../findings";
import type { ConversationsAddress } from "../snapshot";

export const flexFlowsOn2x: Rule = {
  id: "R2",
  title: "Flex Flows on a Flex UI 2.x account",
  run(snapshot) {
    const { flexConfiguration, flexFlows, addresses } = snapshot;
    if (!flexConfiguration.available) {
      return { status: "skipped", reason: flexConfiguration.reason };
    }
    if (!flexFlows.available) {
      return { status: "skipped", reason: flexFlows.reason };
    }

    const { uiVersion } = flexConfiguration.data;
    const major = majorVersion(uiVersion);
    if (major === null) {
      return {
        status: "skipped",
        reason: `Could not read a Flex UI version from "${uiVersion ?? "missing"}"`,
      };
    }
    if (major < 2) return { status: "ran", findings: [] };

    const addressBySender = new Map<string, ConversationsAddress>(
      addresses.available
        ? addresses.data.map((a) => [a.address, a] as const)
        : [],
    );
    const unchecked = addresses.available
      ? ""
      : ` Could not check for a matching Conversations Address: ${addresses.reason}`;

    const findings = flexFlows.data.map((flow): Finding => {
      const remove = `twilio api:flex:v1:flex-flows:remove --sid ${flow.sid}`;
      const address =
        flow.contactIdentity === null
          ? undefined
          : addressBySender.get(flow.contactIdentity);

      if (address) {
        return {
          ruleId: "R2",
          severity: "critical",
          title: `Flex Flow "${flow.friendlyName}" and Address "${address.friendlyName}" both route ${flow.contactIdentity}`,
          resourceSid: flow.sid,
          detail:
            "The same sender has a legacy Flex Flow and a Conversations Address. Only one of them handles inbound messages, so the other is dead config or the wrong path.",
          fix: `Keep the Address and remove the Flex Flow: ${remove}`,
        };
      }

      return {
        ruleId: "R2",
        severity: "warning",
        title: `Flex Flow "${flow.friendlyName}" is left over on a Flex UI ${major}.x account`,
        resourceSid: flow.sid,
        detail: `Flex UI 2.x routes messaging through Conversations Addresses, not Flex Flows.${unchecked}`,
        fix: `Check nothing still uses it (twilio api:flex:v1:flex-flows:list), then remove it: ${remove}`,
      };
    });

    return { status: "ran", findings };
  },
};
