import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.pathname;

  // Allow access to login page
  if (url === "/admin/login") {
    // If already logged in, redirect to dashboard
    if (token) {
      try {
        jwt.verify(token, JWT_SECRET);
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } catch {
        // Invalid token, allow access to login
      }
    }
    return NextResponse.next();
  }

  // Protect all other /admin routes
  if (url.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

