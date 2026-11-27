// Loads the Twilio credentials the live scan needs.
//
// Only collectLive() in cli.ts calls this, so offline runs (--from-snapshot)
// never touch credentials at all. The result goes to createClient() in
// client.ts. Nothing here prints or logs a secret: error messages name the
// missing variable, never its value.
import { fileURLToPath } from "node:url";

export interface Credentials {
  // An API key can't look up its own account, so the account SID is required
  // separately. collect() uses it to build the 2010 API URLs.
  accountSid: string;
  keySid: string;
  keySecret: string;
}

export function loadCredentials(): Credentials {
  // Resolve .env relative to this source file, not the current directory.
  // import.meta.url is this module's own file:// URL (an ES module feature),
  // so the path is always packages/attic/.env no matter where npm was run.
  const envPath = fileURLToPath(new URL("../.env", import.meta.url));
  try {
    // Node 22 built-in: reads KEY=value lines into process.env. No dotenv
    // package needed.
    process.loadEnvFile(envPath);
  } catch (error) {
    // ENOENT means "no such file". That's fine: the variables may already be
    // set in the shell or in CI. Any other error (bad permissions, a broken
    // file) is a real problem, so rethrow it.
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const accountSid = required("TWILIO_ACCOUNT_SID");
  const keySid = required("TWILIO_API_KEY_SID");
  const keySecret = required("TWILIO_API_KEY_SECRET");

  // Twilio SIDs start with a two-letter type prefix. Catching a swapped value
  // here gives a clear message instead of a confusing 401 later.
  if (!accountSid.startsWith("AC"))
    throw new Error("TWILIO_ACCOUNT_SID should start with AC.");
  if (!keySid.startsWith("SK"))
    throw new Error("TWILIO_API_KEY_SID should start with SK.");

  return { accountSid, keySid, keySecret };
}

// Returns the variable or throws. The return type is plain string, so callers
// never have to handle undefined (the throw does the narrowing for them).
function required(name: string): string {
  const value = process.env[name];
  // !value also rejects an empty string, which is what .env.example ships with.
  if (!value)
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill it in.`,
    );
  return value;
}
