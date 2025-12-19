import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";
import GrandConclave from "@/app/models/GrandConclave";

export async function GET(
  req: Request,
  context: { params: Promise<{ divisionName: string }> }
) {
  try {
    await connectDB();

    // ✅ UNWRAP params (CRITICAL FIX)
    const { divisionName } = await context.params;

    const decodedDivisionName = decodeURIComponent(divisionName).trim();

    if (!decodedDivisionName) {
      return NextResponse.json(
        { error: "Invalid division name" },
        { status: 400 }
      );
    }

    const division = await Division.findOne({
      divisionName: { $regex: new RegExp(`^${decodedDivisionName}$`, "i") },
    });

    if (!division) {
      return NextResponse.json(
        { error: `Division '${decodedDivisionName}' not found` },
        { status: 404 }
      );
    }

    const sectors = await Sector.find({ divisionId: division._id }).lean();


    const sectorData = await Promise.all(
      sectors.map(async (sector) => {
        const registrations = await GrandConclave.find({
          sectorId: sector._id,
        })
          .select("name mobile designation organizationLevel attendance")
          .sort({ name: 1 })
          .lean();

        return {
          sectorName: sector.sectorName,
          registrations,
        };
      })
    );

    const totalStudents = sectorData.reduce(
      (sum, sector) => sum + sector.registrations.length,
      0
    );
    return NextResponse.json({
      divisionName: division.divisionName,
      sectors: sectorData,
      totalStudents
    });
  } catch (error) {
    console.error("Division API Error:",  error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
    