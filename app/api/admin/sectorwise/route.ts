import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Sector from "@/app/models/Sector";
import Unit from "@/app/models/Unit";
import Student from "@/app/models/Students";

export async function GET() {
  try {
    await connectDB();

    const sectors = await Sector.find({})
      .populate("divisionId", "divisionName")
      .lean() as Array<any>;

    if (!sectors || sectors.length === 0) {
      return NextResponse.json({
        success: true,
        sectors: [],
        totalStudents: 0,
      });
    }

    const sectorCounts = await Promise.all(
      sectors.map(async (sector) => {
        const units = await Unit.find({ sectorId: sector._id }).select("_id")
        const unitIds = units.map((u) => u._id);

        const studentCount = await Student.countDocuments({
          unitId: { $in: unitIds },
        });

        const unitCount = units.length;

        return {
          divisionName: (sector.divisionId as any)?.divisionName || "Unknown",
          sectorName: sector.sectorName,
          unitCount,
          studentCount,
        };
      })
    );

    const totalStudents = sectorCounts.reduce(
      (sum, s) => sum + s.studentCount,
      0
    );

    return NextResponse.json({
      success: true,
      sectors: sectorCounts.sort((a, b) => b.studentCount - a.studentCount),
      totalStudents,
    });
  } catch (error) {
    console.error("Error fetching sector data:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error },
      { status: 500 }
    );
  }
}
