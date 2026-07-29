/**
 * Synthetic candidate generator (DATASET_GENERATION.md). Produces *candidate* tickets to
 * fill matrix gaps and writes them to a staging file. It never writes dataset.json and never
 * produces a gold label — candidates carry only a provisional `intended` label and must pass
 * blind verification (verify.ts) before becoming gold.
 *
 *   npm run generate -- --fill-gaps -n 8
 *   npm run generate -- --cell "flex/taskrouter·bug·high" -n 3 --twist question_framed
 *   npm run generate -- --fill-gaps --dry-run        # plan + sample prompt, no API calls
 */
import "./load-env";
import { readFileSync, existsSync } from "node:fs";

import Anthropic from "@anthropic-ai/sdk";
import { extractJson } from "../src/index";
import type { Category, Severity } from "../src/index";
import {
  CATEGORIES, SEVERITIES, dataPath, formatCell, jaccard, loadCandidates, loadDataset,
  loadJson, tokenize, writeJson,
  type Candidate, type DatasetTicket, type Product, type Targets,
} from "./lib/dataset";

const GEN_MODEL = "claude-sonnet-4-6";
const GEN_TEMPERATURE = 1; // high, for diversity — opposite of triage's pinned 0
const GEN_MAX_TOKENS = 2048; // headroom so long ticket bodies don't truncate into invalid JSON
const DEDUP_THRESHOLD = 0.8;
const MAX_REGEN = 3;

// ─── flags ────────────────────────────────────────────────────────────────────

function flag(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const has = (name: string) => process.argv.includes(name);

const opts = {
  cell: flag("--cell"),
  fillGaps: has("--fill-gaps"),
  count: Number(flag("-n") ?? flag("--count") ?? (has("--fill-gaps") ? 8 : 3)),
  twist: flag("--twist") ?? null,
  out: flag("--out") ?? "candidates.json",
  seed: flag("--seed") ? Number(flag("--seed")) : (Date.now() & 0xffffffff),
  dryRun: has("--dry-run"),
};

// ─── seeded RNG (mulberry32) ──────────────────────────────────────────────────

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(opts.seed);
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)];

// ─── slot planning ────────────────────────────────────────────────────────────

interface Slot {
  product: Product;
  sub_surface: string | null;
  category: Category;
  severity: Severity;
  twist: string | null;
}

// Severity is constrained by category to stay realistic.
function severityFor(category: Category, severityDeficit: Record<Severity, number>): Severity {
  if (category === "feature_request") return "low";
  const allowed: Severity[] = category === "how_to" ? ["low", "medium"] : SEVERITIES;
  return allowed.reduce((best, s) => (severityDeficit[s] > severityDeficit[best] ? s : best), allowed[0]);
}

function parseCell(spec: string): Omit<Slot, "twist"> {
  const [left, category, severity] = spec.split("·");
  if (!left || !category || !severity) throw new Error(`Bad --cell "${spec}" (expected product[/sub]·cat·sev)`);
  const [product, sub] = left.split("/");
  return {
    product: product as Product,
    sub_surface: sub ?? null,
    category: category as Category,
    severity: severity as Severity,
  };
}

