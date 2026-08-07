import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import GrandGathering from "@/app/models/GrandGathering";

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

    const student = await GrandGathering.findOne({ ticket: code })
      .populate("divisionId", "divisionName")
      .populate("sectorId", "sectorName");

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Ticket not found for Grand Gathering" },
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
    console.error("Error while fetching Grand Gathering delegate:", error);
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

    const updatedStudent = await GrandGathering.findByIdAndUpdate(
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
    console.error("Error marking Grand Gathering attendance:", error);
    return NextResponse.json(
      { success: false, message: "Error marking attendance" },
      { status: 500 }
    );
  }
}
