import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { createClient } from "./client";
import { collect } from "./collect";
import { loadCredentials } from "./config";
import { redact } from "./redact";
import { textReport } from "./report/text";
import { runRules } from "./rules";
import type { Snapshot } from "./snapshot";

const { values } = parseArgs({
  options: {
    "from-snapshot": { type: "string" },
    "save-snapshot": { type: "string" },
    redact: { type: "boolean", default: false },
  },
});

function fromInvocationDir(path: string): string {
  return resolve(process.env.INIT_CWD ?? process.cwd(), path);
}

async function loadSnapshot(path: string): Promise<Snapshot> {
  const parsed: unknown = JSON.parse(
    await readFile(fromInvocationDir(path), "utf8"),
  );
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("schemaVersion" in parsed) ||
    parsed.schemaVersion !== 1
  ) {
    console.error(`${path} is not a version 1 snapshot.`);
    process.exit(1);
  }
  return parsed as Snapshot;
}

async function collectLive(): Promise<Snapshot> {
  const credentials = loadCredentials();
  return collect(createClient(credentials), {
    accountSid: credentials.accountSid,
    keySid: credentials.keySid,
  });
}

const fromPath = values["from-snapshot"];
const source = fromPath ? await loadSnapshot(fromPath) : await collectLive();
const snapshot = values.redact ? redact(source) : source;

const savePath = values["save-snapshot"];
if (savePath) {
  const fullPath = fromInvocationDir(savePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.error(`Saved snapshot to ${fullPath}`);
  if (!values.redact)
    console.error(
      "Not redacted: this file has real numbers and SIDs. Keep it out of the repo.",
    );
}

console.log(textReport(snapshot, runRules(snapshot)));
