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
    const { divisionName: rawDivisionCode } = await params;

    // ✅ Mapping of divisions and their unique codes
    const divisions: Record<string, string> = {
      Feroke: "fer-a3f9",
      Koduvally: "kod-b7x2",
      Kozhikode: "koz-c8m4",
      Kunnamangalam: "kun-d6r1",
      Mavoor: "mav-e2k9",
      Mukkam: "muk-f5n7",
      Narikkuni: "nar-g3q8",
      Omassery: "oma-h9t6",
      Poonoor: "poo-j1v4",
      Thamarassery: "tha-k8p2",
    };

    // ✅ Reverse lookup to get actual division name
    const code = decodeURIComponent(String(rawDivisionCode ?? "")).trim();
    const divisionName = Object.keys(divisions).find(
      (key) => divisions[key] === code
    );

    console.log("Requested Code:", code);
    console.log("Resolved Division:", divisionName);

    if (!divisionName) {
      return NextResponse.json(
        { error: `Invalid division code '${code}'` },
        { status: 400 }
      );
    }

    // ✅ Find Division (case-insensitive match)
    const division = await Division.findOne({
      divisionName: { $regex: new RegExp(`^${divisionName}$`, "i") },
    });

    if (!division) {
      return NextResponse.json(
        { error: `Division '${divisionName}' not found` },
        { status: 404 }
      );
    }

    // ✅ Get all sectors under division
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
      divisionName,
      code,
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
