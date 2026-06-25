/**
 * One-time migration of the v1 two-file dataset (tickets.json + labels.json) into the v2
 * single-file format (dataset.json). Specified in DATASET_SCHEMA.md §7 / DATASET_TOOLING.md §4.
 *
 *   npm run dataset:migrate            # refuses to clobber an existing dataset.json
 *   npm run dataset:migrate -- --force # overwrite
 *
 * Reads nothing from the network. The v1 files are left untouched and frozen.
 */
import { existsSync } from "node:fs";

import type { Ticket, Category, Severity } from "../src/index";
import {
  assignSplits, dataPath, loadJson, writeJson,
  type DatasetFile, type DatasetTicket, type Product,
} from "./lib/dataset";

type V1Ticket = Ticket & { id: string };
type V1Gold = { subject?: string; category?: Category; severity?: Severity };

// Canonical product/sub_surface for each original v1 id — the "Current 20 mapped" baseline
// in DATASET.md §4. Category/severity are NOT here; those come from labels.json (the gold).
const BASELINE: Record<string, { product: Product; sub_surface: string | null }> = {
  T01: { product: "messaging", sub_surface: null },
  T02: { product: "account", sub_surface: null },
  T03: { product: "flex", sub_surface: "desktop" },
  T04: { product: "flex", sub_surface: "sso" },
  T05: { product: "voice", sub_surface: null },
  T06: { product: "account", sub_surface: null },
  T07: { product: "flex", sub_surface: "taskrouter" },
  T08: { product: "messaging", sub_surface: null },
  T09: { product: "flex", sub_surface: "plugins" },
  T10: { product: "voice", sub_surface: null },
  T11: { product: "account", sub_surface: null },
  T12: { product: "flex", sub_surface: "wrapup" },
  T13: { product: "verify", sub_surface: null },
  T14: { product: "flex", sub_surface: "desktop" },
  T15: { product: "voice", sub_surface: null },
  T16: { product: "voice", sub_surface: null },
  T17: { product: "flex", sub_surface: "taskrouter" },
  T18: { product: "flex", sub_surface: "voice" },
  T19: { product: "auth", sub_surface: null },
  T20: { product: "10dlc", sub_surface: null },
};

// Backfilled dates for the pre-existing hand-labeled real tickets.
const ADDED_BACKFILL = "2026-06-15";
const VERIFIED_BACKFILL = "2026-06-20";

// "T07" → "T007" (opaque, zero-padded to 3 digits; meaning lives in meta, not the id).
function renumber(oldId: string): string {
  const n = Number(oldId.replace(/^T/, ""));
  return `T${String(n).padStart(3, "0")}`;
}

function main(): void {
  const force = process.argv.includes("--force");
  if (existsSync(dataPath("dataset.json")) && !force) {
    console.error("dataset.json already exists. Re-run with --force to overwrite.");
    process.exit(1);
  }

  const v1Tickets = loadJson<V1Ticket[]>("tickets.json");
  const v1Labels = loadJson<Record<string, V1Gold>>("labels.json");

  const tickets: DatasetTicket[] = v1Tickets.map((t) => {
    const base = BASELINE[t.id];
    const gold = v1Labels[t.id];
    if (!base) throw new Error(`No baseline product mapping for ${t.id}`);
    if (!gold?.category || !gold?.severity) throw new Error(`Missing gold label for ${t.id}`);

    return {
      id: renumber(t.id),
      subject: t.subject,
      body: t.body,
      split: undefined as unknown as DatasetTicket["split"], // set by assignSplits below
      meta: {
        source: "real",
        product: base.product,
        sub_surface: base.sub_surface,
        cell: null,
        added: ADDED_BACKFILL,
        twist: null,
        model: null,
        grounding: null,
      },
      gold: {
        category: gold.category,
        severity: gold.severity,
        verified_by: "tom",
        verified_on: VERIFIED_BACKFILL,
      },
    };
  });

  assignSplits(tickets);

  const file: DatasetFile = {
    version: 2,
    updated: new Date().toISOString().slice(0, 10),
    schema: "triage-dataset",
    tickets,
  };
  writeJson("dataset.json", file);

  const dev = tickets.filter((t) => t.split === "dev").length;
  const test = tickets.filter((t) => t.split === "test").length;
  console.log(`Wrote dataset.json — ${tickets.length} records (dev ${dev} / test ${test}).`);
}

main();
