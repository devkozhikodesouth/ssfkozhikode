import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";
import GrandConclave26 from "@/app/models/GrandConclave26";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const divisionParam = searchParams.get("division")?.trim();

    // 1. Fetch all divisions for quick lookup and filtering
    const allDivisions = await Division.find({}, { divisionName: 1 }).lean();
    const divisionMap = new Map<string, string>();
    for (const div of allDivisions) {
      divisionMap.set(String(div._id), div.divisionName);
    }

    // 2. Build sector filter
    const sectorFilter: Record<string, any> = {};
    if (divisionParam && divisionParam.toLowerCase() !== "all") {
      const matchedDiv = allDivisions.find(
        (d) => d.divisionName.toLowerCase() === divisionParam.toLowerCase()
      );
      if (matchedDiv) {
        sectorFilter.divisionId = matchedDiv._id;
      }
    }

    // 3. Fetch sectors
    const sectors = await Sector.find(sectorFilter)
      .populate("divisionId", "divisionName")
      .lean();

    // 4. Aggregate GrandConclave26 registrations by sectorId
    const stats = await GrandConclave26.aggregate([
      {
        $match: {
          sectorId: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$sectorId",
          registeredCount: { $sum: 1 },
          attendedCount: {
            $sum: {
              $cond: [{ $eq: ["$attendance", true] }, 1, 0],
            },
          },
        },
      },
    ]);

    const statMap = new Map<
      string,
      { registeredCount: number; attendedCount: number }
    >();
    for (const item of stats) {
      if (item._id) {
        statMap.set(String(item._id), {
          registeredCount: item.registeredCount || 0,
          attendedCount: item.attendedCount || 0,
        });
      }
    }

    // 5. Combine sectors with registration counts
    const sectorList = sectors.map((sec: any) => {
      const secId = String(sec._id);
      const stat = statMap.get(secId) || { registeredCount: 0, attendedCount: 0 };
      const divName =
        sec.divisionId?.divisionName ||
        divisionMap.get(String(sec.divisionId)) ||
        "Unknown";

      return {
        _id: secId,
        sectorName: sec.sectorName,
        divisionId: String(sec.divisionId?._id || sec.divisionId || ""),
        divisionName: divName,
        registeredCount: stat.registeredCount,
        attendedCount: stat.attendedCount,
      };
    });

    // Default sort: highest registered count first, then alphabetical sectorName
    sectorList.sort((a, b) => {
      if (b.registeredCount !== a.registeredCount) {
        return b.registeredCount - a.registeredCount;
      }
      return a.sectorName.localeCompare(b.sectorName);
    });

    const totalRegistered = sectorList.reduce((sum, s) => sum + s.registeredCount, 0);
    const totalAttended = sectorList.reduce((sum, s) => sum + s.attendedCount, 0);

    return NextResponse.json({
      success: true,
      sectors: sectorList,
      summary: {
        totalSectors: sectorList.length,
        totalRegistered,
        totalAttended,
        divisions: allDivisions.map((d) => d.divisionName).sort(),
      },
    });
  } catch (error: any) {
    console.error("Grand Conclave 26 Sector-wise Summary API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch sector-wise registration counts",
      },
      { status: 500 }
    );
  }
}
