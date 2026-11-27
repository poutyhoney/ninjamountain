// R7 (warning): TwiML Apps whose URLs point at an ngrok tunnel.
//
// ngrok URLs are for local development. They stop answering when the laptop
// running ngrok closes, so any app still pointing at one is either broken or
// an old quickstart left behind. The simplest rule, and the template the
// others follow: guard clause, loop, push a Finding. Reads twimlApps.
import type { Finding, Rule } from "../findings";

// Matches ngrok.io, ngrok.app, ngrok.dev, and the free-tier ngrok-free.app.
// (-free)? makes that part optional. The i flag ignores case.
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
      // The filter callback is a type predicate (`url is string`). It drops
      // nulls and non-ngrok URLs, and TypeScript then types the result as
      // string[], not (string | null)[].
      const urls = [app.voiceUrl, app.smsUrl, app.statusCallback].filter(
        (url): url is string => url !== null && NGROK.test(url),
      );
      if (urls.length === 0) continue;

      // One finding per app, listing every ngrok URL it has.
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
