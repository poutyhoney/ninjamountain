// Shared Voyage embeddings client for scripts/embed.ts and src/retrieve.ts.
// Retries on 429 (rate limit) with exponential backoff — same pattern as
// client.ts's handling of Anthropic API errors, needed here for real: Voyage's
// free tier (no payment method on file) caps requests at 3/minute.
const EMBED_MODEL = "voyage-3";

export async function embedTexts(
  texts: string[],
  { maxRetries = 4 }: { maxRetries?: number } = {}
): Promise<number[][]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: texts, model: EMBED_MODEL }),
    });

    if (res.ok) {
      const data = (await res.json()) as { data: { embedding: number[] }[] };
      return data.data.map((d) => d.embedding);
    }

    if (res.status === 429 && attempt < maxRetries) {
      // Voyage's free-tier limit is 3 requests/minute — back off well past a
      // second, not the 1s/2s/4s used for Anthropic's much higher limits.
      const backoffMs = 20_000 * attempt; // 20s, 40s, 60s
      console.warn(`Voyage rate limited (429), retry ${attempt}/${maxRetries} in ${backoffMs / 1000}s`);
      await new Promise((r) => setTimeout(r, backoffMs));
      continue;
    }

    throw new Error(`Voyage API error ${res.status}: ${await res.text()}`);
  }

  throw new Error("embedTexts: exhausted retries");
}
