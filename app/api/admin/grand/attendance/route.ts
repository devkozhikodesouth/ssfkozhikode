import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";

import GrandConclave from "@/app/models/GrandConclave";
import Division from "@/app/models/Division"; // REQUIRED     
import Sector from "@/app/models/Sector";     // REQUIRED 

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

    const student = await GrandConclave
      .findOne({ ticket: code })
  

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error while fetching student:", error);
    return NextResponse.json(
      { success: false, message: "Error while fetching student" },
      { status: 500 }
    );
  }
}
