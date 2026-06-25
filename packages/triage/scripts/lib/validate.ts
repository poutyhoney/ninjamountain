/**
 * Pure invariant checks for a v2 dataset (DATASET_SCHEMA.md §4). Returns errors/warnings
 * rather than printing or exiting, so both the `dataset:validate` CLI and `verify` (which
 * self-checks before writing) can share one implementation.
 */
import {
  CATEGORIES, SEVERITIES, PRODUCTS, isFlex, jaccard, tokenize,
  type DatasetFile,
} from "./dataset";

export interface ValidationReport {
  errors: string[];
  warnings: string[];
}

export function validateDataset(file: DatasetFile): ValidationReport {
  const { version, schema, tickets } = file;
  const errors: string[] = [];
  const warnings: string[] = [];
  const E = (id: string, msg: string) => errors.push(`${id}: ${msg}`);

  if (version !== 2) errors.push(`top-level version must be 2 (got ${version})`);
  if (schema !== "triage-dataset") errors.push(`top-level schema must be "triage-dataset"`);

  const seen = new Set<string>();
  for (const t of tickets) {
    if (seen.has(t.id)) E(t.id, "duplicate id");
    seen.add(t.id);
    if (!/^T\d{3,}$/.test(t.id)) warnings.push(`${t.id}: id does not look opaque (expected T###)`);

    const m = t.meta;
    if (!PRODUCTS.includes(m.product)) E(t.id, `unknown product "${m.product}"`);
    if (isFlex(t) && m.sub_surface == null) E(t.id, "flex requires a sub_surface");

    if (m.source === "synthetic") {
      if (m.cell == null) E(t.id, "synthetic requires cell");
      if (m.model == null) E(t.id, "synthetic requires model");
    } else if (m.source === "real") {
      if (m.cell != null || m.twist != null || m.model != null || m.grounding != null)
        E(t.id, "real must have cell/twist/model/grounding all null");
    } else {
      E(t.id, `unknown source "${m.source}"`);
    }

    if (t.split !== "dev" && t.split !== "test") E(t.id, `invalid split "${t.split}"`);

    if (t.gold != null) {
      const g = t.gold;
      if (!CATEGORIES.includes(g.category)) E(t.id, `invalid category "${g.category}"`);
      if (!SEVERITIES.includes(g.severity)) E(t.id, `invalid severity "${g.severity}"`);
      if (!g.verified_by || !g.verified_on) E(t.id, "gold present but missing verified_by/on");
    }
  }

  // Leakage guard: no near-duplicate body across the dev/test boundary.
  const dev = tickets.filter((t) => t.split === "dev");
  const test = tickets.filter((t) => t.split === "test");
  const devTokens = dev.map((t) => ({ id: t.id, tok: tokenize(t.body) }));
  for (const a of test) {
    const at = tokenize(a.body);
    for (const b of devTokens) {
      if (jaccard(at, b.tok) > 0.8) E(a.id, `near-duplicate body of dev ticket ${b.id} (leakage)`);
    }
  }

  return { errors, warnings };
}
