import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import GrandConclave26 from "@/app/models/GrandConclave26";

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

    const student = await GrandConclave26.findOne({ ticket: code })
      .populate("divisionId", "divisionName")
      .populate("sectorId", "sectorName");

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Ticket not found for Grand Conclave 26" },
        { status: 404 }
      );
    }

    if (student.attendance) {
      return NextResponse.json(
        {
          success: true,
          already: true,
          message: "Attendance already marked",
          data: student,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      already: false,
      message: "Delegate found",
      data: student,
    });
  } catch (error) {
    console.error("Error while fetching Grand Conclave 26 delegate:", error);
    return NextResponse.json(
      { success: false, message: "Error while fetching delegate" },
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
        { success: false, message: "Delegate ID missing" },
        { status: 400 }
      );
    }

    const updatedStudent = await GrandConclave26.findByIdAndUpdate(
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
    console.error("Error marking Grand Conclave 26 attendance:", error);
    return NextResponse.json(
      { success: false, message: "Error marking attendance" },
      { status: 500 }
    );
  }
}
