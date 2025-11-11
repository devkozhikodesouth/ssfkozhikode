import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Unit from "@/app/models/Unit";
import Student from "@/app/models/Students";

export async function GET(
  req: NextRequest,
  context:
    | { params: { divisionName: string } }
    | { params: Promise<{ divisionName: string }> }
) {
  try {
    await connectDB();

    // ✅ Handle both Promise and object forms for params
    const params =
      typeof (context.params as any)?.then === "function"
        ? await (context.params as Promise<{ divisionName: string }>)
        : (context.params as { divisionName: string });

    const { divisionName } = params;

    if (!divisionName) {
      return NextResponse.json(
        { success: false, error: "Invalid division name" },
        { status: 400 }
      );
    }

    const rawName = decodeURIComponent(divisionName.trim());

    // ✅ Safe regex to handle case-insensitive match
    const escapeForRegex = (s: string) =>
      s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeRegex = new RegExp(`^${escapeForRegex(rawName)}$`, "i");

    // ✅ Find division document
    const division = await Division.findOne({
      divisionName: { $regex: safeRegex },
    });

    if (!division) {
      return NextResponse.json(
        { success: false, error: `Division '${rawName}' not found` },
        { status: 404 }
      );
    }

    // ✅ Find all units under this division
    const units = await Unit.find({ divisionId: division._id });

    // ✅ Count students for each unit
    const unitData = await Promise.all(
      units.map(async (unit) => {
        const studentCount = await Student.countDocuments({
          unitId: unit._id,
        });

        return {
          unitName: unit.unitName,
          studentCount,
        };
      })
    );

    // ✅ Calculate total students in division
    const totalStudents = unitData.reduce(
      (sum, u) => sum + u.studentCount,
      0
    );

    // ✅ Final JSON response
    return NextResponse.json({
      success: true,
      divisionName: division.divisionName,
      totalStudents,
      units: unitData,
    });
  } catch (error) {
    console.error("Error fetching division unit data:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
