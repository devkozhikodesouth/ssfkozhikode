import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import GrandConclave from "@/app/models/GrandConclave";
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Code is required" },
        { status: 400 }
      );
    }

    const student = await GrandConclave.findOne({ ticket: code });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    // Attendance already marked
    if (student.attendance) {
      return NextResponse.json(
        {
          success: true,           // <-- SUCCESS but with flag
          already: true,
          message: "Attendance already marked",
          data: student
        },
        { status: 200 }
      );
    }

    // Normal success
    return NextResponse.json({
      success: true,
      already: false,
      message: "Student found",
      data: student,
    });

  } catch (error) {
    console.error("Error while fetching student:", error);
    return NextResponse.json(
      { success: false, message: "Error while fetching student" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Student ID missing" }, 
        { status: 400 }
      );
    }

    const updatedStudent = await GrandConclave.findByIdAndUpdate(
      id,
      { attendance: true },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Attendance recorded successfully",
      data: updatedStudent,
    });

  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json(
      { success: false, message: "Error marking attendance" }, 
      { status: 500 }
    );
  }
}
