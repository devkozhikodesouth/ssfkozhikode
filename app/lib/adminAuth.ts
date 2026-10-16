import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ssf-kozhikode-secret-jwt-key-2026";

/* True when the request carries a valid admin session cookie */
export function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get("token")?.value;
  if (!token) return false;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded?.role === "admin";
  } catch {
    return false;
  }
}
