import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Sector from "@/app/models/Sector";
import Unit from "@/app/models/Unit";

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const sectorName = url.searchParams.get("sector");
    if (!sectorName) {
      return NextResponse.json({ success: false, message: "sector query required" }, { status: 400 });
    }

    const sector = await Sector.findOne({ sectorName });
    if (!sector) {
      return NextResponse.json({ success: true, data: [] });
    }

    const units = await Unit.find({ sectorId: sector._id });
    const names = units.map((u) => ({ id: u._id, unitName: u.unitName }));

    return NextResponse.json({ success: true, data: names });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error while fetching units" }, { status: 500 });
  }
}
