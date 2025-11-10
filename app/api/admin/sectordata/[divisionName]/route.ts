import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";
import Unit from "@/app/models/Unit";
import Student from "@/app/models/Students";

export async function GET(
  req: NextRequest,
  { params }: { params: { divisionName: string } }
) {
  try {
    await connectDB();

    // ✅ No need for await — params is a plain object
    const { divisionName } = params;

    console.log("Resolved Division:", divisionName);

    if (!divisionName) {
      return NextResponse.json(
        { error: `Invalid division name '${divisionName}'` },
        { status: 400 }
      );
    }

    // ✅ Decode and escape incoming param, then do case-insensitive lookup
    const rawName = String(decodeURIComponent(divisionName || "")).trim();

    // Escape regex special characters to avoid injection or invalid regex
    const escapeForRegex = (s: string) => s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
    const safeRegex = new RegExp(`^${escapeForRegex(rawName)}$`, "i");

    const division = await Division.findOne({
      divisionName: { $regex: safeRegex },
    });

    if (!division) {
      return NextResponse.json(
        { error: `Division '${divisionName}' not found` },
        { status: 404 }
      );
    }

    // ✅ Get all sectors in this division
    const sectors = await Sector.find({ divisionId: division._id });

    // ✅ For each sector, count students
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

    // ✅ Return clean JSON response
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
