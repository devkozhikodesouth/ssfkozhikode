import { NextResponse } from "next/server";
import Student from "../../../models/Students";
import { connectDB } from "@/app/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    // Step 1️⃣ — Aggregate division-wise counts
    const divisions = await Student.aggregate([
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
        },
      },
      { $sort: { divisionName: 1 } },
    ]);

    // Step 2️⃣ — Calculate grand total using aggregation
    const totalResult = await Student.aggregate([
      { $count: "totalStudents" },
    ]);

    const totalStudents = totalResult[0]?.totalStudents || 0;

    // Step 3️⃣ — Return both
    return NextResponse.json({ divisions, totalStudents });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
