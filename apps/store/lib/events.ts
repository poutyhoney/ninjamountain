import "server-only";

export type StoreEventName = "experiment_viewed" | "checkout_started";
export async function name(
  eventName: StoreEventName,
  visitorId: string,
  properties: Record<string, string> = {},
): Promise<void> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return;
  }

  try {
    await fetch(`${apiUrl}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        visitor_id: visitorId,
        properties,
      }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    return;
  }
}
