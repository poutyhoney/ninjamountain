import type { Finding, Rule } from "../findings";

const NGROK = /ngrok(-free)?\.(io|app|dev)/i;

export const ngrokTwimlApps: Rule = {
  id: "R7",
  title: "TwiML Apps with ngrok URLs",
  run(snapshot) {
    if (!snapshot.twimlApps.available) {
      return { status: "skipped", reason: snapshot.twimlApps.reason };
    }

    const findings: Finding[] = [];
    for (const app of snapshot.twimlApps.data) {
      const urls = [app.voiceUrl, app.smsUrl, app.statusCallback].filter(
        (url): url is string => url !== null && NGROK.test(url),
      );
      if (urls.length === 0) continue;

      findings.push({
        ruleId: "R7",
        severity: "warning",
        title: `TwiML App "${app.friendlyName}" points at an ngrok tunnel`,
        resourceSid: app.sid,
        detail: `Tunnel URLs stop working when the laptop running ngrok closes: ${urls.join(", ")}`,
        fix: `Point the URLs at a real host, or remove the app if nothing uses it: twilio api:core:applications:remove --sid ${app.sid}`,
      });
    }

    return { status: "ran", findings };
  },
};
