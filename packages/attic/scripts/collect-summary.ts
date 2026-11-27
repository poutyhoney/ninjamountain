// Dev script: runs a live collection and prints one line per section.
//
// `npm run collect-summary --workspace packages/attic`. A quick check that
// collect.ts can read each endpoint with the current key, without printing
// any account data: only "N items", "ok", or the unavailable reason.
import { loadCredentials } from "../src/config";
import { createClient } from "../src/client";
import { collect } from "../src/collect";

const credentials = loadCredentials();
const snapshot = await collect(createClient(credentials), {
  accountSid: credentials.accountSid,
  keySid: credentials.keySid,
});

// Rest destructuring: pull out the four metadata fields, and `...sections`
// collects everything left, which is exactly the Section fields. The
// metadata names are unused on purpose. They're only there to leave them out.
const { schemaVersion, collectedAt, accountSid, keySid, ...sections } =
  snapshot;

// Object.entries gives [name, value] pairs. Every value here is a Section,
// so checking available narrows it the same way the rules do.
for (const [name, section] of Object.entries(sections)) {
  if (!section.available) {
    // padEnd lines the output up in columns.
    console.log(`${name.padEnd(20)} unavailable: ${section.reason}`);
    continue;
  }
  // Most sections hold a list. flexConfiguration holds a single object.
  const size = Array.isArray(section.data)
    ? `${section.data.length} items`
    : "ok";
  console.log(`${name.padEnd(20)} ${size}`);
}
