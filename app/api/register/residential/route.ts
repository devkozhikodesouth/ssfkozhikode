import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Student from "@/app/models/Students";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, mobile, email, school, course, year } = body;

    // Basic validation (optional but recommended)
    if (!name || !mobile || !email || !school || !course || !year) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Unique mobile check (except admin tester)
    if (mobile !== "9747785512") {
      const existingStudent = await Student.findOne({ mobile });
      if (existingStudent) {
        return NextResponse.json(
          { success: false, message: "Mobile number already registered" },
          { status: 400 }
        );
      }
    }

    // Create Student Entry
    const newStudent = await Student.create({
      name,
      mobile,
      email,
      school,
      course,
      year,
      unitId:'68720d1fa666f978f59b05dc', // Residential students may not have a unit₹
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
