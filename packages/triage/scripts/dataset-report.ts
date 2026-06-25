/**
 * Quota dashboard: current vs. target counts per the matrix in targets.json, so it's obvious
 * which cells still need tickets. Read-only. Specified in DATASET_TOOLING.md §2.
 *
 *   npm run dataset:report
 *
 * The gold view counts only verified records (gold != null); a separate line shows pending
 * candidates if a candidates.json staging file is present.
 */
import { existsSync } from "node:fs";

import type { Category, Severity } from "../src/index";
import {
  CATEGORIES, SEVERITIES, dataPath, loadDataset, loadJson,
  type DatasetTicket, type Targets,
} from "./lib/dataset";

function pad(s: string, w: number): string {
  return s.length >= w ? s : s + " ".repeat(w - s.length);
}
function gap(cur: number, tgt: number): string {
  const d = cur - tgt;
  return d === 0 ? "  ✓" : d > 0 ? `  +${d}` : `  ${d}`;
}

function cellKey(product: string, sub: string | null): string {
  return sub ? `${product}/${sub}` : product;
}

function main(): void {
  const targets = loadJson<Targets>("targets.json");
  const { tickets } = loadDataset();
  const gold = tickets.filter((t: DatasetTicket) => t.gold != null);

  // ── Coverage: per-cell current vs target ──────────────────────────────────
  const curByCell = new Map<string, number>();
  for (const t of gold) {
    const key = cellKey(t.meta.product, t.meta.product === "flex" ? t.meta.sub_surface : null);
    curByCell.set(key, (curByCell.get(key) ?? 0) + 1);
  }

  console.log("PRODUCT / SUB-SURFACE        cur  tgt  gap");
  for (const c of targets.cells) {
    const key = cellKey(c.product, c.sub_surface);
    const cur = curByCell.get(key) ?? 0;
    console.log(`${pad(key, 26)} ${pad(String(cur), 4)} ${pad(String(c.target), 4)}${gap(cur, c.target)}`);
  }

  // ── Mix: category / severity / source / split ─────────────────────────────
  const catCur = (c: Category) => gold.filter((t) => t.gold!.category === c).length;
  const sevCur = (s: Severity) => gold.filter((t) => t.gold!.severity === s).length;

  console.log("\n─ MIX " + "─".repeat(34));
  console.log("category   " + CATEGORIES.map((c) => `${c} ${catCur(c)}/${targets.by_category[c]}`).join("  "));
  console.log("severity   " + SEVERITIES.map((s) => `${s} ${sevCur(s)}/${targets.by_severity[s]}`).join("  "));

  const real = gold.filter((t) => t.meta.source === "real").length;
  const synth = gold.filter((t) => t.meta.source === "synthetic").length;
  const dev = gold.filter((t) => t.split === "dev").length;
  const test = gold.filter((t) => t.split === "test").length;
  console.log(`source     real ${real}  synthetic ${synth}`);
  console.log(`split      dev ${dev}  test ${test}   (verified records only)`);

  // Twist quotas (only meaningful once synthetic tickets exist).
  const twistCur = (name: string) => gold.filter((t) => t.meta.twist === name).length;
  console.log("twists     " + Object.entries(targets.twists).map(([k, v]) => `${k} ${twistCur(k)}/${v}`).join("  "));

  // ── Totals + in-flight candidates ─────────────────────────────────────────
  console.log("\n─ TOTAL " + "─".repeat(33));
  console.log(`gold ${gold.length}/${targets.total}   (unlabeled in dataset: ${tickets.length - gold.length})`);
  if (existsSync(dataPath("candidates.json"))) {
    const candidates = loadJson<{ status?: string }[]>("candidates.json");
    const pending = candidates.filter((c) => c.status === "pending").length;
    console.log(`pending candidates (staging): ${pending}`);
  }
}

main();
