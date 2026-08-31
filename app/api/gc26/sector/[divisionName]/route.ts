import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";
import GrandConclave26 from "@/app/models/GrandConclave26";

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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ divisionName: string }> }
) {
  try {
    await connectDB();

    const { divisionName: rawDivisionName } = await params;
    const divisionParam = rawDivisionName ? decodeURIComponent(String(rawDivisionName)).trim() : "";

    if (!divisionParam) {
      return NextResponse.json(
        { error: "Invalid division name" },
        { status: 400 }
      );
    }

    // Resolve human-readable name from code or direct name
    const resolvedName =
      Object.keys(divisions).find(
        (key) =>
          divisions[key].toLowerCase() === divisionParam.toLowerCase() ||
          key.toLowerCase() === divisionParam.toLowerCase()
      ) || divisionParam;

    const division = await Division.findOne({
      divisionName: { $regex: new RegExp(`^${resolvedName}$`, "i") },
    });

    if (!division) {
      return NextResponse.json(
        { error: `Division '${divisionParam}' not found` },
        { status: 404 }
      );
    }

    const sectors = await Sector.find({ divisionId: division._id });

    if (!sectors || sectors.length === 0) {
      return NextResponse.json({
        divisionName: division.divisionName,
        sectors: [],
      });
    }

    const sectorList = await Promise.all(
      sectors.map(async (sector) => {
        const count = await GrandConclave26.countDocuments({
          sectorId: sector._id,
        });
        return {
          _id: sector._id,
          name: sector.sectorName,
          sectorName: sector.sectorName,
          count,
        };
      })
    );

    return NextResponse.json({
      divisionName: division.divisionName,
      divisionId: division._id,
      sectors: sectorList,
      totalSectors: sectorList.length,
    });
  } catch (error) {
    console.error("Error fetching GC26 division sector data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
