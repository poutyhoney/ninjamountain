// Embeds every KB article in kb/*.md via Voyage and writes kb/embeddings.json.
// Run with: npm run kb:embed --workspace @ninjamountain/triage
import "./load-env";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { embedTexts } from "../src/embeddings-client";

const here = dirname(fileURLToPath(import.meta.url));
const KB_DIR = resolve(here, "../kb");
const OUTPUT_PATH = resolve(KB_DIR, "embeddings.json");

interface KbArticle {
  id: string;
  title: string;
  body: string;
}

// The KB files use simple frontmatter (---\nid: ...\ntitle: "..."\n---\nbody),
// not a full YAML parser — matches the project's minimal-dependency style, and
// the frontmatter here is deliberately small and flat.
function parseArticle(filename: string): KbArticle {
  const raw = readFileSync(join(KB_DIR, filename), "utf-8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: missing --- frontmatter block`);

  const [, frontmatter, body] = match;
  const idMatch = frontmatter.match(/^id:\s*(.+)$/m);
  const titleMatch = frontmatter.match(/^title:\s*"?(.*?)"?$/m);
  if (!idMatch || !titleMatch) {
    throw new Error(`${filename}: frontmatter missing id or title`);
  }

  return { id: idMatch[1].trim(), title: titleMatch[1].trim(), body: body.trim() };
}

async function main(): Promise<void> {
  const files = readdirSync(KB_DIR).filter((f) => f.endsWith(".md"));
  if (files.length === 0) throw new Error(`No KB articles found in ${KB_DIR}`);

  const articles = files.map(parseArticle);
  console.log(`Embedding ${articles.length} KB articles...`);

  const embeddings = await embedTexts(articles.map((a) => a.body));

  const output = articles.map((article, i) => ({
    id:        article.id,
    title:     article.title,
    body:      article.body,
    embedding: embeddings[i],
  }));

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Wrote ${output.length} embeddings to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
