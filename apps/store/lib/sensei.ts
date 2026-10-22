import "server-only";

import type { Challenge } from "@/lib/sensei-types";

export type ChallengesResult =
  | { ok: true; data: Challenge[] }
  | { ok: false; error: string };

export function apiHeaders(): Record<string, string> {
  const token = process.env.API_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getChallenges(apiUrl: string): Promise<ChallengesResult> {
  try {
    const res = await fetch(`${apiUrl}/sensei/challenges`, {
      cache: "no-store",
      headers: apiHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { ok: false, error: `The API returned ${res.status}.` };
    }
    const data = (await res.json()) as Challenge[];
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Could not reach the API." };
  }
}
