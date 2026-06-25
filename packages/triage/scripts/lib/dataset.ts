/**
 * Shared types, constants, and helpers for the v2 triage dataset.
 *
 * The on-disk format is specified in packages/triage/DATASET_SCHEMA.md; this module is the
 * single TypeScript home for it. Dataset/eval tooling (migrate, report, validate, generate,
 * verify, score) imports from here — src/ stays focused on the triage runtime.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import type { Category, Severity } from "../../src/index";

// ─── Enums / constants ────────────────────────────────────────────────────────

export type Product =
  | "flex" | "messaging" | "voice" | "verify" | "lookup"
  | "10dlc" | "sendgrid" | "studio" | "account" | "auth";

export const PRODUCTS: Product[] = [
  "flex", "messaging", "voice", "verify", "lookup",
  "10dlc", "sendgrid", "studio", "account", "auth",
];

// Canonical Flex sub_surface tokens (DATASET.md §4 / DATASET_SCHEMA.md §3).
export const FLEX_SUBSURFACES = [
  "desktop", "plugins", "actions", "taskrouter", "wrapup",
  "conversations", "voice", "sso", "insights", "billing",
] as const;

export const CATEGORIES: Category[] = ["bug", "config", "billing", "how_to", "feature_request"];
export const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

export type Split = "dev" | "test";

// ─── Record types ─────────────────────────────────────────────────────────────

export interface TicketMeta {
  source: "real" | "synthetic";
  product: Product;
  sub_surface: string | null;
  cell: string | null;
  added: string;                // ISO date
  // generation provenance — populated for synthetic, null for real:
  twist: string | null;
  model: string | null;
  grounding: string[] | null;
}

export interface Gold {
  category: Category;
  severity: Severity;
  verified_by: string;
  verified_on: string;          // ISO date
  notes?: string;
}

export interface DatasetTicket {
  id: string;
  subject: string;
  body: string;
  split: Split;
  meta: TicketMeta;
  gold: Gold | null;            // null = not yet verified → skipped by scorer
}

export interface DatasetFile {
  version: 2;
  updated: string;
  schema: "triage-dataset";
  tickets: DatasetTicket[];
}

// ─── Target matrix (targets.json) ─────────────────────────────────────────────

export interface TargetCell {
  product: Product;
  sub_surface: string | null;
  target: number;
}

export interface Targets {
  total: number;
  flex_share: number;
  by_category: Record<Category, number>;
  by_severity: Record<Severity, number>;
  cells: TargetCell[];
  twists: Record<string, number>;
}

// ─── Candidates (generation staging, DATASET_GENERATION.md §7) ─────────────────

export interface CandidateMeta {
  source: "synthetic";
  product: Product;
  sub_surface: string | null;
  cell: string;
  twist: string | null;
  added: string;
  model: string;
  grounding: string[];
}

export interface Candidate {
  tmp_id: string;
  subject: string;
  body: string;
  intended: { category: Category; severity: Severity }; // provisional — NOT gold
  meta: CandidateMeta;
  status: "pending" | "accepted" | "rejected";
}

// Canonical cell string, e.g. "flex/taskrouter·bug·high" (DATASET_SCHEMA.md §3).
export function formatCell(
  product: Product, sub: string | null, category: Category, severity: Severity,
): string {
  const left = sub ? `${product}/${sub}` : product;
  return `${left}·${category}·${severity}`;
}

// ─── IO ───────────────────────────────────────────────────────────────────────

export const DATA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../experiments/data");

export function dataPath(file: string): string {
  return resolve(DATA_DIR, file);
}

export function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(dataPath(file), "utf8")) as T;
}

export function writeJson(file: string, value: unknown): void {
  writeFileSync(dataPath(file), JSON.stringify(value, null, 2) + "\n");
}

export function loadDataset(file = "dataset.json"): DatasetFile {
  return loadJson<DatasetFile>(file);
}

export function loadCandidates(file = "candidates.json"): Candidate[] {
  return existsSync(dataPath(file)) ? loadJson<Candidate[]>(file) : [];
}

// Next free opaque id, continuing the T### sequence (DATASET_VERIFY.md §5).
export function nextId(tickets: { id: string }[]): string {
  let max = 0;
  for (const t of tickets) {
    const n = Number(t.id.replace(/^T/, ""));
    if (Number.isFinite(n)) max = Math.max(max, n);
  }
  return `T${String(max + 1).padStart(3, "0")}`;
}

// Near-duplicate signal: normalized token set + Jaccard similarity (dedup / leakage guard).
export function tokenize(s: string): Set<string> {
  return new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean));
}
export function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
}

export const SEV_RANK: Record<Severity, number> = { low: 0, medium: 1, high: 2, critical: 3 };

export function isFlex(t: { meta: TicketMeta }): boolean {
  return t.meta.product === "flex";
}

// A record being split may not have its `split` set yet (e.g. mid-migration).
type Splittable = Pick<DatasetTicket, "id" | "gold" | "meta"> & { split?: Split | null };

// ─── Stratified, append-only split assignment ─────────────────────────────────

/**
 * Assign dev/test to records that don't yet have a split, targeting a global test ratio
 * while keeping strata (Flex-ness × category × source) proportionally represented in both
 * halves. Append-only: records that already have a split are never moved, so a frozen test
 * set stays frozen (DATASET_VERIFY.md §6). Deterministic for a given input order.
 */
export function assignSplits(tickets: Splittable[], testRatio = 0.3): void {
  const unsplit = tickets.filter((t) => t.split == null);
  if (unsplit.length === 0) return;

  const existingTest = tickets.filter((t) => t.split === "test").length;
  const desiredTotalTest = Math.round(tickets.length * testRatio);
  // How many of the unsplit records should become test (clamped to a sane range).
  const need = Math.max(0, Math.min(unsplit.length, desiredTotalTest - existingTest));

  // Group unsplit records into strata and order each stratum stably by id.
  const strata = new Map<string, Splittable[]>();
  for (const t of unsplit) {
    const key = `${isFlex(t) ? "flex" : "non"}|${t.gold?.category ?? "?"}|${t.meta.source}`;
    (strata.get(key) ?? strata.set(key, []).get(key)!).push(t);
  }
  for (const g of strata.values()) g.sort((a, b) => a.id.localeCompare(b.id));

  // Largest-remainder apportionment of `need` test slots across strata, by stratum size.
  type Quota = { key: string; base: number; rem: number };
  const quotas: Quota[] = [];
  for (const [key, g] of strata) {
    const exact = (g.length * need) / unsplit.length;
    const base = Math.floor(exact);
    quotas.push({ key, base, rem: exact - base });
  }
  let assigned = quotas.reduce((s, q) => s + q.base, 0);
  for (const q of [...quotas].sort((a, b) => b.rem - a.rem)) {
    if (assigned >= need) break;
    q.base += 1;
    assigned += 1;
  }
  const testPerStratum = new Map(quotas.map((q) => [q.key, q.base]));

  // Within each stratum, spread the test picks evenly across the ordered records.
  for (const [key, g] of strata) {
    const k = testPerStratum.get(key) ?? 0;
    const testIdx = new Set<number>();
    for (let i = 0; i < k; i++) testIdx.add(Math.round((i * g.length) / k));
    g.forEach((t, i) => (t.split = testIdx.has(i) ? "test" : "dev"));
  }
}
