// Loads packages/triage/.env for the CLI. Imported first (before the triage
// modules construct the Anthropic client) so the key is in place in time.
//
// `override: true` is deliberate: some environments export an empty
// ANTHROPIC_API_KEY, and dotenv will not replace an already-defined var by
// default — so without override the empty value would win over our .env.
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(here, "../.env"), override: true });
