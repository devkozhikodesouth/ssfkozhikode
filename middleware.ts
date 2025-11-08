import { NextRequest, NextResponse } from "next/server";

// Middleware intentionally allows all requests. Admin routes are publicly accessible.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

