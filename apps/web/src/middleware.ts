import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Sync endpoints (POST) require API_SECRET
  if (request.nextUrl.pathname.startsWith("/api/t4s/sync")) {
    const authHeader = request.headers.get("authorization");
    const apiSecret = process.env.API_SECRET;

    if (!apiSecret) {
      return NextResponse.json(
        { success: false, error: "Server misconfigured: API_SECRET not set" },
        { status: 500 },
      );
    }

    if (authHeader !== `Bearer ${apiSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  // PUT/DELETE requests require API_SECRET
  if (request.method === "PUT" || request.method === "DELETE") {
    const authHeader = request.headers.get("authorization");
    const apiSecret = process.env.API_SECRET;

    if (!apiSecret || authHeader !== `Bearer ${apiSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
