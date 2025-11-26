import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Student from "@/app/models/Students";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get("mobile");

    if (!mobile) {
      return NextResponse.json(
        { success: false, message: "Mobile query missing" },
        { status: 400 }
      );
    }

    const user = await Student.findOne({ mobile,unitId: "68720d1fa666f978f59b05dc" });

    if (!user) {
      return NextResponse.json({ success: false, message: "Not registered yet" });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json(
      { success: false, message: "Error checking mobile" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, mobile, school, course, year } = body;

    if (!name || !mobile ||  !school || !course || !year) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Allow one test number
    if (mobile !== "9747785512") {
      const existingStudent = await Student.findOne({ mobile });
      if (existingStudent) {
        return NextResponse.json(
          { success: false, message: "Mobile number already registered" },
          { status: 400 }
        );
      }
    }

    const newStudent = await Student.create({
      name,
      mobile,
      email:'example@gmail.com',
      school,
      course,
      year,
      unitId: "68720d1fa666f978f59b05dc",
    });

    return NextResponse.json({
      success: true,
      message: "Student Registered Successfully",
      user: newStudent,
    });

  } catch (error) {
    console.error("Error while registering student:", error);
    return NextResponse.json(
      { success: false, message: "Error while registering student" },
      { status: 500 }
    );
  }
}
