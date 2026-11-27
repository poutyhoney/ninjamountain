import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { createClient } from "./client";
import { collect } from "./collect";
import { loadCredentials } from "./config";
import { redact } from "./redact";

const { values } = parseArgs({
  options: {
    "save-snapshot": { type: "string" },
    redact: { type: "boolean", default: false },
  },
});

const credentials = loadCredentials();
const collected = await collect(createClient(credentials), {
  accountSid: credentials.accountSid,
  keySid: credentials.keySid,
});
const snapshot = values.redact ? redact(collected) : collected;

const savePath = values["save-snapshot"];
if (savePath) {
  const fullPath = resolve(process.env.INIT_CWD ?? process.cwd(), savePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Saved snapshot to ${fullPath}`);
  if (!values.redact)
    console.log(
      "Not redacted: this file has real numbers and SIDs. Keep it out of the repo.",
    );
}
