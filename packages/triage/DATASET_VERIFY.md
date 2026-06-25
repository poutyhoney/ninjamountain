# Triage Gold Dataset — Verification Spec

How `scripts/verify.ts` turns **candidates** (from
[`DATASET_GENERATION.md`](./DATASET_GENERATION.md)) into trusted **gold records** in the v2
format ([`DATASET_SCHEMA.md`](./DATASET_SCHEMA.md)). This is the second half of the wall: the
generator proposes, verify is where the human disposes.

> The blind cold-read here is the single step that makes the dataset "gold." Everything
> upstream is untrusted until it passes through this tool. See `DATASET.md` §2.

---

## 1. What it does

For each `pending` candidate, one at a time:

1. **Show the ticket text only** — `subject` + `body`. The candidate's `intended` label is
   **hidden**. The reviewer must not see what the generator was aiming for.
2. **Reviewer assigns** `category` + `severity` from a cold read, against the scope-based
   rubric in `LEARNINGS.md`.
3. **Reveal** the `intended` label and whether the human read matched it.
4. **Record the decision** (accept / reject / skip), capturing a note for any correction or
   genuinely ambiguous case.
5. On **accept**, the human's label becomes `gold`; the candidate is promoted to a
   `DatasetTicket` (id + `gold` populated now; `split` assigned by the stratified splitter at
   session end, §6), and the candidate is marked `accepted` in the staging file.

The reviewer's cold-read label always wins — never the generator's `intended`. That is the
whole point.

---

## 2. CLI interface

```bash
npm --workspace @ninjamountain/triage run verify -- [flags]
```

| flag | meaning | default |
|---|---|---|
| `--in <file>` | candidate staging file | `experiments/data/candidates.json` |
| `--reviewer <name>` | recorded as `gold.verified_by` | git user name |
| `--filter <product\|cell\|twist>` | only review matching candidates | all |
| `--show-intended` | disable blind mode (for debugging only) | off |
| `--stats` | print agreement summary and exit, no review | off |
| `--revisit <n>` | blind-re-read `n` random existing gold records (drift check, §8) | — |
| `--revisit-id <id>` | blind-re-read one specific gold record | — |
| `--assign-splits` | run the stratified splitter over any not-yet-split records, no review (§6) | — |

Interactive, one candidate per screen, with a progress counter (`7 / 23`). Keyboard-driven:
assign category + severity, then `[a]ccept / [r]eject / [s]kip`, with an optional note.
`skip` leaves the candidate `pending` for a later pass.

---

## 3. The blind read (default mode)

```
─ candidate 7 / 23 ──────────────────────────────────────────
Subject: Tasks stop routing to an agent after they refresh the browser
Body:    After an agent hits F5, TaskRouter keeps their worker in
         Available but new tasks never reach them until they toggle
         activity. We're on Flex UI 2.x … (full body)

  category? > bug
  severity? > high

─ revealed ──────────────────────────────────────────────────
  intended: bug · high     your read: bug · high     ✓ match
  cell: flex/taskrouter·bug·high   twist: question_framed

  [a]ccept  [r]eject  [s]kip  note?
```

- **Match** → accept writes the human label as gold (identical to intended here).
- **Mismatch** → the human label is gold; a **note is required** explaining the correction.
  These corrected cases are the most valuable rows in the set (`DATASET.md` §2).

---

## 4. Promotion to a gold record

On accept, the candidate becomes a `DatasetTicket`:

```ts
{
  id,                              // next free T0NN (§5)
  subject, body,                   // unchanged from candidate
  split,                           // assigned by the splitter (§6)
  meta: {
    source: "synthetic",
    product, sub_surface, cell,    // carried from candidate.meta
    added: candidate.meta.added,
    twist, model, grounding,       // generation provenance, carried onto the record
  },
  gold: {
    category, severity,            // the reviewer's cold-read label
    verified_by: <reviewer>,
    verified_on: <today>,
    notes,                         // required on a correction; optional otherwise
  },
}
```

Generation provenance (`twist`, `model`, `grounding`) is **carried onto the gold record's
`meta`**, keeping each record self-contained and auditable without joining back to
`candidates.json` (consistent with the atomic-record choice, `DATASET_SCHEMA.md` §1). Only
`candidate.intended` is dropped — never stored as gold.

---

## 5. id assignment

`verify` assigns the next free opaque id by scanning existing `dataset.json` ids
(`T001…`), continuing the sequence. Ids are never reused, even if a record is later removed.

---

## 6. Split assignment (stratified, append-only)

Split is **not** chosen per-ticket in isolation — that would drift the dev/test ratios.
Instead, accepted records are buffered and the **stratified splitter** assigns `dev`/`test`
across the *new* batch to best preserve the global ~70/30 target while holding the
Flex-majority, category mix, and real/synthetic blend in *both* halves.

- Run as the final step of a verify session (or `verify --assign-splits` over any
  not-yet-split accepted records).
- **Append-only:** the splitter only assigns split to records that don't have one. It never
  moves a ticket already in `test` — the held-out set stays frozen (`DATASET_SCHEMA.md` §6).

---

## 7. Agreement stats (`--stats`)

Prints, without reviewing:

- candidates by status (pending / accepted / rejected),
- **intended-vs-human agreement rate** — how often the generator's `intended` matched the
  cold read. A low rate flags either ambiguous cells or a generator that bakes labels in too
  weakly; a suspiciously perfect rate flags label bleed-through in the prompt.
- correction breakdown by cell and by `twist` — which areas are hardest to label.

This is a quality signal on *generation*, distinct from the model-accuracy signal in
`score.ts`.

---

## 8. Re-verification (deferred, hook built in)

No scheduled re-verification cadence yet — decided after the first full 60-ticket build.
But the hook exists from day one so it's cheap to start later:

```bash
npm ... run verify -- --revisit <n>     # blind-re-read n random existing gold records
npm ... run verify -- --revisit-id T037 # re-read one specific record
```

`--revisit` runs the same blind cold-read against records that **already** have `gold`,
without showing the stored label. A disagreement updates `gold` (new `verified_on`, a
required `notes`) and is reported as a **drift** event. Until we choose a cadence, this is
run ad hoc; formalizing a recurring spot-check (e.g. random 10%) is a later decision.
