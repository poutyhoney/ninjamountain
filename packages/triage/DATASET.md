# Triage Gold Dataset — Scaling Plan

How we grow the triage evaluation set from **20 → 60 tickets** without access to real
Twilio customer tickets, while keeping the labels trustworthy and the mix **Flex-majority**.

> The labels are the asset, not the code. Everything below exists to protect label quality
> as the set scales. See [`LEARNINGS.md`](./LEARNINGS.md) §3–4 for why.

### Spec set

| doc | covers |
|---|---|
| **DATASET.md** (this) | the plan: target shape, method, matrix, guardrails, sequencing |
| [`DATASET_SCHEMA.md`](./DATASET_SCHEMA.md) | the v2 `dataset.json` format and invariants |
| [`DATASET_GENERATION.md`](./DATASET_GENERATION.md) | `generate.ts` — synthetic candidate generation |
| [`DATASET_VERIFY.md`](./DATASET_VERIFY.md) | `verify.ts` — blind cold-read → gold promotion |
| [`DATASET_TOOLING.md`](./DATASET_TOOLING.md) | `targets.json`, report, validate, migrate, score |

Pipeline: `migrate` → (`report` → `generate` → `verify`) loop → `validate` → `score`.

---

## 1. Target shape

| | Current (20) | Target (60) | To add |
|---|---|---|---|
| **Flex** | 8 (40%) | **36 (60%)** | +28 |
| **Non-Flex** | 12 (60%) | **24 (40%)** | +12 |

"Flex-majority" means depth, not just volume — the 36 Flex tickets spread across Flex's
real sub-surfaces (below), not 36 variations of "agent desktop crashed."

### Category distribution (target, n=60)

Skewed toward bugs to mirror real support inflow.

| category | target | notes |
|---|---|---|
| bug | ~26 | dominant in real queues |
| how_to | ~12 | |
| config | ~9 | auth, compliance, setup |
| billing | ~7 | |
| feature_request | ~6 | |

### Severity distribution (target, n=60)

Ordinal — keep the low/medium body realistic; criticals are rare.

| severity | target |
|---|---|
| low | ~16 |
| medium | ~20 |
| high | ~18 |
| critical | ~6 |

These are quotas to aim for, not hard constraints — let genuine ambiguity override the
quota when a ticket honestly sits between two cells.

---

## 2. The method: spec-first, human-verified generation

The failure mode to avoid: letting the model that **writes** a ticket also **assign its
label** (directly, or implicitly via the generation prompt). That tests Claude against
Claude and silently destroys the gold set. We invert the pipeline so the label exists
before the ticket:

1. **Pick a target cell** — `{product, sub-surface, category, severity}` from the matrix
   in §4. This is the intended label.
2. **Generate a ticket to fit the cell** — conditioned on the label, varying persona,
   length, tone, and noise. Output is a *candidate*.
3. **Cold-read verification (the gold step).** Tom reads the ticket **without seeing the
   intended label** and assigns category + severity against the existing scope-based
   rubric. Agreement confirms the label; disagreement is corrected — and those corrected,
   genuinely-ambiguous cases are the most valuable tickets in the set.
4. **Record provenance** — every ticket tagged `source: synthetic | real` and its origin
   cell.

This is stratified **quota sampling**: we control the distribution by construction instead
of hoping random generation lands well.

---

## 3. Realism levers (so synthetic isn't too easy)

Synthetic tickets are usually too clean, which inflates scores. Harden them:

- **Ground in real Twilio specifics.** Seed generation with real error codes (e.g. 20003,
  30007, 63016), real Flex/Actions Framework terms, real API verbs and product names —
  pulled from the `twilio-docs` MCP rather than invented. Generic phrasing is a tell.
- **Inject known failure modes on purpose.** Reserve a quota for **question-framed bugs**
  (tickets that read like how-tos but are really bugs) — the weak spot flagged in
  `LEARNINGS.md` §9 — plus billing-vs-config ambiguity and severity edge cases. The eval
  should *measure* the weaknesses we care about.
- **Vary structure** to avoid template artifacts a classifier could cheat on; dedupe
  near-identical phrasings.

---

## 4. Stratification matrix

### Flex sub-surfaces (target 36; current 8 → add 28)

`token` is the canonical `meta.sub_surface` value (lowercase; matches `DATASET_SCHEMA.md` §3).

