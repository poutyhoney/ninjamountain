// R1: phone numbers still tied to Proxy on a Flex UI 2.x account.
//
// On Flex UI 1.x, SMS for Flex went through Proxy. On 2.x it goes through
// Conversations Addresses. A number whose SMS URL still points at Proxy sends
// inbound texts down the old path instead of to its Address.
// - critical: the SMS URL points at Proxy.
// - warning: the URL is clear, but the number is still in a Proxy pool.
//   Texts work today, but it's leftover config.
// Removing a number from a Proxy pool doesn't change its SMS URL, so the rule
// checks both on their own. Reads flexConfiguration (or --flex-ui),
// phoneNumbers, and proxyServices.
import { majorVersion } from "../flex-version";
import type { Finding, Rule } from "../findings";
import type { ProxyService } from "../snapshot";

// Proxy's inbound webhook has the form
// https://webhooks.twilio.com/v1/Accounts/AC.../Proxy/KS.../Webhooks/Message.
// Matching the /Proxy/KS part with a full 32-character SID avoids false
// matches on unrelated URLs that just contain "Proxy".
const PROXY_SMS_URL = /\/Proxy\/KS[0-9a-f]{32}/;

export const smsUrlProxy: Rule = {
  id: "R1",
  title: "SMS URL points at Proxy on a Flex UI 2.x account",
  run(snapshot) {
    const { flexConfiguration, phoneNumbers, proxyServices } = snapshot;
    // A Restricted key can never read the Flex Configuration, so the skip
    // reason tells the reader how to run this rule anyway. cli.ts applies
    // --flex-ui by filling in flexConfiguration before the rules run (see
    // withFlexUi), so this rule never needs to know about the flag.
    if (!flexConfiguration.available) {
      return {
        status: "skipped",
        reason: `${flexConfiguration.reason}. Pass --flex-ui 2 to run R1 anyway.`,
      };
    }
    if (!phoneNumbers.available) {
      return { status: "skipped", reason: phoneNumbers.reason };
    }

    const { uiVersion } = flexConfiguration.data;
    const major = majorVersion(uiVersion);
    if (major === null) {
      return {
        status: "skipped",
        reason: `Could not read a Flex UI version from "${uiVersion ?? "missing"}"`,
      };
    }
    // Proxy is the correct setup on 1.x.
    if (major < 2) return { status: "ran", findings: [] };

    // Proxy pools are optional for this rule. Without them it still checks
    // SMS URLs and says the pool check didn't run.
    const pools: ProxyService[] = proxyServices.available
      ? proxyServices.data
      : [];
    const unchecked = proxyServices.available
      ? ""
      : ` Could not check Proxy pools: ${proxyServices.reason}`;

    const findings: Finding[] = [];
    for (const number of phoneNumbers.data) {
      // Two independent checks per number: the URL and the pool.
      const proxyUrl =
        number.smsUrl !== null && PROXY_SMS_URL.test(number.smsUrl);
      const pool = pools.find((service) =>
        service.phoneNumberSids.includes(number.sid),
      );
      // Built once, used by either finding below.
      const leavePool = pool
        ? `twilio api:proxy:v1:services:phone-numbers:remove --service-sid ${pool.sid} --sid ${number.sid}`
        : "";

      if (proxyUrl) {
        findings.push({
          ruleId: "R1",
          severity: "critical",
          title: `${number.phoneNumber} sends inbound SMS to Proxy`,
          resourceSid: number.sid,
          detail: `Its SMS URL is ${number.smsUrl}. On Flex UI 2.x, messaging runs through Conversations Addresses, so texts to this number take the 1.x path instead.${unchecked}`,
          // Order matters: clear the URL first so texts start reaching the
          // Address, then tidy up the pool. Leaving the pool alone would not
          // fix the routing.
          fix:
            `Clear the SMS URL so the Conversations Address takes over: twilio api:core:incoming-phone-numbers:update --sid ${number.sid} --sms-url ""` +
            (pool
              ? `. Then take it out of the "${pool.uniqueName}" pool: ${leavePool}`
              : ""),
        });
        // `else if (pool)`, not plain `else`: TypeScript can't work out that
        // pool must be set here, so the explicit check is what lets
        // pool.uniqueName typecheck.
      } else if (pool) {
        findings.push({
          ruleId: "R1",
          severity: "warning",
          title: `${number.phoneNumber} is still in the Proxy pool "${pool.uniqueName}"`,
          resourceSid: number.sid,
          detail:
            "Its SMS URL no longer points at Proxy, so inbound texts work today. The pool membership is leftover Flex 1.x config.",
          fix: `Take it out of the pool: ${leavePool}`,
        });
      }
    }

    return { status: "ran", findings };
  },
};
