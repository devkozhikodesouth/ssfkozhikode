import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/mongodb";
import Admin from "@/app/models/Admin";

const JWT_SECRET = process.env.JWT_SECRET || "ssf-kozhikode-secret-jwt-key-2026";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 401 }
      );
    }

    if (decoded.purpose !== "reset-password") {
      return NextResponse.json(
        { message: "Invalid token purpose" },
        { status: 400 }
      );
    }

    const admin = await Admin.findOne({
      _id: decoded.id,
      resetToken: token,
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Invalid or already used token" },
        { status: 400 }
      );
    }

    if (admin.resetTokenExpiry && new Date(admin.resetTokenExpiry) < new Date()) {
      return NextResponse.json(
        { message: "Reset token has expired" },
        { status: 400 }
      );
    }

    // Hash new password and update admin
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    admin.resetToken = null;
    admin.resetTokenExpiry = null;
    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now login.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Server error resetting password" },
      { status: 500 }
    );
  }
}
