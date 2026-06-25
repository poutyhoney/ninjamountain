/**
 * Blind cold-read verification (DATASET_VERIFY.md). Promotes pending candidates from the
 * staging file into trusted gold records in dataset.json. The reviewer assigns category +
 * severity WITHOUT seeing the generator's intended label; their read always wins.
 *
 *   npm run verify                       # review pending candidates
 *   npm run verify -- --stats            # agreement summary, no review
 *   npm run verify -- --assign-splits    # (re)assign dev/test to unsplit records
 *   npm run verify -- --filter flex      # only candidates matching product/cell/twist
 *
 * Before writing, the resulting dataset is run through the same invariant checks as
 * `dataset:validate`; if any fail, nothing is written.
 */
import "./load-env";
import { execSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import type { Category, Severity } from "../src/index";
import {
  CATEGORIES, SEVERITIES, assignSplits, loadCandidates, loadDataset, nextId, writeJson,
  type Candidate, type DatasetFile, type DatasetTicket,
} from "./lib/dataset";
import { validateDataset } from "./lib/validate";

const has = (n: string) => process.argv.includes(n);
const flag = (n: string) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };

function reviewerName(): string {
  if (flag("--reviewer")) return flag("--reviewer")!;
  try { return execSync("git config user.name", { encoding: "utf8" }).trim() || "unknown"; }
  catch { return "unknown"; }
}

// Parse the intended cat·sev out of a synthetic record's cell, for agreement stats.
function cellLabel(cell: string | null): { category?: string; severity?: string } {
  const parts = cell?.split("·") ?? [];
  return { category: parts[1], severity: parts[2] };
}

function stats(dataset: DatasetFile, candidates: Candidate[]): void {
  const byStatus = { pending: 0, accepted: 0, rejected: 0 };
  for (const c of candidates) byStatus[c.status]++;
  console.log(`Candidates: pending ${byStatus.pending}  accepted ${byStatus.accepted}  rejected ${byStatus.rejected}`);

  const synth = dataset.tickets.filter((t) => t.meta.source === "synthetic" && t.gold);
  if (synth.length === 0) { console.log("No synthetic gold records yet — agreement stats unavailable."); return; }
  let agree = 0;
  const corrections: string[] = [];
  for (const t of synth) {
    const intended = cellLabel(t.meta.cell);
    const match = intended.category === t.gold!.category && intended.severity === t.gold!.severity;
    if (match) agree++;
    else corrections.push(`${t.id} (${t.meta.cell} → ${t.gold!.category}·${t.gold!.severity})`);
  }
  console.log(`intended-vs-human agreement: ${agree}/${synth.length} (${Math.round((agree / synth.length) * 100)}%)`);
  if (corrections.length) { console.log("corrections:"); for (const c of corrections) console.log(`  ${c}`); }
}

async function main(): Promise<void> {
  const dataset = loadDataset();
  const candFile = flag("--in") ?? "candidates.json";
  const candidates = loadCandidates(candFile);

  if (has("--stats")) { stats(dataset, candidates); return; }

  if (has("--assign-splits")) {
    assignSplits(dataset.tickets);
    finalize(dataset, candidates, candFile);
    return;
  }

  // ── review loop ────────────────────────────────────────────────────────────
  const filter = flag("--filter");
  let pending = candidates.filter((c) => c.status === "pending");
  if (filter) pending = pending.filter((c) => c.meta.product === filter || c.meta.cell.includes(filter) || c.meta.twist === filter);

  if (pending.length === 0) { console.log("No pending candidates to review."); return; }

  const reviewer = reviewerName();
  const today = new Date().toISOString().slice(0, 10);
  const rl = createInterface({ input: stdin, output: stdout });
  const accepted: DatasetTicket[] = [];

  async function choice(label: string, options: readonly string[]): Promise<string> {
    const menu = options.map((o, i) => `${i + 1} ${o}`).join("  ");
    for (;;) {
      const ans = (await rl.question(`  ${label}? [${menu}] > `)).trim().toLowerCase();
      const byNum = Number(ans);
      if (byNum >= 1 && byNum <= options.length) return options[byNum - 1];
      const hit = options.find((o) => o === ans);
      if (hit) return hit;
      console.log("    (invalid — pick a number or the exact word)");
    }
  }

  for (let i = 0; i < pending.length; i++) {
    const c = pending[i];
    console.log("\n" + "─".repeat(62));
    console.log(`candidate ${i + 1} / ${pending.length}`);
    console.log(`Subject: ${c.subject}`);
    console.log(`Body:    ${c.body}\n`);

    const category = (await choice("category", CATEGORIES)) as Category;
    const severity = (await choice("severity", SEVERITIES)) as Severity;

    const blind = !has("--show-intended");
    const match = category === c.intended.category && severity === c.intended.severity;
    console.log("\n─ revealed " + "─".repeat(50));
    console.log(`  intended: ${c.intended.category}·${c.intended.severity}    your read: ${category}·${severity}    ${match ? "✓ match" : "✗ MISMATCH"}`);
    console.log(`  cell: ${c.meta.cell}   twist: ${c.meta.twist ?? "—"}`);
    if (!blind) console.log("  (blind mode off)");

    const decision = await choice("decision", ["accept", "reject", "skip"]);
    if (decision === "skip") { console.log("  → left pending"); continue; }
    if (decision === "reject") { c.status = "rejected"; console.log("  → rejected"); continue; }

    let notes = (await rl.question("  note" + (match ? " (optional)" : " (REQUIRED — explain the correction)") + ": ")).trim();
    while (!match && !notes) notes = (await rl.question("  note is required on a mismatch: ")).trim();

    const id = nextId([...dataset.tickets, ...accepted]);
    accepted.push({
      id, subject: c.subject, body: c.body,
      split: undefined as unknown as DatasetTicket["split"], // assigned by splitter at session end
      meta: {
        source: "synthetic", product: c.meta.product, sub_surface: c.meta.sub_surface,
        cell: c.meta.cell, added: c.meta.added,
        twist: c.meta.twist, model: c.meta.model, grounding: c.meta.grounding,
      },
      gold: { category, severity, verified_by: reviewer, verified_on: today, ...(notes ? { notes } : {}) },
    });
    c.status = "accepted";
    console.log(`  → accepted as ${id}`);
  }
  rl.close();

  if (accepted.length === 0) { console.log("\nNothing accepted; candidate statuses updated."); writeJson(candFile, candidates); return; }

  dataset.tickets.push(...accepted);
  assignSplits(dataset.tickets); // stratified, append-only — only the new records get a split
  finalize(dataset, candidates, candFile);
}

// Validate-then-write: the gate. If the resulting dataset violates any invariant, write nothing.
function finalize(dataset: DatasetFile, candidates: Candidate[], candFile: string): void {
  dataset.updated = new Date().toISOString().slice(0, 10);
  const { errors } = validateDataset(dataset);
  if (errors.length) {
    console.error(`\n✗ Refusing to write — ${errors.length} invariant violation(s):`);
    for (const e of errors) console.error(`  ${e}`);
    console.error("No files changed. Fix the cause and re-run.");
    process.exit(1);
  }
  writeJson("dataset.json", dataset);
  writeJson(candFile, candidates);
  const dev = dataset.tickets.filter((t) => t.split === "dev").length;
  const test = dataset.tickets.filter((t) => t.split === "test").length;
  console.log(`\n✓ dataset.json updated — ${dataset.tickets.length} records (dev ${dev} / test ${test}).`);
}

main().catch((err) => { console.error(err); process.exit(1); });
