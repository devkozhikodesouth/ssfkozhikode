import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import { isAdmin } from "@/app/lib/adminAuth";
import Division from "@/app/models/Division";
import Campus from "@/app/models/Campus";
import { campusNameSchema } from "@/app/utils/mutaallim";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

/* GET : all campuses (active + inactive) */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    await connectDB();
    const campuses = await Campus.find({}).sort({ sortOrder: 1, name: 1 }).lean<any[]>();
    return NextResponse.json({
      success: true,
      campuses: campuses.map((c) => ({
        _id: String(c._id),
        name: c.name,
        divisionId: String(c.divisionId),
        isActive: c.isActive,
        sortOrder: c.sortOrder,
      })),
    });
  } catch (error) {
    console.error("Admin campus list error:", error);
    return NextResponse.json({ success: false, message: "Failed to load campuses" }, { status: 500 });
  }
}

/* POST : add a campus { divisionId, name } — appended at the end of the division's order */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    await connectDB();
    const { divisionId, name } = await req.json();
    const parsed = campusNameSchema.safeParse(name);
    if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    const clean = parsed.data;
    if (!mongoose.isValidObjectId(divisionId) || !(await Division.exists({ _id: divisionId }))) {
      return NextResponse.json({ success: false, message: "Invalid division" }, { status: 400 });
    }
    const last = await Campus.findOne({ divisionId }).sort({ sortOrder: -1 }).lean<any>();
    const campus = await Campus.create({
      divisionId,
      name: clean,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    });
    return NextResponse.json({ success: true, campus: { _id: String(campus._id) } });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, message: "This campus already exists in the division" }, { status: 409 });
    }
    console.error("Campus create error:", error);
    return NextResponse.json({ success: false, message: "Failed to add campus" }, { status: 500 });
  }
}
