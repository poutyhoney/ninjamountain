import { triageTicket } from "@ninjamountain/triage";
import type { Ticket } from "@ninjamountain/triage";

// The Anthropic SDK requires the Node.js runtime (not Edge).
export const runtime = "nodejs";

function isValidTicket(value: unknown): value is Ticket {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.subject === "string" &&
    record.subject.trim() !== "" &&
    typeof record.body === "string" &&
    record.body.trim() !== ""
  );
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { ok: false, reason: "api_failure", lastErrors: ["ANTHROPIC_API_KEY is not configured on the server."] },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, reason: "invalid_schema", lastErrors: ["Request body must be valid JSON."] },
      { status: 400 }
    );
  }

  if (!isValidTicket(body)) {
    return Response.json(
      { ok: false, reason: "invalid_schema", lastErrors: ["Both 'subject' and 'body' are required and must be non-empty strings."] },
      { status: 400 }
    );
  }

  const outcome = await triageTicket({ subject: body.subject, body: body.body });

  // triageTicket never throws; map a failed outcome to a 502 so the client can
  // distinguish a model/API failure from a successful triage.
  return Response.json(outcome, { status: outcome.ok ? 200 : 502 });
}
