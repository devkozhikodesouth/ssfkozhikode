import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import GrandConclave from "@/app/models/GrandConclave";

export async function GET() {
  try {
    await connectDB();

    // Division wise + attendance counted
    const divisions = await GrandConclave.aggregate([
      {
        $lookup: {
          from: "units",
          localField: "unitId",
          foreignField: "_id",
          as: "unitData",
        },
      },
      { $unwind: "$unitData" },
      {
        $lookup: {
          from: "divisions",
          localField: "unitData.divisionId",
          foreignField: "_id",
          as: "divisionData",
        },
      },
      { $unwind: "$divisionData" },
      {
        $group: {
          _id: "$divisionData._id",
          divisionName: { $first: "$divisionData.divisionName" },
          totalStudents: { $sum: 1 },
          attendanceMarked: {
            $sum: {
              $cond: [{ $eq: ["$attendance", true] }, 1, 0]
            }
          }
        },
      },
      { $sort: { divisionName: 1 } },
    ]);

    // Total students count
    const totalResult = await GrandConclave.aggregate([{ $count: "totalStudents" }]);
    const totalStudents = totalResult[0]?.totalStudents || 0;

    // Total Attendance marked
    const attendanceTotalResult = await GrandConclave.aggregate([
      { $match: { attendance: true } },
      { $count: "attendanceMarked" },
    ]);
    const attendanceTotal = attendanceTotalResult[0]?.attendanceMarked || 0;

    return NextResponse.json({ divisions, totalStudents, attendanceTotal });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
