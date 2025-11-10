import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";
import Unit from "@/app/models/Unit";
import Student from "@/app/models/Students";

export async function GET(
  req: Request,
  { params }: { params: { divisionName: string } }
) {
  try {
    await connectDB();

    // ✅ Unwrap params
    const { divisionName } = await params;

    console.log("Resolved Division:", divisionName);

    if (!divisionName) {
      return NextResponse.json(
        { error: `Invalid division name '${divisionName}'` },
        { status: 400 }
      );
    }

    // ✅ Find Division (case-insensitive)
    const division = await Division.findOne({
      divisionName: { $regex: new RegExp(`^${divisionName}$`, "i") },
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

    // ✅ Return clean response
    return NextResponse.json({
      divisionName: division.divisionName, // if exists in schema
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
