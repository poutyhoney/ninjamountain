import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { EMBED_MODEL, embedTexts } from "../../src/embeddings-client";
import type { EmbedQuery } from "../../src/index";

const CACHE_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../.cache/query-embeddings.json"
);
const BATCH_SIZE = 10;

type Cache = Record<string, number[]>;

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

const cache = loadCache();

export async function warmEmbeddingCache(texts: string[]): Promise<void> {
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
    saveCache();
  }
}

export const cachedEmbedQuery: EmbedQuery = async (text) => {
  const hit = cache[keyFor(text)];
  if (hit) return hit;
  const [vector] = await embedTexts([text]);
  cache[keyFor(text)] = vector;
  saveCache();
  return vector;
};