import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import GrandGathering from "@/app/models/GrandGathering";
import Division from "@/app/models/Division";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ divisionName: string }> }
) {
  try {
    await connectDB();

    const { divisionName } = await params;

    // Find Division
    const division = await Division.findOne({ divisionName }).lean();
    if (!division) {
      return NextResponse.json(
        { success: false, message: "Division not found" },
        { status: 404 }
      );
    }

    // Fetch division-level delegates (sectorId = null)
    const delegates = await GrandGathering.find({
      divisionId: new mongoose.Types.ObjectId(division._id),
      sectorId: null,
    })
      .select("name mobile designation ticket createdAt")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      divisionName,
      totalDelegates: delegates.length,
      delegates,
    });
  } catch (error) {
    console.error("Grand Gathering division delegates fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
