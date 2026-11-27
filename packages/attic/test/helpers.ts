// Shared test helper. loadFixture() reads fixtures/<name>/snapshot.json and
// returns a fresh Snapshot each call, so a test can change it freely without
// affecting other tests.
import { readFileSync } from "node:fs";
import type { Snapshot } from "../src/snapshot";

export function loadFixture(name: string): Snapshot {
  const url = new URL(`../fixtures/${name}/snapshot.json`, import.meta.url);
  return JSON.parse(readFileSync(url, "utf-8")) as Snapshot;
}
