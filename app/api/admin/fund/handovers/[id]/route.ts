import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import { isAdmin } from "@/app/lib/adminAuth";
import FundHandover from "@/app/models/FundHandover";

export const runtime = "nodejs";

/* DELETE : remove a handover recorded by mistake */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid handover" }, { status: 400 });
    }
    await FundHandover.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fund handover delete error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete handover" }, { status: 500 });
  }
}
