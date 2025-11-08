import { NextResponse } from "next/server";

import Student from "../../models/Students";
import { connectDB } from "@/app/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    const result = await Student.aggregate([
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

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
