import { loadCredentials } from "../src/config";
import { createClient, TwilioApiError } from "../src/client";

const client = createClient(loadCredentials());

try {
  const page = await client.get<{ flows?: unknown[] }>(
    "https://studio.twilio.com/v2/Flows?PageSize=50",
  );
  console.log("studio flows:", page.flows?.length ?? 0);
} catch (error) {
  if (error instanceof TwilioApiError) {
    console.error(
      `HTTP ${error.status}, Twilio code ${error.code ?? "none"}: ${error.message}`,
    );
    process.exitCode = 1;
  } else {
    throw error;
  }
}
