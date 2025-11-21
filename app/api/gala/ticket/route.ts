import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Student from "@/app/models/Students";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { mobile } = await req.json();

    const student = await Student.findOne({ mobile });

    if (!student) {
      return NextResponse.json({ success: false, message: "Not registered" });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: student.name,
        mobile: student.mobile,
        ticket: student.ticket,
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
