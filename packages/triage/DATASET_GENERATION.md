# Triage Gold Dataset — Synthetic Generation Spec

How `scripts/generate.ts` produces **candidate** tickets to grow the set toward the targets
in [`DATASET.md`](./DATASET.md) §4, in the v2 format defined in
[`DATASET_SCHEMA.md`](./DATASET_SCHEMA.md).

> **The hard rule: the generator proposes, the human disposes.** This script never writes
> to `dataset.json` and never produces a `gold` label. It emits *candidates* with a
> *provisional* label (the matrix cell it was asked to fill). A candidate only becomes a
> gold record after a blind cold-read in the verify step. This is the wall that keeps the
> set from becoming "Claude graded by Claude" (`DATASET.md` §2).

---

## 1. Where it sits in the pipeline

```
dataset-report.ts        →  generate.ts        →  candidates.json   →  verify  →  dataset.json
(which cells are short)     (fill the gaps)        (staging, blind)    (cold-read)  (gold, split)
```

`generate.ts` reads the **gap** between current counts and targets, produces candidates for
the short cells, and writes them to a staging file. Nothing it writes is trusted until
verify promotes it.

---

## 2. CLI interface

```bash
npm --workspace @ninjamountain/triage run generate -- [flags]
```

| flag | meaning | default |
|---|---|---|
| `--cell <product/sub·cat·sev>` | generate for one explicit cell | — |
| `--fill-gaps` | auto-pick short cells from `targets.json` vs current dataset | — |
| `-n, --count <int>` | candidates per cell | 3 |
| `--twist <name>` | force a failure-mode modifier (see §6) | none |
| `--out <file>` | staging output | `experiments/data/candidates.json` |
| `--seed <int>` | reproducibility for persona/style sampling | random |
| `--dry-run` | print prompts + what would be generated, no API calls | false |

`--cell` and `--fill-gaps` are mutually exclusive. `--fill-gaps` is the normal driver;
`--cell` is for topping up one specific gap by hand.

---

## 3. Inputs

- **`experiments/data/targets.json`** — machine-readable version of the `DATASET.md` §4
  matrix: target count per `{product, sub_surface, category, severity}` cell, plus the
  reserved `twist` quotas (e.g. N question-framed bugs). Single source consumed by *both*
  `dataset-report.ts` and `generate.ts`, so the dashboard and the generator never disagree.
- **`experiments/data/dataset.json`** — current set, to compute gaps and to dedupe against.
- **Grounding packs** — real Twilio specifics per product/sub-surface (see §4).

---

## 4. Grounding strategy

Generic synthetic tickets are too clean and inflate scores (`DATASET.md` §3). Each ticket
is seeded with **real** Twilio specifics — error codes (e.g. 20003, 30007, 63016), product
and API verb names, Flex/Actions-Framework terminology — not invented detail.

**Source of grounding (decided — see §10):** **curated grounding packs** at
`experiments/data/grounding/<product>.md`, assembled *once* (and refreshed occasionally) by
pulling from the `twilio-docs` MCP, then committed. `generate.ts` reads the relevant pack as
static context.

Why packs rather than calling the MCP live inside the script: the `twilio-docs` MCP is
available to Claude in-session, not to a standalone Node process, and the API-generation
loop should stay repeatable, reviewable, and decoupled from live MCP availability. Building
the packs is a separate, occasional in-session task; generation is the hot, scriptable loop.

A pack is short and factual — error codes with meanings, key terms, common real failure
modes for that surface — enough to make a ticket sound like it came from a real customer.

---

## 5. Generation prompt design

Per candidate, the prompt is assembled from:

1. **The cell as the spec** — "Write a support ticket that genuinely *is* a
   `{category}` of severity `{severity}` about `{product}/{sub_surface}`." The label is the
   instruction; the model is told to make it *true*, not to state it.
2. **Grounding** — the relevant pack (§4), with an instruction to use real codes/terms
   naturally, not list them.
3. **Persona/style randomization** (sampled per ticket, seeded by `--seed`) across:
   company size, technical level, tone (frustrated / calm / terse / verbose), and
   **information completeness** (includes SIDs + error codes + repro vs. vague and missing
   detail). This is what stops every ticket reading the same.
4. **Anti-leakage constraints** — never name the category/severity, never use eval
   vocabulary ("this is a bug", "critical issue"); write as a customer would.
5. **Twist** if set (§6).

Output is a strict JSON object (`{subject, body}`) parsed with the existing `parse.ts`, so
malformed generations are caught the same way triage output is.

---

## 6. Failure-mode injection (`--twist`)

The eval should measure the weaknesses we care about, so we deliberately generate them
(`DATASET.md` §3). `twist` names are also valid quota keys in `targets.json`:

| twist | what it forces |
|---|---|
| `question_framed` | a real bug written as an innocent how-to question (the known weak spot, `LEARNINGS.md` §9) |
| `billing_config` | ambiguity between a billing complaint and a config/setup problem |
| `severity_edge` | a case sitting honestly on a severity boundary (e.g. high vs critical) |

A twist constrains *framing*, never the intended label — a `question_framed` bug is still
labeled `bug`; that's the entire point of the test.

---

## 7. Candidate (staging) schema

Distinct from `DatasetTicket` — a candidate has **no `gold` and no `id`/`split`** yet. Its
label is `intended`, explicitly provisional:

```ts
type Candidate = {
  tmp_id: string;                 // batch-local, e.g. "cand-2026-06-23-007"
  subject: string;
  body: string;
  intended: {                     // provisional — the cell asked for, NOT gold
    category: Category;
    severity: Severity;
  };
  meta: {
    source: "synthetic";
    product: Product;
    sub_surface: string | null;
    cell: string;
    twist: string | null;
    added: string;                // ISO date
    model: string;                // generating model id, for provenance
    grounding: string[];          // pack ids / refs used
  };
  status: "pending";              // verify sets accepted | rejected
};
```

`verify` hides `intended` during the cold-read, then reveals it to compare; on accept it
becomes a `DatasetTicket` with `gold` populated (label confirmed *or corrected*), an `id`
assigned, and a `split` from the stratified splitter, then merged into `dataset.json`. The
candidate's `meta.twist` / `model` / `grounding` are **carried onto the gold record's
`meta`** (`DATASET_SCHEMA.md` §3); only `intended` is dropped — it is never persisted as gold.

---

## 8. Diversity & dedup controls

- Generate in **small batches with an explicit "make these distinct from each other"**
  instruction; vary openings and structure.
- **Dedup** each candidate against the existing dataset *and* the in-flight batch by simple
  text similarity (e.g. Jaccard over shingled tokens, threshold tuned conservatively);
  near-duplicates are dropped and regenerated.
- Record `seed` so a batch is reproducible for debugging.

---

## 9. Provenance recorded

Every candidate (and the record it becomes) carries: `source: "synthetic"`, origin `cell`,
`twist`, generating `model` id, and `grounding` refs. This powers the real-vs-synthetic
delta check (`DATASET.md` §5) and lets us trace any suspicious ticket back to how it was
made.

---

## 10. Grounding source — decided: curated packs

Resolved in favor of **curated committed packs** (§4): `experiments/data/grounding/<product>.md`,
built once from the `twilio-docs` MCP, committed, and read statically by `generate.ts`. This
keeps the script standalone, repeatable, and reviewable, and decouples generation from live
MCP availability. Packs are refreshed occasionally as an in-session task when products
change — not part of the hot generation loop.
