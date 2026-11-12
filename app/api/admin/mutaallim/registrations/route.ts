import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import { isAdmin } from "@/app/lib/adminAuth";
import MutaallimRegistration from "@/app/models/MutaallimRegistration";
import { CATEGORIES } from "@/app/utils/mutaallim";
import "@/app/models/Division";
import "@/app/models/Campus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SORTABLE = ["createdAt", "name", "place", "phone", "category", "registrationCode"];
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* GET : filtered, sorted, paginated registrations. ?all=1 returns every match (for export). */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const sp = req.nextUrl.searchParams;
    const filter: Record<string, any> = {};

    const divisionId = sp.get("divisionId");
    const campusId = sp.get("campusId");
    const category = sp.get("category");
    if (divisionId && mongoose.isValidObjectId(divisionId)) filter.divisionId = divisionId;
    if (campusId && mongoose.isValidObjectId(campusId)) filter.campusId = campusId;
    if (category && (CATEGORIES as readonly string[]).includes(category)) filter.category = category;

    const from = sp.get("from");
    const to = sp.get("to");
    if (from || to) {
      filter.createdAt = {};
      if (from && !isNaN(+new Date(from))) filter.createdAt.$gte = new Date(`${from}T00:00:00`);
      if (to && !isNaN(+new Date(to))) filter.createdAt.$lte = new Date(`${to}T23:59:59.999`);
      if (!Object.keys(filter.createdAt).length) delete filter.createdAt;
    }

    const q = (sp.get("search") || "").trim();
    if (q) {
      const re = new RegExp(escapeRe(q), "i");
      filter.$or = [{ name: re }, { place: re }, { phone: re }, { registrationCode: re }];
    }

    const sortKey = SORTABLE.includes(sp.get("sort") || "") ? (sp.get("sort") as string) : "createdAt";
    const dir = sp.get("dir") === "asc" ? 1 : -1;
    const all = sp.get("all") === "1";
    const limit = Math.min(Math.max(parseInt(sp.get("limit") || "25", 10) || 25, 1), 200);
    const page = Math.max(parseInt(sp.get("page") || "1", 10) || 1, 1);

    let query = MutaallimRegistration.find(filter)
      .sort({ [sortKey]: dir, _id: -1 })
      .populate("divisionId", "divisionName")
      .populate("campusId", "name");
    if (!all) query = query.skip((page - 1) * limit).limit(limit);

    const [rows, total] = await Promise.all([
      query.lean<any[]>(),
      MutaallimRegistration.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      total,
      page,
      pages: all ? 1 : Math.max(1, Math.ceil(total / limit)),
      rows: rows.map((r) => ({
        _id: String(r._id),
        registrationCode: r.registrationCode ?? "",
        name: r.name,
        place: r.place,
        phone: r.phone,
        category: r.category,
        division: r.divisionId?.divisionName ?? "",
        campus: r.campusId?.name ?? "",
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Muta'allim registrations error:", error);
    return NextResponse.json({ success: false, message: "Failed to load registrations" }, { status: 500 });
  }
}
