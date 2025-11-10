import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";
import Unit from "@/app/models/Unit";
import Student from "@/app/models/Students";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ divisionName: string }> }
) {
  try {
    await connectDB();

    // ✅ Await params before using
    const { divisionName: rawDivisionName } = await params;

    // 1️⃣ Normalize and validate divisionName
    const divisionName = decodeURIComponent(String(rawDivisionName ?? "")).trim();

    console.log("Requested Division:", divisionName); // ✅ moved here

    if (!divisionName) {
      return NextResponse.json(
        { error: "Invalid division name" },
        { status: 400 }
      );
    }

    // 2️⃣ Find Division (case-insensitive match)
    const division = await Division.findOne({
      divisionName: { $regex: new RegExp(`^${divisionName}$`, "i") },
    });

    if (!division) {
      return NextResponse.json(
        { error: `Division '${divisionName}' not found` },
        { status: 404 }
      );
    }

    // 3️⃣ Find all sectors under the division
    const sectors = await Sector.find({ divisionId: division._id });

    // 4️⃣ For each sector, find all units and count students
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

    // 5️⃣ Calculate total students in division
    const totalStudents = sectorData.reduce(
      (sum, s) => sum + s.studentCount,
      0
    );

    // ✅ Return response
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
