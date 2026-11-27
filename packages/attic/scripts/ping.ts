// Dev script: the smallest possible check that credentials work.
//
// `npm run ping --workspace packages/attic`. One request, prints a count.
// It uses the Studio flows list because a Restricted key can be given that
// permission. The Flex Configuration, the first choice, can't be granted to a
// Restricted key at all (error 8021).
import { loadCredentials } from "../src/config";
import { createClient, TwilioApiError } from "../src/client";

const client = createClient(loadCredentials());

try {
  // An inline type for the one field this script reads. `flows?` is
  // optional, so a missing field doesn't crash the script.
  const page = await client.get<{ flows?: unknown[] }>(
    "https://studio.twilio.com/v2/Flows?PageSize=50",
  );
  console.log("studio flows:", page.flows?.length ?? 0);
} catch (error) {
  // Twilio errors get a one-line summary with the status and code, which is
  // what you need to look up the problem. Anything else is unexpected, so
  // let it crash with a full stack trace.
  if (error instanceof TwilioApiError) {
    console.error(
      `HTTP ${error.status}, Twilio code ${error.code ?? "none"}: ${error.message}`,
    );
    process.exitCode = 1;
  } else {
    throw error;
  }
}
