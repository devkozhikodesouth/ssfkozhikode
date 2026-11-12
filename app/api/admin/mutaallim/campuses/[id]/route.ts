import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import { isAdmin } from "@/app/lib/adminAuth";
import Campus from "@/app/models/Campus";
import { campusNameSchema } from "@/app/utils/mutaallim";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* PATCH : edit name / isActive / sortOrder. Campuses are deactivated, never deleted,
 * so existing registrations keep their campus. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
    }
    await connectDB();
    const body = await req.json();
    const update: Record<string, any> = {};
    if (typeof body.name === "string") {
      const parsed = campusNameSchema.safeParse(body.name);
      if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
      update.name = parsed.data;
    }
    if (typeof body.isActive === "boolean") update.isActive = body.isActive;
    if (Number.isFinite(body.sortOrder)) update.sortOrder = body.sortOrder;
    if (!Object.keys(update).length) {
      return NextResponse.json({ success: false, message: "Nothing to update" }, { status: 400 });
    }
    const campus = await Campus.findByIdAndUpdate(id, update, { new: true });
    if (!campus) return NextResponse.json({ success: false, message: "Campus not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, message: "Another campus in this division has that name" }, { status: 409 });
    }
    console.error("Campus update error:", error);
    return NextResponse.json({ success: false, message: "Failed to update campus" }, { status: 500 });
  }
}
