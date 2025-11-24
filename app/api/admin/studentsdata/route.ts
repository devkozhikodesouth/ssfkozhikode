import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Sector from "@/app/models/Sector";
import Unit from "@/app/models/Unit";
import Student from "@/app/models/Students";;


export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const division = searchParams.get("division");

  if (!division) {
    return NextResponse.json(
      { success: false, message: "Division is required" },
      { status: 400 }
    );
  }

  try {
    const students = await Student.aggregate([
      // Join Unit table
      {
        $lookup: {
          from: "units",
          localField: "unitId",
          foreignField: "_id",
          as: "unit",
        },
      },
      { $unwind: "$unit" },

      // Join Division table through Unit.divisionId
      {
        $lookup: {
          from: "divisions",
          localField: "unit.divisionId",
          foreignField: "_id",
          as: "division",
        },
      },
      { $unwind: "$division" },

      // Join Sector table
      {
        $lookup: {
          from: "sectors",
          localField: "unit.sectorId",
          foreignField: "_id",
          as: "sector",
        },
      },
      { $unwind: "$sector" },

      // Match current division
      {
        $match: {
          "division.divisionName": division,
        },
      },

      // Final projection
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
          sector: "$sector.sectorName",
        },
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