// Plan slots to best close coverage + category/severity deficits, honoring twist quotas.
function planGaps(targets: Targets, tickets: DatasetTicket[], pending: Candidate[], n: number): Slot[] {
  // Count gold + pending toward "already covered" so we don't over-generate.
  const covered = (pred: (p: Product, s: string | null) => boolean) =>
    tickets.filter((t) => t.gold && pred(t.meta.product, t.meta.sub_surface)).length +
    pending.filter((c) => pred(c.meta.product, c.meta.sub_surface)).length;

  // Per-cell deficit lists, then round-robin flatten so a partial run (-n < total gap)
  // samples broadly across surfaces instead of exhausting the first cell first.
  const perCell: { product: Product; sub_surface: string | null }[][] = [];
  for (const c of targets.cells) {
    const cur = covered((p, s) => p === c.product && (c.product === "flex" ? s === c.sub_surface : true));
    const arr = Array.from({ length: Math.max(0, c.target - cur) }, () => ({ product: c.product, sub_surface: c.sub_surface }));
    if (arr.length) perCell.push(arr);
  }
  const slotsNeeded: { product: Product; sub_surface: string | null }[] = [];
  while (perCell.some((a) => a.length)) {
    for (const a of perCell) { const s = a.shift(); if (s) slotsNeeded.push(s); }
  }

  // Running marginal deficits, seeded from targets minus current gold+pending.
  const catCount = (cat: Category) =>
    tickets.filter((t) => t.gold?.category === cat).length + pending.filter((c) => c.intended.category === cat).length;
  const sevCount = (sev: Severity) =>
    tickets.filter((t) => t.gold?.severity === sev).length + pending.filter((c) => c.intended.severity === sev).length;
  const catDef = Object.fromEntries(CATEGORIES.map((c) => [c, targets.by_category[c] - catCount(c)])) as Record<Category, number>;
  const sevDef = Object.fromEntries(SEVERITIES.map((s) => [s, targets.by_severity[s] - sevCount(s)])) as Record<Severity, number>;
  const twistDef = { ...targets.twists };

  const plan: Slot[] = [];
  for (const need of slotsNeeded.slice(0, n)) {
    // A pending twist quota steers category (question_framed ⇒ bug; billing_config ⇒ billing/config).
    let twist: string | null = null;
    let category: Category;
    if (twistDef["question_framed"] > 0) {
      twist = "question_framed"; category = "bug";
    } else if (twistDef["billing_config"] > 0) {
      twist = "billing_config"; category = catDef["billing"] >= catDef["config"] ? "billing" : "config";
    } else {
      category = CATEGORIES.reduce((best, c) => (catDef[c] > catDef[best] ? c : best), CATEGORIES[0]);
      if (twistDef["severity_edge"] > 0) twist = "severity_edge";
    }
    const severity = twist === "severity_edge" ? pick(["high", "critical"] as const) : severityFor(category, sevDef);

    plan.push({ product: need.product, sub_surface: need.sub_surface, category, severity, twist });
    catDef[category]--; sevDef[severity]--;
    if (twist) twistDef[twist]--;
  }
  return plan;
}

// ─── grounding packs ──────────────────────────────────────────────────────────

const packCache = new Map<Product, string | null>();
function grounding(product: Product): { text: string | null; ref: string } {
  if (!packCache.has(product)) {
    const path = dataPath(`grounding/${product}.md`);
    packCache.set(product, existsSync(path) ? readFileSync(path, "utf8") : null);
  }
  return { text: packCache.get(product) ?? null, ref: `${product}.md` };
}

// ─── prompt assembly ──────────────────────────────────────────────────────────

const PERSONAS = ["a small startup", "a mid-size SaaS company", "a large enterprise contact center", "a solo developer"];
const TONES = ["frustrated and urgent", "calm and detailed", "terse", "verbose and rambling"];
const DETAIL = ["includes SIDs, exact error codes, and repro steps", "vague, missing key details, no error codes"];

const TWIST_INSTRUCTION: Record<string, string> = {
  question_framed: "Frame it as an innocent how-to question even though it is really a defect — make the underlying bug discoverable only by reading carefully.",
  billing_config: "Make it genuinely ambiguous between a billing complaint and a configuration/setup problem.",
  severity_edge: "Write it so the severity sits honestly on a boundary (e.g. arguably high or arguably critical).",
};

function buildPrompt(slot: Slot): { system: string; user: string; groundingRef: string } {
  const surface = slot.sub_surface ? `${slot.product} / ${slot.sub_surface}` : slot.product;
  const g = grounding(slot.product);
  const persona = pick(PERSONAS), tone = pick(TONES), detail = pick(DETAIL);

  const system =
    "You generate realistic Twilio customer support tickets for an evaluation dataset. " +
    "Write as a real customer would — never name the category or severity, never use eval " +
    'vocabulary like "this is a bug" or "critical issue". Return ONLY JSON: ' +
    '{"subject": string, "body": string}. No prose, no markdown fences.';

  const user = [
    `Write ONE support ticket that genuinely IS a "${slot.category}" of severity "${slot.severity}" about Twilio ${surface}.`,
    "Make the category and severity TRUE of the situation — do not state them.",
    g.text ? `Ground it in these real specifics (use naturally, do not list):\n${g.text}` : `(No grounding pack for ${slot.product}; use accurate, realistic Twilio detail.)`,
    `Persona: ${persona}. Tone: ${tone}. Detail level: ${detail}.`,
    slot.twist ? `Twist: ${TWIST_INSTRUCTION[slot.twist]}` : "",
  ].filter(Boolean).join("\n\n");

  return { system, user, groundingRef: g.ref };
}

// ─── generation ───────────────────────────────────────────────────────────────

const client = new Anthropic();

