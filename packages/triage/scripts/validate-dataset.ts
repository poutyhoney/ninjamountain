/**
 * Invariant checker for dataset.json. Fails loudly (non-zero exit) on any violation of the
 * field rules in DATASET_SCHEMA.md §4. Intended as a pre-commit / CI gate.
 *
 *   npm run dataset:validate
 *
 * The checks themselves live in lib/validate.ts so `verify` can reuse them before writing.
 */
import { loadDataset } from "./lib/dataset";
import { validateDataset } from "./lib/validate";

function main(): void {
  const file = loadDataset();
  const { errors, warnings } = validateDataset(file);

  const labeled = file.tickets.filter((t) => t.gold != null).length;
  const dev = file.tickets.filter((t) => t.split === "dev").length;
  const test = file.tickets.filter((t) => t.split === "test").length;
  console.log(`Checked ${file.tickets.length} records (${labeled} labeled, dev ${dev} / test ${test}).`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);

  if (errors.length) {
    console.error(`\n✗ ${errors.length} invariant violation(s):`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log("✓ all invariants hold.");
}

main();
