import { type NextRequest, NextResponse } from "next/server";

import { VISITOR_COOKIE, VISITOR_HEADER } from "@/lib/visitor";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  if (!process.env.GROWTHBOOK_CLIENT_KEY) {
    return NextResponse.next();
  }

  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = existing ?? crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(VISITOR_HEADER, visitorId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (!existing) {
    response.cookies.set({
      name: VISITOR_COOKIE,
      value: visitorId,
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: ONE_YEAR_SECONDS,
    });
  }

  return response;
}

export const config = {
  matcher: "/",
};
