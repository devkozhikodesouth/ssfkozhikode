import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Sector from "@/app/models/Sector";
import Unit from "@/app/models/Unit";
import Student from "@/app/models/Students";;
export async function GET(req: Request) {
  await connectDB();
  try {
    const students = await Student.aggregate([
      {
        $match: { attendance: true }
      },

      {
        $lookup: {
          from: "units",
          localField: "unitId",
          foreignField: "_id",
          as: "unit"
        }
      },
      { $unwind: { path: "$unit", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "divisions",
          localField: "unit.divisionId",
          foreignField: "_id",
          as: "division"
        }
      },
      { $unwind: { path: "$division", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "sectors",
          localField: "unit.sectorId",
          foreignField: "_id",
          as: "sector"
        }
      },
      { $unwind: { path: "$sector", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          name: 1,
          phone: "$mobile",
          email: 1,
          school: 1,
          course: 1,
          year: 1,
          ticket: 1,
          unitName: "$unit.unitName",
          divisionName: "$division.divisionName",
          sector: "$sector.sectorName"
        }
      },

      { $sort: { name: 1 } },
    ]);

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error("Error fetching students", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
