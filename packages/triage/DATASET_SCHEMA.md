# Triage Gold Dataset — Schema (v2)

The versioned, single-source-of-truth format for the triage evaluation set. Companion to
[`DATASET.md`](./DATASET.md) (the scaling *plan*); this doc defines the *format*.

> **Decision:** one `dataset.json` of atomic records. Each ticket carries its text, its
> gold answer, and its provenance in one place. `gold` and ticket text live in the **same
> record** — blind cold-read verification is enforced by tooling (a verify CLI that hides
> `gold`), not by file separation.

---

## 1. Why one file

The v1 layout splits one ticket across two files — `tickets.json` (`{id, subject, body}`)
and `labels.json` (`{id → {category, severity}}`) — joined on `id` by the scorer. That join
has no room for provenance (`source`, `product`, `cell`, `split`), which is neither
ticket-text nor answer. Rather than add a third file and a three-way join, v2 collapses
everything into one atomic record per ticket: easier to audit, version, and diff at 60+
rows. The blind-verification property moves from file separation to a CLI that hides the
answer during cold-read.

---

## 2. File layout

```
experiments/data/
  dataset.json          # v2 — source of truth (tickets + gold + meta + split)
  tickets.json          # v1 — frozen for history, no longer read
  labels.json           # v1 — frozen for history, no longer read
```

---

## 3. Schema

```ts
type DatasetFile = {
  version: 2;
  updated: string;              // ISO date, e.g. "2026-06-23"
  schema: "triage-dataset";
  tickets: DatasetTicket[];
};

type DatasetTicket = {
  id: string;                   // opaque, e.g. "T021" — meaning lives in meta, not the id
  subject: string;
  body: string;
  split: "dev" | "test";        // frozen test set is never iterated against
  meta: {
    source: "real" | "synthetic";
    product: Product;           // top-level product (enum below)
    sub_surface: string | null; // Flex sub-surface, or null for non-Flex
    cell: string | null;        // origin matrix cell for synthetic, e.g. "flex/taskrouter·bug·high"
    added: string;              // ISO date
    // generation provenance — present for synthetic, null for real:
    twist: string | null;       // failure-mode modifier, e.g. "question_framed" (or null)
    model: string | null;       // generating model id
    grounding: string[] | null; // grounding pack ids / refs used
  };
  gold: {
    category: Category;         // bug | config | billing | how_to | feature_request
    severity: Severity;         // low | medium | high | critical
    verified_by: string;        // who cold-read it, e.g. "tom"
    verified_on: string;        // ISO date
    notes?: string;             // why — especially for corrected / ambiguous cases
  } | null;                     // null = not yet verified → skipped by scorer
};

type Product =
  | "flex" | "messaging" | "voice" | "verify" | "lookup"
  | "10dlc" | "sendgrid" | "studio" | "account" | "auth";
```

- **`gold: null`** replaces v1's "missing label row" signal — the scorer skips any ticket
  without a verified gold, exactly like today's `hasGold` check.
- **`Category` / `Severity`** are the existing domain types from `src/types.ts` — the
  single source of truth for those enums; do not redefine them here.
- **`sub_surface`** values for `product:"flex"` come from the §4 matrix in `DATASET.md`
  (`desktop`, `plugins`, `actions`, `taskrouter`, `wrapup`, `conversations`, `voice`,
  `sso`, `insights`, `billing`). Must be non-null when `product` is `flex`.

---

## 4. Field rules / invariants

Enforced by `validate-dataset.ts`:

- `id` unique across the file; opaque (no meaning encoded — that's what `meta` is for).
- `product === "flex"` ⇒ `sub_surface !== null`.
- `source === "synthetic"` ⇒ `cell !== null` and `model !== null`.
- `source === "real"` ⇒ `cell`, `twist`, `model`, `grounding` all `null`.
- `gold` is either fully populated (category, severity, verified_by, verified_on) or `null`.
- `category` / `severity` ∈ their enums.
- No duplicate (or near-duplicate) `body` across `dev` and `test` — prevents leakage.

---

## 5. Example records

```json
{
  "id": "T001",
  "subject": "Webhook not receiving SMS inbound events",
  "body": "Hi, we configured our messaging service webhook URL to …",
  "split": "dev",
  "meta": { "source": "real", "product": "messaging", "sub_surface": null,
            "cell": null, "added": "2026-06-15",
            "twist": null, "model": null, "grounding": null },
  "gold": { "category": "bug", "severity": "high",
            "verified_by": "tom", "verified_on": "2026-06-20" }
},
{
  "id": "T037",
  "subject": "Tasks stop routing to an agent after they refresh the browser",
  "body": "After an agent hits F5, TaskRouter keeps their worker in Available but …",
  "split": "test",
  "meta": { "source": "synthetic", "product": "flex", "sub_surface": "taskrouter",
            "cell": "flex/taskrouter·bug·high", "added": "2026-06-23",
            "twist": "question_framed", "model": "claude-opus-4-8",
            "grounding": ["flex.md#taskrouter"] },
  "gold": { "category": "bug", "severity": "high",
            "verified_by": "tom", "verified_on": "2026-06-23",
            "notes": "Reads like a how-to but is a routing defect — question-framed-bug quota." }
}
```

---

## 6. id & split policy

- **ids are opaque.** Renumber the 20 real tickets `T001…T020`, continue `T021+`. Never
  encode product/source in the id, so a re-categorization never forces an id change.
- **split is assigned once, stratified, then frozen.** ~70/30 dev/test, stratified so both
  halves preserve the Flex-majority, the category mix, **and** a real/synthetic blend
  (needed for the real-vs-synthetic delta check in `DATASET.md` §5). Once a ticket is in
  `test`, it never moves, and the prompt is never tuned against it.

---

## 7. Migration (v1 → v2)

`scripts/migrate-dataset.ts`, run once:

1. Join `tickets.json` + `labels.json` on `id`.
2. Emit `dataset.json` with `version: 2`. For each existing ticket: `source: "real"`,
   `cell: null`, infer `product` / `sub_surface` from the §4 baseline map in `DATASET.md`,
   `verified_by: "tom"`, and a `split` from the stratified splitter.
3. Leave the v1 files on disk, frozen and unreferenced.

---

## 8. Scorer changes

`score.ts` drops the two-file join and gains split-awareness. Default scope is **`dev`** so
routine iteration never touches the frozen test set:

```ts
const { tickets } = load<DatasetFile>("dataset.json");
const scope = process.argv.includes("--test") ? "test"
            : process.argv.includes("--all")  ? null      // both halves
            : "dev";                                       // default
const inScope = (t: DatasetTicket) => scope === null || t.split === scope;
const scored  = tickets.filter((t) => t.gold && inScope(t));
// downstream: read t.gold.category / t.gold.severity instead of labels[id]
```

`npm run score` → dev only; `npm run score -- --test` → the deliberate, occasional
held-out check; `-- --all` → everything.

---

## 9. Supporting tooling

The scripts that read/write this format — `migrate-dataset`, `validate-dataset`,
`dataset-report`, plus `generate` and `verify` — are specified in
[`DATASET_TOOLING.md`](./DATASET_TOOLING.md), [`DATASET_GENERATION.md`](./DATASET_GENERATION.md),
and [`DATASET_VERIFY.md`](./DATASET_VERIFY.md). This doc owns the on-disk format they share.

---

## 10. What is frozen vs editable

- **Frozen once set:** a ticket's `id`, its `split`, and the v1 files.
- **Editable:** `gold` (a correction during re-review updates `verified_on` + `notes`),
  `meta.product`/`sub_surface` (re-categorization), and of course adding new records.
