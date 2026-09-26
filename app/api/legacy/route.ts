import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";

import Division from "@/app/models/Division";
import Sector from "@/app/models/Sector";
import Legacy from "@/app/models/Legacy";

/* ----------------------------------------------------
 * GET : Fetch user by mobile for It’s our Legacy
 * -------------------------------------------------- */
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get("mobile");

    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile number" },
        { status: 400 }
      );
    }

    const user: any = await Legacy.findOne({ mobile })
      .populate("divisionId", "divisionName")
      .populate("sectorId", "sectorName")
      .lean();

    if (!user) {
      return NextResponse.json({ success: true, user: null });
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        mobile: user.mobile,
        ticket: user.ticket,
        division: user.divisionId?.divisionName ?? null,
        sector: user.sectorId?.sectorName ?? null,
      } as any,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* ----------------------------------------------------
 * POST : Register new user for It’s our Legacy
 * -------------------------------------------------- */
export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, mobile, division, sector } = await req.json();

    /* ---------- Basic Validation ---------- */
    if (!name || !mobile || !division || !sector) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile number" },
        { status: 400 }
      );
    }

    /* ---------- Prevent Duplicate ---------- */
    const exists = await Legacy.findOne({ mobile });
    if (exists) {
      return NextResponse.json(
        { success: false, message: "Mobile already registered" },
        { status: 409 }
      );
    }

    /* ---------- Resolve Division & Sector (required for everyone) ---------- */
    const divisionDoc = await Division.findOne({ divisionName: division });
    if (!divisionDoc) {
      return NextResponse.json(
        { success: false, message: "Invalid division" },
        { status: 400 }
      );
    }

    const sectorDoc = await Sector.findOne({
      sectorName: sector,
      divisionId: divisionDoc._id,
    });
    if (!sectorDoc) {
      return NextResponse.json(
        { success: false, message: "Invalid sector" },
        { status: 400 }
      );
    }

    /* ---------- Create Record ---------- */
    const user = await Legacy.create({
      name,
      mobile,
      designation: "izzacode",
      divisionId: divisionDoc._id,
      sectorId: sectorDoc._id,
    });

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        mobile: user.mobile,
        ticket: user.ticket,
        division: divisionDoc.divisionName,
        sector: sectorDoc.sectorName,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Duplicate mobile number" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
