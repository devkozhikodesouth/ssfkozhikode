import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import { isAdmin } from "@/app/lib/adminAuth";
import FundMember from "@/app/models/FundMember";
import FundEntry from "@/app/models/FundEntry";

export const runtime = "nodejs";

const unauthorized = () =>
  NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

/* PATCH : update { name?, active? } — target is fixed per group */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return unauthorized();
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid member" }, { status: 400 });
    }

    const body = await req.json();
    const update: Record<string, any> = {};
    if (body.name !== undefined) {
      const n = String(body.name).trim();
      if (!n) return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
      update.name = n;
    }
    if (body.active !== undefined) update.active = Boolean(body.active);

    const member = await FundMember.findByIdAndUpdate(id, update, { new: true });
    if (!member) {
      return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, message: "A member with this name already exists" }, { status: 409 });
    }
    console.error("Fund member update error:", error);
    return NextResponse.json({ success: false, message: "Failed to update member" }, { status: 500 });
  }
}

/* DELETE : only members with no entries (others should be deactivated) */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return unauthorized();
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid member" }, { status: 400 });
    }
    if (await FundEntry.exists({ memberId: id })) {
      return NextResponse.json(
        { success: false, message: "This member has entries. Deactivate instead of deleting." },
        { status: 409 }
      );
    }
    await FundMember.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fund member delete error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete member" }, { status: 500 });
  }
}
