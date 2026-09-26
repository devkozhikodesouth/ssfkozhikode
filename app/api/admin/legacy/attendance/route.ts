import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";
import Legacy from "@/app/models/Legacy";

export async function GET(req: Request) {
  try {
    await connectDB();

    // Ensure models are registered in Mongoose
    void Division;
    void Sector;

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || searchParams.get("query");

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Code or mobile number is required" },
        { status: 400 }
      );
    }

    const clean = code.trim();
    const digitsOnly = clean.replace(/\D/g, "");

    let filter: any;
    if (digitsOnly.length === 10) {
      filter = {
        $or: [
          { mobile: digitsOnly },
          { ticket: { $regex: new RegExp(`^${clean}$`, "i") } },
        ],
      };
    } else {
      filter = { ticket: { $regex: new RegExp(`^${clean}$`, "i") } };
    }

    const student = await Legacy.findOne(filter)
      .populate("divisionId", "divisionName")
      .populate("sectorId", "sectorName");

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Ticket not found for It’s our Legacy" },
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
    console.error("Error while fetching It’s our Legacy delegate:", error);
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

    const updatedStudent = await Legacy.findByIdAndUpdate(
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
    console.error("Error marking It’s our Legacy attendance:", error);
    return NextResponse.json(
      { success: false, message: "Error marking attendance" },
      { status: 500 }
    );
  }
}
