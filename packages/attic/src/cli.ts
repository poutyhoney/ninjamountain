import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { createClient } from "./client";
import { collect } from "./collect";
import { loadCredentials } from "./config";
import { redact } from "./redact";
import { jsonReport } from "./report/json";
import { isSeverity, meetsThreshold, summarize } from "./report/summary";
import { textReport } from "./report/text";
import { runRules } from "./rules";
import type { Snapshot } from "./snapshot";

const { values } = parseArgs({
  options: {
    "from-snapshot": { type: "string" },
    "save-snapshot": { type: "string" },
    redact: { type: "boolean", default: false },
    format: { type: "string", default: "text" },
    "fail-on": { type: "string" },
  },
});

function usage(message: string): never {
  console.error(message);
  process.exit(2);
}

const { format } = values;
if (format !== "text" && format !== "json")
  usage(`--format must be text or json, not "${format}".`);
const failOn = values["fail-on"];
if (failOn !== undefined && !isSeverity(failOn))
  usage(`--fail-on must be critical, warning, or info, not "${failOn}".`);

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
    usage(`${path} is not a version 1 snapshot.`);
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

const outcomes = runRules(snapshot);
console.log(
  format === "json"
    ? JSON.stringify(jsonReport(snapshot, outcomes), null, 2)
    : textReport(snapshot, outcomes),
);

if (failOn && meetsThreshold(summarize(outcomes).findings, failOn))
  process.exitCode = 1;
