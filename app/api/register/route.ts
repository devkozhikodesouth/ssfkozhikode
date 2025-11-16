import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Student from "@/app/models/Students";
import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";
import Unit from "@/app/models/Unit";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, mobile, email, school, course, year, division, sector, unit } = body;

    // 1️⃣ Find Division
    const divisionDoc = await Division.findOne({ divisionName: division });
    if (!divisionDoc) {
      return NextResponse.json(
        { success: false, message: "Invalid Division Selected" },
        { status: 400 }
      );
    }

    // 2️⃣ Find Sector & Validate belongs to Division
    const sectorDoc = await Sector.findOne({ sectorName: sector, divisionId: divisionDoc._id });
    if (!sectorDoc) {
      return NextResponse.json(
        { success: false, message: "Sector does not belong to selected division" },
        { status: 400 }
      );
    }

    // 3️⃣ Find Unit & Validate belongs to Sector
    const unitDoc = await Unit.findOne({ unitName: unit, sectorId: sectorDoc._id,divisionId: divisionDoc._id });
    if (!unitDoc) {
      return NextResponse.json(
        { success: false, message: "Unit does not belong to selected sector" },
        { status: 400 }
      );
    }

    // 4️⃣ Unique mobile check (except admin tester)
    if (mobile !== "9747785512") {
      const existingStudent = await Student.findOne({ mobile });
      if (existingStudent) {
        return NextResponse.json(
          { success: false, message: "Mobile number already registered" },
          { status: 400 }
        );
      }
    }

    // 5️⃣ Create Student Entry
    const newStudent = await Student.create({
      name,
      mobile,
      email,
      school,
      course,
      year,
      divisionId: divisionDoc._id,
      sectorId: sectorDoc._id,
      unitId: unitDoc._id,
    });

    return NextResponse.json({
      success: true,
      message: "Student Registered Successfully",
      data: newStudent,
    });
  } catch (error) {
    console.error("Error while registering student:", error);
    return NextResponse.json(
      { success: false, message: "Error while registering student" },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    await connectDB();

    const divisions = await Division.find({});
    return NextResponse.json({
      success: true,
      data: divisions,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Error while fetching divisions" },
      { status: 500 }
    );
  }
}
