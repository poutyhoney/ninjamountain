import { fileURLToPath } from "node:url";

export interface Credentials {
  accountSid: string;
  keySid: string;
  keySecret: string;
}

export function loadCredentials(): Credentials {
  const envPath = fileURLToPath(new URL("../.env", import.meta.url));
  try {
    process.loadEnvFile(envPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const accountSid = required("TWILIO_ACCOUNT_SID");
  const keySid = required("TWILIO_API_KEY_SID");
  const keySecret = required("TWILIO_API_KEY_SECRET");

  if (!accountSid.startsWith("AC"))
    throw new Error("TWILIO_ACCOUNT_SID should start with AC.");
  if (!keySid.startsWith("SK"))
    throw new Error("TWILIO_API_KEY_SID should start with SK.");

  return { accountSid, keySid, keySecret };
}

function required(name: string): string {
  const value = process.env[name];
  if (!value)
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill it in.`,
    );
  return value;
}
