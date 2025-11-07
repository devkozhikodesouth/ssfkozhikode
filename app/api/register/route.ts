import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Student from "@/app/models/Students";
import Division from "@/app/models/Division";
import Unit from "@/app/models/Unit";


export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    console.log(body.mobile , typeof body.mobile)

    // ✅ Check if unit exists
    const isUnit = await Unit.findOne({ unitName: body.unit });
    if (!isUnit) {
      console.log("Invalid unit:", body.unit);
      return NextResponse.json(
        { success: false, message: "Invalid Unit Selected" },
        { status: 400 }
      );
    }
    // ✅ Check for existing student (by mobile)
  if(body.mobile!=="9747785512"){
    const existingStudent = await Student.findOne({ mobile: body.mobile });

    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: "Mobile number already registered" },
        { status: 400 }
      );
    }
  }
    // ✅ Create new student
    const studentData = {
      name: body.name?.trim(),
      mobile: body.mobile?.trim(),
      email: body.email?.trim(),
      school: body.school?.trim(),
      course: body.course?.trim(),
      year: body.year?.trim(),
      unitId: isUnit._id, // ✅ assign ObjectId properly
    };

    const newStudent = await Student.create(studentData);

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
