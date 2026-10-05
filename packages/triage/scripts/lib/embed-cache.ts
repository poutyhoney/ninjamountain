// Disk cache for query embeddings, used by score.ts.
//
// Why it exists: every triaged ticket embeds its text with Voyage for KB
// retrieval, and Voyage's free tier allows 3 requests per minute. A 22-ticket
// scored run at concurrency 5 stalled in 429 backoff. The ticket text is the
// same across providers and runs, so its embedding is too: fetch it once,
// in batches, and reuse it. Side benefit: both providers retrieve exactly the
// same KB articles, which makes the comparison stricter.
//
// Lives in scripts/, not src/, because it writes files. src/ also runs inside
// apps/web on Vercel, where the server cannot write to disk. src/ only exposes
// the injection seam (the EmbedQuery parameter on triageTicket).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { EMBED_MODEL, embedTexts } from "../../src/embeddings-client";
import type { EmbedQuery } from "../../src/index";

// packages/triage/.cache/ (gitignored): recomputable working state, not source.
const CACHE_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../.cache/query-embeddings.json"
);
// 10 texts per request keeps each request under the free tier's per-minute
// token cap. One giant batch could exceed it, and then no retry would help.
const BATCH_SIZE = 10;

// Cache key (hash) -> embedding vector.
type Cache = Record<string, number[]>;

// The model name is part of the key (cache invalidation by key versioning):
// switching embedding models makes every old entry miss, instead of returning
// vectors that do not match the KB's embeddings.
function keyFor(text: string): string {
  return createHash("sha256").update(`${EMBED_MODEL}\n${text}`).digest("hex").slice(0, 16);
}

function loadCache(): Cache {
  return existsSync(CACHE_PATH) ? (JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Cache) : {};
}

function saveCache(): void {
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache));
}

// Module-level state, loaded once on first import and shared by all of
// score.ts's concurrent workers. Node runs this JavaScript on one thread, so
// the workers cannot corrupt it by writing at the same moment.
const cache = loadCache();

// Called once before a scored run: embeds every uncached query up front, in
// batches, so the run itself makes no Voyage calls.
export async function warmEmbeddingCache(texts: string[]): Promise<void> {
  // new Set removes duplicate texts before checking the cache.
  const missing = [...new Set(texts)].filter((t) => !(keyFor(t) in cache));
  if (missing.length === 0) {
    console.log(`Embedding cache: all ${texts.length} queries cached.`);
    return;
  }

  console.log(`Embedding cache: ${missing.length} of ${texts.length} queries missing, fetching from Voyage…`);
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    const vectors = await embedTexts(batch);
    batch.forEach((text, j) => {
      cache[keyFor(text)] = vectors[j];
    });
    // Saved after every batch, not once at the end: if batch 3 fails,
    // batches 1 and 2 are kept and the next run only fetches the rest.
    saveCache();
  }
}

// Satisfies the EmbedQuery function type, so it can be injected into
// triageTicket({ embedQuery }). After warming it should always hit; the
// fallback fetch is a safety net, not the normal path.
export const cachedEmbedQuery: EmbedQuery = async (text) => {
  const hit = cache[keyFor(text)];
  if (hit) return hit;
  const [vector] = await embedTexts([text]);
  cache[keyFor(text)] = vector;
  saveCache();
  return vector;
};
