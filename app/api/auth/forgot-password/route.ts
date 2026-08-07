import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/app/lib/mongodb";
import Admin, { ensureDefaultAdmin } from "@/app/models/Admin";

const JWT_SECRET = process.env.JWT_SECRET || "ssf-kozhikode-secret-jwt-key-2026";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await ensureDefaultAdmin();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email address is required" },
        { status: 400 }
      );
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      // Return vague message for security or helpful message
      return NextResponse.json(
        { message: "If an account with that email exists, a reset link was generated." },
        { status: 200 }
      );
    }

    // Generate 15-minute JWT reset token
    const resetToken = jwt.sign(
      { id: admin._id, email: admin.email, purpose: "reset-password" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    admin.resetToken = resetToken;
    admin.resetTokenExpiry = resetTokenExpiry;
    await admin.save();

    // Construct reset link URL
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const resetUrl = `${origin}/adminlogin/reset-password?token=${encodeURIComponent(
      resetToken
    )}&email=${encodeURIComponent(admin.email)}`;

    return NextResponse.json({
      success: true,
      message: "Password reset token generated successfully",
      resetUrl,
      token: resetToken,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Failed to generate password reset token" },
      { status: 500 }
    );
  }
}
