// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Middleware no longer restricts /admin routes. Allow all requests to proceed.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}
