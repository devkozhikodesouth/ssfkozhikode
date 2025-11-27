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

    const students = await Student.find({ school }).sort({ name: 1 });

    return NextResponse.json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (error) {
    console.error("Error fetching residential students:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
