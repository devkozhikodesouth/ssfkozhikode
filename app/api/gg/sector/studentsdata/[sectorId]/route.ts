import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import GrandGathering from "@/app/models/GrandGathering";
import Sector from "@/app/models/Sector";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sectorId: string }> }
) {
  try {
    await connectDB();

    const { sectorId } = await params;

    if (!mongoose.Types.ObjectId.isValid(sectorId)) {
      return NextResponse.json(
        { error: "Invalid sector ID" },
        { status: 400 }
      );
    }

    const sector = await Sector.findById(sectorId).lean();
    if (!sector) {
      return NextResponse.json(
        { error: "Sector not found" },
        { status: 404 }
      );
    }

    const registrations = await GrandGathering.find({
      sectorId: new mongoose.Types.ObjectId(sectorId),
    })
      .populate("divisionId", "divisionName")
      .populate("sectorId", "sectorName")
      .lean();

    const formatted = registrations.map((u: any) => ({
      _id: u._id,
      name: u.name,
      phone: u.mobile,
      ticket: u.ticket,
      designation: u.designation,
      divisionName: u.divisionId?.divisionName ?? "N/A",
      sectorName: u.sectorId?.sectorName ?? "N/A",
    }));

    return NextResponse.json({
      sectorId,
      sectorName: sector.sectorName,
      students: formatted,
      totalStudents: formatted.length,
    });
  } catch (error) {
    console.error("Error fetching GG sector students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
