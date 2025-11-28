import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Student from "@/app/models/Students";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const school = searchParams.get("school");

    if (!school) {
      return NextResponse.json(
        { success: false, message: "School is required" },
        { status: 400 }
      );
    }

    // TOTAL STUDENT COUNT FOR SELECTED SCHOOL
    const totalStudents = await Student.countDocuments({unitId:"68720d1fa666f978f59b05dc"});

    // COMPLETED ATTENDANCE COUNT
    const completedAttendance = await Student.countDocuments({
      school,
      attendance: true,
    });

    // FETCH STUDENTS LIST
    const students = await Student.find({ school }).sort({ name: 1 });

    // FORMAT RESPONSE: ADD STATUS FIELD
    const formattedStudents = students.map((stu: any) => ({
      ...stu.toObject(),
      attendanceStatus: stu.attendance === true ? "completed" : "pending",
    }));

    return NextResponse.json({
      success: true,
      data: formattedStudents,
      totalCount: totalStudents,
      completedAttendance,
      count: students.length,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
