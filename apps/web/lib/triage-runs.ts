import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { Category, RunFile, Severity } from "@ninjamountain/triage";

const TRIAGE_DIR   = join(process.cwd(), "../../packages/triage");
const RUNS_DIR     = join(TRIAGE_DIR, "runs");
const DATASET_PATH = join(TRIAGE_DIR, "experiments/data/dataset.json");

export interface DatasetTicket {
  id:      string;
  subject: string;
  body:    string;
  gold:    { category: Category; severity: Severity; notes?: string } | null;
}

export function loadRuns(): RunFile[] {
  return readdirSync(RUNS_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(readFileSync(join(RUNS_DIR, file), "utf8")) as RunFile)
    .filter((run) => run.version === 1)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function loadRun(runId: string): RunFile | undefined {
  return loadRuns().find((run) => run.runId === runId);
}

export function loadTicket(id: string): DatasetTicket | undefined {
  const { tickets } = JSON.parse(readFileSync(DATASET_PATH, "utf8")) as { tickets: DatasetTicket[] };
  return tickets.find((ticket) => ticket.id === id);
}

export function runTicketIds(): string[] {
  const ids = loadRuns().flatMap((run) => run.rows.map((row) => row.id));
  return [...new Set(ids)].sort();
}