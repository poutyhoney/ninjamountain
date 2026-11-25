import { isRecord, type TwilioClient } from "./client";

const API_BASE = "https://api.twilio.com";
const MAX_PAGES = 100;

export async function listAll<T>(
  client: TwilioClient,
  firstUrl: string,
  key: string,
): Promise<T[]> {
  const items: T[] = [];
  let url: string | undefined = firstUrl;
  let pages = 0;

  while (url) {
    if (pages >= MAX_PAGES)
      throw new Error(`Stopped after ${MAX_PAGES} pages at ${firstUrl}`);

    const page = await client.get<Record<string, unknown>>(url);
    const batch = page[key];
    if (!Array.isArray(batch))
      throw new Error(`Expected an array at "${key}" in ${url}`);

    items.push(...(batch as T[]));
    url = nextUrl(page);
    pages += 1;
  }

  return items;
}

export function nextUrl(page: Record<string, unknown>): string | undefined {
  const meta = page.meta;
  if (isRecord(meta) && typeof meta.next_page_url === "string")
    return meta.next_page_url;
  if (typeof page.next_page_uri === "string")
    return new URL(page.next_page_uri, API_BASE).toString();
  return undefined;
}