| token | sub-surface | examples | current |
|---|---|---|---|
| `desktop` | Agent Desktop / UI | crashes, rendering, state | T03, T14 |
| `plugins` | Plugins | plugin auth, lifecycle, build | T09 |
| `actions` | Actions & Notifications Framework | action overrides, beforeAccept | — |
| `taskrouter` | TaskRouter (in Flex) | routing, workers, queues, activities | T07, T17 |
| `wrapup` | WrapUp & Activities | timers, auto-advance, presence | T12 |
| `conversations` | Conversations in Flex | messaging tasks, transcripts | — |
| `voice` | Voice in Flex | caller ID, transfers, conferencing | T18 |
| `sso` | SSO / admin config | Okta/SSO, roles, permissions | T04 |
| `insights` | Insights / reporting | dashboards, data export | — |
| `billing` | Flex seat billing | seat counts, active-user charges | — |

Empty sub-surfaces are where the +28 should concentrate first (coverage gaps).

### Non-Flex products (target 24; current 12 → add 12)

`token` is the canonical `meta.product` value (matches the `Product` enum in `DATASET_SCHEMA.md` §3).

| token | product | current |
|---|---|---|
| `messaging` | Programmable Messaging / SMS | T01, T08 |
| `voice` | Programmable Voice / TwiML | T05, T15, T16 |
| `verify` | Verify | T13 |
| `lookup` | Lookup | — |
| `10dlc` | 10DLC & compliance | T20 |
| `sendgrid` | SendGrid email | — |
| `studio` | Studio | — |
| `account` | Account / billing | T02, T06, T11 |
| `auth` | Auth / API config | T19 |

### Current 20 mapped (baseline)

Canonical `product[/sub_surface]·category·severity` tokens — this is the lookup table
`migrate-dataset.ts` encodes (`DATASET_TOOLING.md` §4). Flex rows in **bold**.

T01 messaging·bug·high · T02 account·billing·high · **T03 flex/desktop·bug·critical** ·
**T04 flex/sso·how_to·low** · T05 voice·bug·high · T06 account·billing·low ·
**T07 flex/taskrouter·feature_request·low** · T08 messaging·bug·high ·
**T09 flex/plugins·bug·medium** · T10 voice·how_to·low · T11 account·billing·critical ·
**T12 flex/wrapup·bug·medium** · T13 verify·bug·high · **T14 flex/desktop·feature_request·low** ·
T15 voice·bug·high · T16 voice·how_to·low · **T17 flex/taskrouter·bug·medium** ·
**T18 flex/voice·bug·medium** · T19 auth·config·high · T20 10dlc·config·high

---

## 5. Guardrails

- **Hold-out split.** At 60, freeze a **test set** we never iterate against and keep a
  **dev set** we do. Prevents overfitting the prompt to the eval. (Roughly 70/30 dev/test,
  stratified so both halves keep the Flex-majority, the category mix, and a real/synthetic
  blend — the last needed for the delta check below.)
- **Real-vs-synthetic delta.** Keep the 20 real tickets tagged. If the model scores much
  higher on synthetic than real, the synthetic set is too easy → add more noise/grounding.
- **Provenance + cell tracking** in the data so distribution and coverage stay auditable.
- **Deterministic scoring** stays at temperature 0 (already pinned).

---

## 6. Implementation choices

- **Data shape — decided.** A single versioned `dataset.json` of atomic records, with
  `gold` + `meta` (`source`/`product`/`sub_surface`/`cell`) + a `split` field per ticket.
  Full format in [`DATASET_SCHEMA.md`](./DATASET_SCHEMA.md).
- **Dev/test split — decided.** A `split: "dev" | "test"` field on each record (not separate
  files); see `DATASET_SCHEMA.md` §6, §8.
- **Generation surface — decided.** A reusable `scripts/generate.ts` (matrix cell in →
  candidate tickets out, grounded by curated Twilio packs) that emits *candidates* for blind
  verification, never gold. Full spec in [`DATASET_GENERATION.md`](./DATASET_GENERATION.md).
- **Grounding source — decided.** Curated committed packs (`grounding/<product>.md`), not
  live MCP calls; see `DATASET_GENERATION.md` §10.
- **Provenance & re-verification — decided.** Generation provenance (`twist`/`model`/
  `grounding`) rides on each gold record's `meta`; no scheduled re-verification cadence yet,
  but `verify --revisit` exists as a hook (`DATASET_VERIFY.md` §8).

---

## 7. Sequencing (fits the broader roadmap)

1. **Scale 20 → 60** (this doc) — unblocks everything; stops metrics swinging on one ticket.
2. **Hold-out / dev split** — protects #3–#5 from overfitting.
3. **Question-framed-bug prompt fix** — now verifiable, since the set has a quota of them.
4. **RAG** — the larger labeled set becomes the retrieval corpus.
5. **Tool-use** — last; most complex, needs a trustworthy regression harness first.
