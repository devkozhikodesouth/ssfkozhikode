import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Sector from "@/app/models/Sector";
import Unit from "@/app/models/Unit";
import Student from "@/app/models/Students";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sectorId: string }> }
) {
  try {
    await connectDB();

    // ✅ Await params before using
    const { sectorId: rawSectorId } = await params;

    // 1️⃣ Validate and normalize sectorId
    const sectorId = String(rawSectorId ?? "").trim();

    console.log("Requested Sector ID:", sectorId);

    if (!sectorId || !mongoose.Types.ObjectId.isValid(sectorId)) {
      return NextResponse.json(
        { error: "Invalid sector ID" },
        { status: 400 }
      );
    }

    // 2️⃣ Verify sector exists
    const sector = await Sector.findById(sectorId);

    if (!sector) {
      return NextResponse.json(
        { error: `Sector '${sectorId}' not found` },
        { status: 404 }
      );
    }

    // 3️⃣ Find all units under the sector
    const units = await Unit.find({ sectorId: new mongoose.Types.ObjectId(sectorId) });

    if (!units || units.length === 0) {
      return NextResponse.json({
        sectorId,
        sectorName: sector.sectorName,
        students: [],
        totalStudents: 0,
      });
    }

    const unitIds = units.map((u) => u._id);

    // 4️⃣ Fetch all students in these units with populated unit name
    const students = await Student.find({
      unitId: { $in: unitIds },
    }).populate({
      path: "unitId",
      select: "unitName",
      model: "Unit",
    });

    if (!students || students.length === 0) {
      return NextResponse.json({
        sectorId,
        sectorName: sector.sectorName,
        students: [],
        totalStudents: 0,
      });
    }

    // 5️⃣ Format student data: name, phone, unitName
    const studentList = students.map((student: any) => ({
      _id: student._id,
      name: student.name,
      phone: student.mobile,
      unitName: student.unitId?.unitName || "Unknown Unit",
      email: student.email,
      school: student.school,
    }));

    // ✅ Return response
    return NextResponse.json({
      sectorId,
      sectorName: sector.sectorName,
      students: studentList,
      totalStudents: studentList.length,
    });
  } catch (error) {
    console.error("Error fetching sector students data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
