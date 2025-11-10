import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";
import Unit from "@/app/models/Unit";
import Student from "@/app/models/Students";

// ✅ The `context` type is relaxed to support both Promise and object forms
export async function GET(
  req: NextRequest,
  context: { params: { divisionName: string } } | { params: Promise<{ divisionName: string }> }
) {
  try {
    await connectDB();

    // ✅ Safely handle both cases (Promise vs object)
    const params =
      typeof (context.params as any)?.then === "function"
        ? await (context.params as Promise<{ divisionName: string }>)
        : (context.params as { divisionName: string });

    const { divisionName } = params;

    if (!divisionName) {
      return NextResponse.json(
        { error: "Invalid division name" },
        { status: 400 }
      );
    }

    const rawName = decodeURIComponent(divisionName.trim());

    const escapeForRegex = (s: string) =>
      s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeRegex = new RegExp(`^${escapeForRegex(rawName)}$`, "i");

    const division = await Division.findOne({
      divisionName: { $regex: safeRegex },
    });

    if (!division) {
      return NextResponse.json(
        { error: `Division '${rawName}' not found` },
        { status: 404 }
      );
    }

    const sectors = await Sector.find({ divisionId: division._id });

    const sectorData = await Promise.all(
      sectors.map(async (sector) => {
        const units = await Unit.find({ sectorId: sector._id });
        const unitIds = units.map((u) => u._id);

        const studentCount = await Student.countDocuments({
          unitId: { $in: unitIds },
        });

        return {
          sectorName: sector.sectorName,
          studentCount,
        };
      })
    );

    const totalStudents = sectorData.reduce(
      (sum, s) => sum + s.studentCount,
      0
    );

    return NextResponse.json({
      divisionName: division.divisionName,
      totalStudents,
      sectors: sectorData,
    });
  } catch (error) {
    console.error("Error fetching division data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
