import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("admin123", 10);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (email !== ADMIN_EMAIL)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!valid)
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, { expiresIn: "1h" });

    // Set cookie on the response. Return JSON so fetch() receives a 200 and the
    // browser can persist the Set-Cookie header. The client will then redirect
    // client-side to avoid opaqueredirect issues with fetch + redirect: 'manual'.
    const res = NextResponse.json({ success: true, redirect: "/admin/dashboard" });
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });

    console.log("✅ Admin logged in, cookie set; returning JSON for client-side redirect");
    return res;
  } catch (error) {
    console.error("🔥 Login error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
