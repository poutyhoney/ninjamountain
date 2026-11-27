// R2: Flex Flows left on a Flex UI 2.x account.
//
// Flex Flows were how Flex UI 1.x routed a channel into Flex. On 2.x,
// Conversations Addresses do that job, so any Flex Flow is a leftover.
// - critical: a Flex Flow and an Address route the same sender. Two routers
//   for one number means one of them is the wrong path.
// - warning: any other Flex Flow.
// Stays quiet on 1.x, where Flex Flows are correct. Needs a Standard key,
// since Restricted keys can't read Flex Flows (70051) or the Flex
// Configuration (8021). Reads flexConfiguration, flexFlows, and addresses.
import { majorVersion } from "../flex-version";
import type { Finding, Rule } from "../findings";
import type { ConversationsAddress } from "../snapshot";

export const flexFlowsOn2x: Rule = {
  id: "R2",
  title: "Flex Flows on a Flex UI 2.x account",
  run(snapshot) {
    // Destructuring into locals. Narrowing then works on these short names,
    // and TypeScript remembers the narrowing for the rest of the function.
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
    // On 1.x, Flex Flows are the correct setup. "Ran, found nothing" is the
    // right answer, not "skipped".
    if (major < 2) return { status: "ran", findings: [] };

    // Lookup from sender (such as +12025550197) to the Address that owns it.
    // Addresses are optional for this rule: when they're unavailable, the Map
    // is empty and every Flex Flow becomes a warning. The explicit
    // <string, ConversationsAddress> generic gives the empty-array branch of
    // the ternary a type to match.
    const addressBySender = new Map<string, ConversationsAddress>(
      addresses.available
        ? addresses.data.map((a) => [a.address, a] as const)
        : [],
    );
    const unchecked = addresses.available
      ? ""
      : ` Could not check for a matching Conversations Address: ${addresses.reason}`;

    // map with a `(flow): Finding` return annotation, so each returned object
    // is checked against Finding and "critical" / "warning" stay typed as
    // Severity.
    const findings = flexFlows.data.map((flow): Finding => {
      const remove = `twilio api:flex:v1:flex-flows:remove --sid ${flow.sid}`;
      // The ternary narrows contactIdentity from string | null to string
      // before the lookup. Map.get(null) wouldn't typecheck.
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
        // List first, then remove, so the reader sees the current state
        // before deleting anything.
        fix: `Check nothing still uses it (twilio api:flex:v1:flex-flows:list), then remove it: ${remove}`,
      };
    });

    return { status: "ran", findings };
  },
};
