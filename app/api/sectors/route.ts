import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const divisionName = url.searchParams.get("division");
    if (!divisionName) {
      return NextResponse.json({ success: false, message: "division query required" }, { status: 400 });
    }

    const division = await Division.findOne({ divisionName });
    if (!division) {
      return NextResponse.json({ success: true, data: [] });
    }

    const sectors = await Sector.find({ divisionId: division._id });
    // return only the sector names
    const names = sectors.map((s) => ({ id: s._id, sectorName: s.sectorName }));

    return NextResponse.json({ success: true, data: names });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error while fetching sectors" }, { status: 500 });
  }
}

