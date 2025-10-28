import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Student from "@/app/models/Students";
import Division from "@/app/models/Division";
import Unit from "@/app/models/Unit";
import { data } from "framer-motion/client";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const isUnit= await Unit.findOne({unitName:body.unit});

    if(!isUnit){
       console.log('not available the unit')
      return NextResponse.json(
        { success: false, message: "Invalid Unit Selected" },
        { status: 400 }
      );
    } 
    const studentData = {
  name: body.name,
  mobile: body.mobile,
  email: body.email,
  school: body.school,
  course: body.course,
  year: body.year,
  unitId: isUnit._id, // ✅ assign ObjectId properly
};
    const newStudent = await Student.create(studentData);

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
