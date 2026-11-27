// Dev script: turns a redacted snapshot into fixture data.
//
// `npm run fake-sids --workspace packages/attic -- <input.json> <output.json>`
// --redact in the CLI only fakes the account SID, the key SID, and phone
// numbers. Fixtures need every SID fake. This replaces each distinct real SID
// with prefix + 28 zeros + a 4-character counter, such as
// FW00000000000000000000000000000001. Each real SID always maps to the same
// fake, so references between sections (an Address's studioFlowSid and the
// flow's sid) still match. test/fixtures.test.ts checks the result.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// The format this script produces. SIDs already in it are left alone, which
// covers the all-zeros AC and SK from --redact and any planted test SIDs.
const FAKE_SID = /^[A-Z]{2}0{28}[0-9a-f]{4}$/;

// Array destructuring on the command-line arguments. argv[0] is node and
// argv[1] is the script path, so the real arguments start at index 2.
const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error(
    "Usage: npm run fake-sids --workspace packages/attic -- <input.json> <output.json>",
  );
  process.exit(1);
}

// Paths resolve from where npm was run, same as in cli.ts.
const base = process.env.INIT_CWD ?? process.cwd();
const text = readFileSync(resolve(base, input), "utf8");

// One counter per prefix, so flows get FW...0001, FW...0002, and Addresses
// start again at IG...0001.
const counters = new Map<string, number>();
// Real SID to its fake, so a SID seen again later gets the same fake.
const fakes = new Map<string, string>();

// Works on the raw JSON text, not parsed objects, so SIDs inside URLs are
// replaced too. \b is a word boundary, so only whole SIDs match.
// ([A-Z]{2}) captures the prefix as group 1.
const result = text.replace(
  /\b([A-Z]{2})[0-9a-f]{32}\b/g,
  // A replacer callback gets the whole match first, then each capture group.
  (sid, prefix: string) => {
    if (FAKE_SID.test(sid)) return sid;
    let fake = fakes.get(sid);
    if (!fake) {
      const next = (counters.get(prefix) ?? 0) + 1;
      counters.set(prefix, next);
      // toString(16) writes the counter in hex, so it fits the 0-9a-f
      // characters of a real SID.
      fake = `${prefix}${"0".repeat(28)}${next.toString(16).padStart(4, "0")}`;
      fakes.set(sid, fake);
    }
    return fake;
  },
);

writeFileSync(resolve(base, output), result);
console.log(`Replaced ${fakes.size} distinct SIDs.`);
