import { loadCredentials } from "../src/config";
import { createClient } from "../src/client";
import { collect } from "../src/collect";

const credentials = loadCredentials();
const snapshot = await collect(createClient(credentials), {
  accountSid: credentials.accountSid,
  keySid: credentials.keySid,
});

const { schemaVersion, collectedAt, accountSid, keySid, ...sections } =
  snapshot;

for (const [name, section] of Object.entries(sections)) {
  if (!section.available) {
    console.log(`${name.padEnd(20)} unavailable: ${section.reason}`);
    continue;
  }
  const size = Array.isArray(section.data)
    ? `${section.data.length} items`
    : "ok";
  console.log(`${name.padEnd(20)} ${size}`);
}
