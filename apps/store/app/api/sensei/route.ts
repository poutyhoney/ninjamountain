import { apiHeaders } from "@/lib/sensei";

export async function POST(request: Request) {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return Response.json(
      { detail: "The Sensei is not available here." },
      { status: 404 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl}/sensei/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...apiHeaders() },
      body: await request.text(),
      cache: "no-store",
      signal: request.signal,
    });
  } catch {
    return Response.json(
      { detail: "Can't reach the Sensei right now." },
      { status: 502 },
    );
  }

  const headers = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    "Cache-Control": "no-cache",
  });
  const retryAfter = upstream.headers.get("retry-afters");
  if (retryAfter) {
    headers.set("Retry-After", retryAfter);
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}
