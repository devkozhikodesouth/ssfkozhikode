import { NextRequest, NextResponse } from "next/server";

/*
 * Grand Conclave (2025 + 26) is closed to the public.
 * Its pages and public APIs 404 for everyone; the public APIs stay
 * available to logged-in admins because admin GC pages reuse them.
 * Exception: the GC26 division pages (/gc26/division/<code>) and the
 * APIs they read stay public so each division can see its delegates.
 * Data is untouched in the database.
 */
const HIDDEN_GC_PAGES = [/^\/grandconclave(26)?(\/|$)/, /^\/gc(26)?(\/|$)/];
const HIDDEN_GC_APIS = [/^\/api\/grandconclave(26)?(\/|$)/, /^\/api\/gc(26)?(\/|$)/];
const PUBLIC_GC26_DIVISION = [
  /^\/gc26\/division\/[^/]+\/?$/,
  /^\/api\/gc26\/divdelegates\/[^/]+\/?$/,
  /^\/api\/gc26\/sector\/[^/]+\/?$/,
  /^\/api\/gc26\/sector\/studentsdata\/[^/]+\/?$/,
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  if (PUBLIC_GC26_DIVISION.some((re) => re.test(pathname))) {
    return NextResponse.next();
  }

  if (HIDDEN_GC_PAGES.some((re) => re.test(pathname))) {
    return NextResponse.rewrite(new URL("/_not-found", req.url), { status: 404 });
  }

  if (HIDDEN_GC_APIS.some((re) => re.test(pathname))) {
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }
    return NextResponse.next();
  }

  const isPublicAuthPage =
    pathname === "/adminlogin/login" ||
    pathname === "/adminlogin/forgot-password" ||
    pathname === "/adminlogin/reset-password";

  // 1. Unauthenticated user trying to access protected /adminlogin route
  if (!token && !isPublicAuthPage && pathname.startsWith("/adminlogin")) {
    const loginUrl = new URL("/adminlogin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Already logged in user trying to access public auth page (login/forgot/reset)
  if (token && isPublicAuthPage) {
    const dashboardUrl = new URL("/adminlogin/fund/executive", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/adminlogin",
    "/adminlogin/:path*",
    "/grandconclave",
    "/grandconclave/:path*",
    "/grandconclave26",
    "/grandconclave26/:path*",
    "/gc/:path*",
    "/gc26/:path*",
    "/api/grandconclave",
    "/api/grandconclave/:path*",
    "/api/grandconclave26",
    "/api/grandconclave26/:path*",
    "/api/gc/:path*",
    "/api/gc26/:path*",
  ],
};
