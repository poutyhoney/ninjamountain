# Triage Gold Dataset — Supporting Tooling Spec

The smaller scripts and data files around the dataset pipeline: the target matrix, the gap
dashboard, the invariant checker, and the one-time migration. Companion to
[`DATASET.md`](./DATASET.md), [`DATASET_SCHEMA.md`](./DATASET_SCHEMA.md),
[`DATASET_GENERATION.md`](./DATASET_GENERATION.md), and [`DATASET_VERIFY.md`](./DATASET_VERIFY.md).

---

## 1. `targets.json` — the machine-readable matrix

Encodes the `DATASET.md` §4 target distribution so the report and the generator share one
source of truth. Lives at `experiments/data/targets.json`.

```ts
type Targets = {
  total: number;                  // e.g. 60
  flex_share: number;             // e.g. 0.60
  by_category: Record<Category, number>;   // target counts, sum ≈ total
  by_severity: Record<Severity, number>;   // target counts, sum ≈ total
  cells: TargetCell[];            // per product/sub-surface target counts
  twists: Record<string, number>; // reserved quotas, e.g. { question_framed: 5, ... }
};

type TargetCell = {
  product: Product;
  sub_surface: string | null;
  target: number;                 // how many tickets this surface should hold
};
```

- The category/severity tables and the per-cell counts are independent views of the same
  60; `dataset-report.ts` shows progress against each. They need not multiply out to a full
  product×category×severity grid — that would over-constrain a 60-row set. Cells govern
  **coverage** (which surfaces); the category/severity tables govern **mix**; twists govern
  **reserved hard cases**.
- Editing targets is how we re-aim the set later (e.g. push Flex share higher, or open a new
  product); both downstream scripts pick it up with no code change.

---

## 2. `dataset-report.ts` — the quota dashboard

```bash
npm --workspace @ninjamountain/triage run dataset:report
```

Reads `targets.json` + `dataset.json`, prints **current vs. target** with the gap, so it's
obvious which cells to generate next:

```
PRODUCT / SUB-SURFACE        cur  tgt  gap
flex/desktop                   2    4   -2
flex/conversations             0    3   -3
flex/insights                  0    2   -2
messaging                      2    3   -1
…
─ MIX ───────────────────────────────────
category   bug 14/26  how_to 5/12  …
severity   low 9/16   medium 7/20  …
source     real 20    synthetic 11
split      dev 22     test 9        (only counts verified records)
twists     question_framed 1/5  …
```

- Counts only **verified** records (`gold != null`) for the gold view; a separate line shows
  pending candidates so progress-in-flight is visible.
- This is the input to `generate.ts --fill-gaps` (it consumes the same gaps).
- Read-only; never mutates data.

---

## 3. `validate-dataset.ts` — invariant checker

```bash
npm --workspace @ninjamountain/triage run dataset:validate
```

Fails loudly (non-zero exit) on any violation of the `DATASET_SCHEMA.md` §4 invariants:

- unique `id`s; opaque (warn if an id looks like it encodes product/source);
- `product === "flex"` ⇒ `sub_surface !== null`;
- `source === "synthetic"` ⇒ `cell !== null` and `model !== null`;
- `source === "real"` ⇒ `cell` / `twist` / `model` / `grounding` all `null`;
- `gold` fully populated or `null` (no half-filled gold);
- `category` / `severity` within their enums; `split` ∈ {dev, test};
- **no duplicate / near-duplicate `body` across `dev` and `test`** (leakage guard);
- top-level `version`/`schema` correct.

Intended for a pre-commit / CI gate so a malformed dataset can't land. Prints a summary of
what it checked even on success.

---

## 4. `migrate-dataset.ts` — one-time v1 → v2

```bash
npm --workspace @ninjamountain/triage run dataset:migrate
```

Per `DATASET_SCHEMA.md` §7:

1. Join `tickets.json` + `labels.json` on `id` (skip `_`-prefixed keys like `_legend`).
2. For each ticket emit a v2 `DatasetTicket`:
   - `source: "real"`, `cell: null`, `twist: null`, `model: null`, `grounding: null`,
     `added`: a backfilled date;
   - `product` / `sub_surface`: from the baseline map in `DATASET.md` §4 ("Current 20
     mapped") — encoded as a lookup table in the script;
   - renumber ids `T001…T020` (opaque, zero-padded);
   - `gold`: `{ category, severity, verified_by: "tom", verified_on: <backfill> }`;
   - `split`: from the stratified splitter (`DATASET_VERIFY.md` §6) over all 20.
3. Write `dataset.json` (`version: 2`); leave `tickets.json` / `labels.json` frozen on disk,
   unreferenced.
4. Idempotency guard: refuse to overwrite an existing `dataset.json` unless `--force`, so a
   re-run can't clobber verified work.

---

## 5. `score.ts` — split-aware update

Already specified in `DATASET_SCHEMA.md` §8. Summary: load `dataset.json`, default scope
`dev`, `--test` for the held-out check, `--all` for both; read `gold.category` /
`gold.severity` instead of the old `labels[id]` join. No metric math changes.

---

## 6. npm scripts to add

```jsonc
{
  "dataset:migrate":  "tsx scripts/migrate-dataset.ts",
  "dataset:report":   "tsx scripts/dataset-report.ts",
  "dataset:validate": "tsx scripts/validate-dataset.ts",
  "generate":         "tsx scripts/generate.ts",
  "verify":           "tsx scripts/verify.ts"
  // existing: triage, score, typecheck
}
```

(Runner shown as `tsx` to match the existing script style; align with whatever `score` /
`triage` already use.)
