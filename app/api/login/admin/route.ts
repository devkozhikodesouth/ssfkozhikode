import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/mongodb";
import Admin, { ensureDefaultAdmin } from "@/app/models/Admin";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET || "ssf-kozhikode-secret-jwt-key-2026";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    let admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      // If no admin found, check if this is initial setup with 0 admins
      await ensureDefaultAdmin();
      admin = await Admin.findOne({ email: email.toLowerCase().trim() });
      if (!admin) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        );
      }
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isHttps =
      req.headers.get("x-forwarded-proto") === "https" ||
      req.nextUrl.protocol === "https:" ||
      (process.env.NODE_ENV === "production" &&
        !req.headers.get("host")?.includes("localhost") &&
        !req.headers.get("host")?.startsWith("192.168.") &&
        !req.headers.get("host")?.startsWith("10.") &&
        !req.headers.get("host")?.startsWith("172."));

    const res = NextResponse.json({
      success: true,
      message: "Login successful",
      redirect: "/adminlogin/gc26/totaldelegates",
    });

    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
