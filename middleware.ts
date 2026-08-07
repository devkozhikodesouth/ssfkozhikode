import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicAuthPage =
    pathname === "/adminlogin/login" ||
    pathname === "/adminlogin/forgot-password" ||
    pathname === "/adminlogin/reset-password";

  const token = req.cookies.get("token")?.value;

  // 1. Unauthenticated user trying to access protected /adminlogin route
  if (!token && !isPublicAuthPage && pathname.startsWith("/adminlogin")) {
    const loginUrl = new URL("/adminlogin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Already logged in user trying to access public auth page (login/forgot/reset)
  if (token && isPublicAuthPage) {
    const dashboardUrl = new URL("/adminlogin", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/adminlogin", "/adminlogin/:path*"],
};
