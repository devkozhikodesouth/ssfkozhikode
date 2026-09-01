import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import GrandConclave26 from "@/app/models/GrandConclave26";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const designationQuery = searchParams.get("designation")?.trim();
    const searchQuery = searchParams.get("search")?.trim();

    // Query for district-level delegates
    const filter: Record<string, any> = {
      organizationLevel: { $regex: /^district$/i },
    };

    if (designationQuery && designationQuery !== "all") {
      filter.designation = { $regex: new RegExp(`^${designationQuery}$`, "i") };
    }

    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { mobile: { $regex: searchQuery, $options: "i" } },
        { ticket: { $regex: searchQuery, $options: "i" } },
        { designation: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const delegates = await GrandConclave26.find(filter)
      .select("name mobile designation organizationLevel attendance ticket createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Aggregations for all district-level delegates
    const allDistrictDelegates = await GrandConclave26.find({
      organizationLevel: { $regex: /^district$/i },
    })
      .select("designation attendance")
      .lean();

    const totalCount = allDistrictDelegates.length;
    const attendedCount = allDistrictDelegates.filter((d) => d.attendance).length;

    // Breakdown by designation
    const designationBreakdown: Record<string, { total: number; attended: number }> = {};
    for (const d of allDistrictDelegates) {
      const des = d.designation || "Unspecified";
      if (!designationBreakdown[des]) {
        designationBreakdown[des] = { total: 0, attended: 0 };
      }
      designationBreakdown[des].total += 1;
      if (d.attendance) {
        designationBreakdown[des].attended += 1;
      }
    }

    const designations = Object.keys(designationBreakdown).sort();

    return NextResponse.json({
      success: true,
      delegates,
      totalCount,
      attendedCount,
      designationBreakdown,
      designations,
    });
  } catch (error: any) {
    console.error("Grand Conclave 26 District Delegates API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch district delegates",
      },
      { status: 500 }
    );
  }
}
