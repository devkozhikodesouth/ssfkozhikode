import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import GrandConclave from "@/app/models/GrandConclave";

export async function GET() {
  try {
    await connectDB();

    /* ---------------------------------------
     * Fetch divisions
     * ------------------------------------- */
    const divisions = await Division.find(
      {},
      { divisionName: 1 }
    ).lean();

    /* ---------------------------------------
     * Division-wise registration & attendance
     * ------------------------------------- */
    const stats = await GrandConclave.aggregate([
      {
        $group: {
          _id: {
            divisionId: "$divisionId",
            hasSector: {
              $cond: [
                { $ifNull: ["$sectorId", false] },
                true,
                false,
              ],
            },
          },
          registeredCount: { $sum: 1 },
          attendedCount: {
            $sum: {
              $cond: [
                { $eq: ["$attendance", true] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    /* ---------------------------------------
     * Normalize stats into a map
     * ------------------------------------- */
    const divisionMap = new Map<
      string,
      {
        divisionRegistered: number;
        sectorRegistered: number;
        divisionAttended: number;
        sectorAttended: number;
      }
    >();

    for (const item of stats) {
      const divisionId = String(item._id.divisionId);

      if (!divisionMap.has(divisionId)) {
        divisionMap.set(divisionId, {
          divisionRegistered: 0,
          sectorRegistered: 0,
          divisionAttended: 0,
          sectorAttended: 0,
        });
      }

      const entry = divisionMap.get(divisionId)!;

      if (item._id.hasSector) {
        entry.sectorRegistered += item.registeredCount;
        entry.sectorAttended += item.attendedCount;
      } else {
        entry.divisionRegistered += item.registeredCount;
        entry.divisionAttended += item.attendedCount;
      }
    }

    /* ---------------------------------------
     * Build final division response
     * ------------------------------------- */
    const divisionSummary = divisions.map((d) => {
      const c = divisionMap.get(String(d._id)) || {
        divisionRegistered: 0,
        sectorRegistered: 0,
        divisionAttended: 0,
        sectorAttended: 0,
      };

      return {
        _id: d._id,
        divisionName: d.divisionName,

        divisionRegistered: c.divisionRegistered,
        sectorRegistered: c.sectorRegistered,
        totalRegistered:
          c.divisionRegistered + c.sectorRegistered,

        divisionAttended: c.divisionAttended,
        sectorAttended: c.sectorAttended,
        totalAttended:
          c.divisionAttended + c.sectorAttended,
      };
    });

    /* ---------------------------------------
     * Overall grand totals
     * ------------------------------------- */
    const overall = await GrandConclave.aggregate([
      {
        $group: {
          _id: null,
          totalRegistered: { $sum: 1 },
          totalAttended: {
            $sum: {
              $cond: [
                { $eq: ["$attendance", true] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    /* ---------------------------------------
     * Final response
     * ------------------------------------- */
    return NextResponse.json({
      success: true,
      divisions: divisionSummary,
      overall: {
        totalRegistered: overall[0]?.totalRegistered || 0,
        totalAttended: overall[0]?.totalAttended || 0,
      },
    });
  } catch (error) {
    console.error("Division summary error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch division summary",
      },
      { status: 500 }
    );
  }
}
