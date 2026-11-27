// The entry point for `npm run scan`. It ties the other modules together:
//
//   flags -> snapshot (live via collect.ts, or from a file)
//         -> optional redact (redact.ts) -> optional save
//         -> optional --flex-ui override (flex-version.ts)
//         -> runRules (rules/index.ts) -> text or JSON report (report/)
//         -> exit code
//
// The order is deliberate. The snapshot is saved before --flex-ui is
// applied, so a saved file is always what the account really returned. Rules
// and reports never print or exit. Only this file does.
//
// Exit codes: 0 finished, 1 --fail-on matched a finding, 2 bad input.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { createClient } from "./client";
import { collect } from "./collect";
import { loadCredentials } from "./config";
import { readUiVersion, withFlexUi } from "./flex-version";
import { redact } from "./redact";
import { jsonReport } from "./report/json";
import { isSeverity, meetsThreshold, summarize } from "./report/summary";
import { textReport } from "./report/text";
import { runRules } from "./rules";
import type { Snapshot } from "./snapshot";

// Node's built-in argument parser (util.parseArgs, no library needed). It
// reads process.argv, and an unknown flag throws. The option types flow
// through to `values`: string options are string | undefined, and ones with
// a default are always set.
const { values } = parseArgs({
  options: {
    "from-snapshot": { type: "string" },
    "save-snapshot": { type: "string" },
    redact: { type: "boolean", default: false },
    format: { type: "string", default: "text" },
    "fail-on": { type: "string" },
    "flex-ui": { type: "string" },
  },
});

// The return type `never` tells TypeScript this function doesn't return
// normally. Code after a call to it is treated as unreachable, which is what
// narrows failOn below. The explicit annotation is required for that to work.
function usage(message: string): never {
  console.error(message);
  process.exit(2);
}

// Flags are checked before collecting, so a typo fails right away instead of
// after a full live scan.
const { format } = values;
if (format !== "text" && format !== "json")
  usage(`--format must be text or json, not "${format}".`);
const failOn = values["fail-on"];
// After this line, failOn is narrowed from string | undefined to
// Severity | undefined. isSeverity is a type predicate, and usage() never
// returns.
if (failOn !== undefined && !isSeverity(failOn))
  usage(`--fail-on must be critical, warning, or info, not "${failOn}".`);
const flexUi = values["flex-ui"];
// A major version only, such as 2. The flag answers "1.x or 2.x?", not the
// full version.
if (flexUi !== undefined && !/^\d+$/.test(flexUi))
  usage(`--flex-ui takes a major version such as 2, not "${flexUi}".`);

// npm run changes the working directory to the package folder. INIT_CWD is
// where npm was started, so paths given on the command line resolve from the
// folder the person actually typed them in.
function fromInvocationDir(path: string): string {
  return resolve(process.env.INIT_CWD ?? process.cwd(), path);
}

async function loadSnapshot(path: string): Promise<Snapshot> {
  // JSON.parse returns any. Assigning it to unknown forces a shape check
  // before the cast below.
  const parsed: unknown = JSON.parse(
    await readFile(fromInvocationDir(path), "utf8"),
  );
  // `"schemaVersion" in parsed` narrows parsed to an object with that key,
  // so parsed.schemaVersion can be read. This only checks the version, not
  // every field: snapshots are expected to come from this tool's own
  // --save-snapshot.
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

// Credentials are only loaded here, so --from-snapshot runs need no .env.
async function collectLive(): Promise<Snapshot> {
  const credentials = loadCredentials();
  return collect(createClient(credentials), {
    accountSid: credentials.accountSid,
    keySid: credentials.keySid,
  });
}

// Top-level await: this file is an ES module ("type": "module" in
// package.json), so await works outside an async function.
const fromPath = values["from-snapshot"];
const source = fromPath ? await loadSnapshot(fromPath) : await collectLive();
// Redaction happens before saving and before the rules, so a redacted
// report and a redacted saved file show the same fakes.
const snapshot = values.redact ? redact(source) : source;

const savePath = values["save-snapshot"];
if (savePath) {
  const fullPath = fromInvocationDir(savePath);
  // recursive: true creates missing parent folders and doesn't fail if they
  // already exist.
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  // Status messages go to stderr (console.error). stdout is kept for the
  // report alone, so `--format json | jq` gets clean JSON.
  console.error(`Saved snapshot to ${fullPath}`);
  if (!values.redact)
    console.error(
      "Not redacted: this file has real numbers and SIDs. Keep it out of the repo.",
    );
}

// --flex-ui only fills a gap. If the key read a real version, say the flag
// was ignored rather than silently dropping it.
const realVersion = readUiVersion(snapshot);
if (flexUi && realVersion !== null)
  console.error(
    `Ignoring --flex-ui ${flexUi}: the key read Flex UI ${realVersion}.`,
  );
// `audited` is what the rules and the report see. `snapshot` stays exactly
// as collected.
const audited = flexUi ? withFlexUi(snapshot, flexUi) : snapshot;

const outcomes = runRules(audited);
console.log(
  format === "json"
    ? JSON.stringify(jsonReport(audited, outcomes), null, 2)
    : textReport(audited, outcomes),
);

// process.exitCode instead of process.exit(1). process.exit can end the
// process before a large console.log finishes writing to a pipe, which would
// cut the JSON short. exitCode lets output flush, then exits with that code.
if (failOn && meetsThreshold(summarize(outcomes).findings, failOn))
  process.exitCode = 1;
