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

    // Extract and validate params
    const { divisionName: rawDivisionName } = await params;
    const divisionName = decodeURIComponent(String(rawDivisionName ?? "")).trim();

    if (!divisionName) {
      return NextResponse.json(
        { error: "Invalid division name" },
        { status: 400 }
      );
    }

    // Find division (case-insensitive)
    const division = await Division.findOne({
      divisionName: { $regex: new RegExp(`^${divisionName}$`, "i") },
    });

    if (!division) {
      return NextResponse.json(
        { error: `Division '${divisionName}' not found` },
        { status: 404 }
      );
    }

    // Find Sectors in the division
    const sectors = await Sector.find({ divisionId: division._id });

    // Create sector response with units and student counts
    const sectorData = await Promise.all(
      sectors.map(async (sector) => {
        const units = await Unit.find({ sectorId: sector._id });

        // For each unit, count students
        const unitDetails = await Promise.all(
          units.map(async (unit) => {
            const unitCount = await Student.countDocuments({ unitId: unit._id });
            return {
              unitName: unit.unitName,
              unitCount,
            };
          })
        );

        // Calculate total sector students
        const studentCount = unitDetails.reduce(
          (sum, unit) => sum + unit.unitCount,
          0
        );

        return {
          sectorName: sector.sectorName,
          studentCount,
          units: unitDetails, // include unit list
        };
      })
    );

    // Total division student count
    const totalStudents = sectorData.reduce(
      (sum, s) => sum + s.studentCount,
      0
    );

    // Final API response
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
