import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import GrandConclave from "@/app/models/GrandConclave";

export async function GET() {
  try {
    await connectDB();

    const divisions = await Division.find({}, { divisionName: 1 }).lean();

    const stats = await GrandConclave.aggregate([
      {
        $group: {
          _id: {
            divisionId: "$divisionId",
            hasSector: {
              $cond: [{ $ifNull: ["$sectorId", false] }, true, false],
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const map = new Map<string, { divisionOnly: number; sectorBased: number }>();

    stats.forEach((item) => {
      const divisionId = String(item._id.divisionId);
      if (!map.has(divisionId)) {
        map.set(divisionId, { divisionOnly: 0, sectorBased: 0 });
      }

      if (item._id.hasSector) {
        map.get(divisionId)!.sectorBased += item.count;
      } else {
        map.get(divisionId)!.divisionOnly += item.count;
      }
    });

    const result = divisions.map((d) => {
      const counts = map.get(String(d._id)) || {
        divisionOnly: 0,
        sectorBased: 0,
      };

      return {
        _id: d._id,
        divisionName: d.divisionName,
        divisionRegistered: counts.divisionOnly,
        sectorRegistered: counts.sectorBased,
        totalRegistered: counts.divisionOnly + counts.sectorBased,
      };
    });

    return NextResponse.json({ success: true, divisions: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch division summary" },
      { status: 500 }
    );
  }
}
