import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";

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

    if (!sectors || sectors.length === 0) {
      return NextResponse.json({
        divisionName: division.divisionName,
        sectors: [],
      });
    }

    // 4️⃣ Format sector list with details
    const sectorList = sectors.map((sector) => ({
      _id: sector._id,
      name: sector.sectorName,
      sectorName: sector.sectorName,
    }));

    // ✅ Return sector list response
    return NextResponse.json({
      divisionName: division.divisionName,
      divisionId: division._id,
      sectors: sectorList,
      totalSectors: sectorList.length,
    });
  } catch (error) {
    console.error("Error fetching division data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
