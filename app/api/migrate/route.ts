import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Student from "@/app/models/Students";

export async function PATCH() {
  try {
    await connectDB();

    const students = await Student.find();
    let counter = 1;

    for (const student of students) {
      student.attendance = false;

      if (!student.ticket) {
        student.ticket = `KS${String(counter).padStart(3, "0")}`;
      }

      await student.save();
      counter++;
    }

    return NextResponse.json({ success: true, message: "Migration completed" });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
