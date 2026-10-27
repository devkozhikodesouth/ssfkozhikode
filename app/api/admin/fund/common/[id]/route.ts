import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import { isAdmin } from "@/app/lib/adminAuth";
import FundCommonEntry from "@/app/models/FundCommonEntry";

export const runtime = "nodejs";

/* DELETE : remove an entry saved by mistake (its receipt number is not reused) */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid entry" }, { status: 400 });
    }
    await FundCommonEntry.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Common collection delete error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete entry" }, { status: 500 });
  }
}