async function generateOne(slot: Slot): Promise<{ subject: string; body: string; groundingRef: string }> {
  const { system, user, groundingRef } = buildPrompt(slot);
  const message = await client.messages.create({
    model: GEN_MODEL, max_tokens: GEN_MAX_TOKENS, temperature: GEN_TEMPERATURE,
    system, messages: [{ role: "user", content: user }],
  });
  const block = message.content[0];
  if (block.type !== "text") throw new Error(`unexpected content block "${block.type}"`);
  // A truncated response yields invalid JSON — flag it clearly instead of a vague parse error.
  if (message.stop_reason === "max_tokens") throw new Error("generation truncated at max_tokens");
  const parsed = extractJson(block.text) as { subject?: string; body?: string };
  if (!parsed.subject || !parsed.body) throw new Error("model output missing subject/body");
  return { subject: parsed.subject, body: parsed.body, groundingRef };
}

async function main(): Promise<void> {
  if (!opts.cell && !opts.fillGaps) {
    console.error("Specify --cell <product[/sub]·cat·sev> or --fill-gaps."); process.exit(1);
  }
  if (opts.cell && opts.fillGaps) {
    console.error("--cell and --fill-gaps are mutually exclusive."); process.exit(1);
  }

  const targets = loadJson<Targets>("targets.json");
  const { tickets } = loadDataset();
  const existing = loadCandidates(opts.out);
  const pending = existing.filter((c) => c.status === "pending");

  const plan: Slot[] = opts.cell
    ? Array.from({ length: opts.count }, () => ({ ...parseCell(opts.cell!), twist: opts.twist }))
    : planGaps(targets, tickets, pending, opts.count);

  if (plan.length === 0) { console.log("No gaps to fill — targets already met."); return; }

  console.log(`Plan (${plan.length} slot${plan.length > 1 ? "s" : ""}, seed ${opts.seed}):`);
  for (const s of plan) console.log(`  ${formatCell(s.product, s.sub_surface, s.category, s.severity)}${s.twist ? `  [${s.twist}]` : ""}`);

  if (opts.dryRun) {
    const sample = buildPrompt(plan[0]);
    console.log("\n─ sample prompt (slot 1) ─────────────────────────────────");
    console.log("SYSTEM:\n" + sample.system + "\n\nUSER:\n" + sample.user);
    console.log(`\n(grounding: ${grounding(plan[0].product).text ? sample.groundingRef : "MISSING — add grounding/" + plan[0].product + ".md"})`);
    console.log("\nDry run — no API calls, nothing written.");
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Add it to packages/triage/.env."); process.exit(1);
  }

  // Dedup corpus: existing dataset + existing candidate bodies, growing as we accept.
  const corpus = [...tickets.map((t) => t.body), ...existing.map((c) => c.body)].map(tokenize);
  const isDup = (body: string) => { const tok = tokenize(body); return corpus.some((c) => jaccard(tok, c) > DEDUP_THRESHOLD); };

  const today = new Date().toISOString().slice(0, 10);
  const fresh: Candidate[] = [];
  for (let i = 0; i < plan.length; i++) {
    const slot = plan[i];
    let made: { subject: string; body: string; groundingRef: string } | null = null;
    for (let attempt = 0; attempt < MAX_REGEN; attempt++) {
      try {
        const out = await generateOne(slot);
        if (!isDup(out.body)) { made = out; break; }
        console.warn(`  slot ${i + 1}: near-duplicate, regenerating (${attempt + 1}/${MAX_REGEN})`);
      } catch (err) {
        // A single bad generation (truncation, transient API error, bad JSON) must not abort
        // the whole batch — log, retry, and skip the slot if it keeps failing.
        console.warn(`  slot ${i + 1}: ${err instanceof Error ? err.message : err}, retrying (${attempt + 1}/${MAX_REGEN})`);
      }
    }
    if (!made) { console.warn(`  slot ${i + 1}: skipped (could not produce a usable ticket)`); continue; }

    corpus.push(tokenize(made.body));
    fresh.push({
      tmp_id: `cand-${today}-${String(fresh.length + 1).padStart(3, "0")}`,
      subject: made.subject,
      body: made.body,
      intended: { category: slot.category, severity: slot.severity },
      meta: {
        source: "synthetic", product: slot.product, sub_surface: slot.sub_surface,
        cell: formatCell(slot.product, slot.sub_surface, slot.category, slot.severity),
        twist: slot.twist, added: today, model: GEN_MODEL, grounding: [made.groundingRef],
      },
      status: "pending",
    });
    console.log(`  ✓ slot ${i + 1}/${plan.length}: ${fresh[fresh.length - 1].subject}`);
  }

  writeJson(opts.out, [...existing, ...fresh]);
  console.log(`\nWrote ${fresh.length} candidate(s) to ${opts.out} (${existing.length + fresh.length} total). Next: npm run verify`);
}

main().catch((err) => { console.error(err); process.exit(1); });
