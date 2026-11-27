// Dev script: shows which endpoints the current key can read.
//
// `npm run probe --workspace packages/attic`. One small request per endpoint
// that collect.ts uses, printing "200 ok" or the status and Twilio code.
// The README's Restricted key table and the UNAVAILABLE_CODES set in
// collect.ts both came from running this.
import { loadCredentials } from "../src/config";
import { createClient, TwilioApiError } from "../src/client";

const credentials = loadCredentials();
const client = createClient(credentials);
const core = `https://api.twilio.com/2010-04-01/Accounts/${credentials.accountSid}`;

// A list of [label, url] tuples. PageSize=1 keeps each response tiny, since
// only access matters, not the data.
const endpoints: Array<[string, string]> = [
  ["Flex Configuration", "https://flex-api.twilio.com/v1/Configuration"],
  ["Flex Flows", "https://flex-api.twilio.com/v1/FlexFlows?PageSize=1"],
  ["Phone numbers", `${core}/IncomingPhoneNumbers.json?PageSize=1`],
  ["TwiML Apps", `${core}/Applications.json?PageSize=1`],
  [
    "Conversations Addresses",
    "https://conversations.twilio.com/v1/Configuration/Addresses?PageSize=1",
  ],
  ["Studio flows (list)", "https://studio.twilio.com/v2/Flows?PageSize=1"],
  ["Proxy services", "https://proxy.twilio.com/v1/Services?PageSize=1"],
];

for (const [name, url] of endpoints) {
  console.log(`${name.padEnd(26)} ${await probe(url)}`);
}

// Fetching one flow is a separate Restricted key permission from listing
// flows, so it gets its own check, using the first flow from the list.
const flowList = await client.get<{ flows?: Array<{ sid: string }> }>(
  "https://studio.twilio.com/v2/Flows?PageSize=1",
);
// Optional chaining at each step: flows may be missing, and [0] may not
// exist (an account with no flows). With noUncheckedIndexedAccess, [0] is
// typed as possibly undefined, so ?. is required here.
const flowSid = flowList.flows?.[0]?.sid;
if (flowSid) {
  console.log(
    `${"Studio flow (fetch one)".padEnd(26)} ${await probe(`https://studio.twilio.com/v2/Flows/${flowSid}`)}`,
  );
}

// A function declaration is hoisted, so it can be called above where it's
// written.
async function probe(url: string): Promise<string> {
  try {
    await client.get(url);
    return "200 ok";
  } catch (error) {
    if (error instanceof TwilioApiError) {
      return `${error.status} code ${error.code ?? "none"}: ${error.message}`;
    }
    throw error;
  }
}
