// Fetches every page of a Twilio list endpoint and returns one flat array.
//
// Twilio has two paging styles, and this file hides the difference:
// - The 2010 API (phone numbers, TwiML Apps) returns a relative
//   `next_page_uri` at the top level of the page.
// - The v1 and v2 APIs (Studio, Conversations, Flex, Proxy) return an
//   absolute `meta.next_page_url`.
// collect.ts calls listAll() for every section. client.test.ts covers both
// styles.
import { isRecord, type TwilioClient } from "./client";

// Relative next_page_uri values are resolved against this host.
const API_BASE = "https://api.twilio.com";
// A safety stop. If the API ever returned a next link that pointed back at an
// earlier page, the loop would otherwise run forever. 100 pages at Twilio's
// default page size is far more than any of these lists should hold.
const MAX_PAGES = 100;

// Generic over T, the item type. `key` is the name of the array in the page
// body, which differs per endpoint ("incoming_phone_numbers", "flows",
// "address_configurations", and so on).
export async function listAll<T>(
  client: TwilioClient,
  firstUrl: string,
  key: string,
): Promise<T[]> {
  const items: T[] = [];
  // string | undefined: the loop ends when nextUrl() returns undefined.
  let url: string | undefined = firstUrl;
  let pages = 0;

  while (url) {
    if (pages >= MAX_PAGES)
      throw new Error(`Stopped after ${MAX_PAGES} pages at ${firstUrl}`);

    const page = await client.get<Record<string, unknown>>(url);
    const batch = page[key];
    // Fail loudly on a wrong key instead of returning an empty list. An empty
    // list would look like "this account has none", which is a wrong answer
    // that no test would notice.
    if (!Array.isArray(batch))
      throw new Error(`Expected an array at "${key}" in ${url}`);

    // The cast trusts the caller's T. The mappers in collect.ts check each
    // item's fields afterwards.
    items.push(...(batch as T[]));
    url = nextUrl(page);
    pages += 1;
  }

  return items;
}

// Exported so the tests can check each paging style directly.
export function nextUrl(page: Record<string, unknown>): string | undefined {
  // v1/v2 style first: an absolute URL inside a meta object.
  const meta = page.meta;
  if (isRecord(meta) && typeof meta.next_page_url === "string")
    return meta.next_page_url;
  // 2010 style: a path such as "/2010-04-01/Accounts/AC.../IncomingPhoneNumbers.json?Page=1".
  // The URL constructor joins it to the host.
  if (typeof page.next_page_uri === "string")
    return new URL(page.next_page_uri, API_BASE).toString();
  // Both styles use null on the last page, which fails the string checks and
  // lands here.
  return undefined;
}
