import { majorVersion } from "../flex-version";
import type { Finding, Rule } from "../findings";
import type { ProxyService } from "../snapshot";

const PROXY_SMS_URL = /\/Proxy\/KS[0-9a-f]{32}/;

export const smsUrlProxy: Rule = {
  id: "R1",
  title: "SMS URL points at Proxy on a Flex UI 2.x account",
  run(snapshot) {
    const { flexConfiguration, phoneNumbers, proxyServices } = snapshot;
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
    if (major < 2) return { status: "ran", findings: [] };

    const pools: ProxyService[] = proxyServices.available
      ? proxyServices.data
      : [];
    const unchecked = proxyServices.available
      ? ""
      : ` Could not check Proxy pools: ${proxyServices.reason}`;

    const findings: Finding[] = [];
    for (const number of phoneNumbers.data) {
      const proxyUrl =
        number.smsUrl !== null && PROXY_SMS_URL.test(number.smsUrl);
      const pool = pools.find((service) =>
        service.phoneNumberSids.includes(number.sid),
      );
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
          fix:
            `Clear the SMS URL so the Conversations Address takes over: twilio api:core:incoming-phone-numbers:update --sid ${number.sid} --sms-url ""` +
            (pool
              ? `. Then take it out of the "${pool.uniqueName}" pool: ${leavePool}`
              : ""),
        });
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
