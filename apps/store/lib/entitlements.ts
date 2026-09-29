export type Belt = "white-belt" | "brown-belt" | "black-belt";

export type Entitlements = {
  user_id: string;
  belt: Belt;
  unlocked_grounds: string[];
  owned_addons: string[];
};

export type EntitlementsResult =
  | { ok: true; data: Entitlements }
  | { ok: false; error: string };

export async function getEntitlements(apiUrl: string): Promise<EntitlementsResult> {
  try {
    const res = await fetch(`${apiUrl}/entitlements/me`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { ok: false, error: `The API returned ${res.status}.` };
    }
    const data = (await res.json()) as Entitlements;
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Could not reach the API." };
  }
}