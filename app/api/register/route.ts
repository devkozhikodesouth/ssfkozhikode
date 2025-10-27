import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Student from "@/app/models/Students";
import Division from "@/app/models/Division";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const newStudent = await Student.create(body);

    return NextResponse.json({
      success: true,
      message: "Student Registered Successfully",
      data: newStudent,
    });
  } catch (error) {
    console.log(error);
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
