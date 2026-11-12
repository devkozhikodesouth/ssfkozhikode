import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import Campus from "@/app/models/Campus";

export const dynamic = "force-dynamic";

/* GET ?divisionId=… : active campuses of a division, in sortOrder */
export async function GET(req: NextRequest) {
  try {
    const divisionId = req.nextUrl.searchParams.get("divisionId");
    if (!divisionId || !mongoose.isValidObjectId(divisionId)) {
      return NextResponse.json({ success: false, message: "divisionId required" }, { status: 400 });
    }
    await connectDB();
    const campuses = await Campus.find({ divisionId, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select("name")
      .lean();
    return NextResponse.json({
      success: true,
      data: campuses.map((c: any) => ({ _id: String(c._id), name: c.name })),
    });
  } catch (error) {
    console.error("Campus list error:", error);
    return NextResponse.json({ success: false, message: "Failed to load campuses" }, { status: 500 });
  }
}
