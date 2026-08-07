import mongoose, { Schema, models } from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new Schema(
  {
    name: {
      type: String,
      default: "Admin User",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Admin = models.Admin || mongoose.model("Admin", adminSchema);

/**
 * Helper function to ensure at least one admin account exists.
 * If no admin exists, creates default: admin@gmail.com / admin123
 */
export async function ensureDefaultAdmin() {
  const count = await Admin.countDocuments();
  if (count === 0) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await Admin.create({
      name: "Super Admin",
      email: "admin@south.com",
      password: hashedPassword,
    });
    console.log("✅ Default admin created: admin@south.com");
  }
}

export default Admin;
