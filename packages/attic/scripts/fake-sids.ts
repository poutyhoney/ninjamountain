import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const FAKE_SID = /^[A-Z]{2}0{28}[0-9a-f]{4}$/;

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error(
    "Usage: npm run fake-sids --workspace packages/attic -- <input.json> <output.json>",
  );
  process.exit(1);
}

const base = process.env.INIT_CWD ?? process.cwd();
const text = readFileSync(resolve(base, input), "utf8");

const counters = new Map<string, number>();
const fakes = new Map<string, string>();

const result = text.replace(
  /\b([A-Z]{2})[0-9a-f]{32}\b/g,
  (sid, prefix: string) => {
    if (FAKE_SID.test(sid)) return sid;
    let fake = fakes.get(sid);
    if (!fake) {
      const next = (counters.get(prefix) ?? 0) + 1;
      counters.set(prefix, next);
      fake = `${prefix}${"0".repeat(28)}${next.toString(16).padStart(4, "0")}`;
      fakes.set(sid, fake);
    }
    return fake;
  },
);

writeFileSync(resolve(base, output), result);
console.log(`Replaced ${fakes.size} distinct SIDs.`);
