import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import { isAdmin } from "@/app/lib/adminAuth";
import Division from "@/app/models/Division";
import Campus from "@/app/models/Campus";
import MutaallimRegistration from "@/app/models/MutaallimRegistration";
import { CATEGORIES } from "@/app/utils/mutaallim";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const emptyCats = () => Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<string, number>;

/* GET : totals, category counts, per-division and per-campus breakdowns */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const [divisions, campuses, stats] = await Promise.all([
      Division.find({}, { divisionName: 1 }).lean<any[]>(),
      Campus.find({}).sort({ sortOrder: 1, name: 1 }).lean<any[]>(),
      MutaallimRegistration.aggregate([
        { $group: { _id: { campusId: "$campusId", category: "$category" }, n: { $sum: 1 } } },
      ]),
    ]);

    const byCampus = new Map<string, Record<string, number>>();
    for (const s of stats) {
      const key = String(s._id.campusId);
      if (!byCampus.has(key)) byCampus.set(key, emptyCats());
      byCampus.get(key)![s._id.category] = s.n;
    }
    const sum = (c: Record<string, number>) => Object.values(c).reduce((a, b) => a + b, 0);

    const campusRows = campuses.map((c) => {
      const cats = byCampus.get(String(c._id)) || emptyCats();
      return {
        _id: String(c._id),
        name: c.name,
        divisionId: String(c.divisionId),
        isActive: c.isActive,
        categories: cats,
        total: sum(cats),
      };
    });

    const overall = emptyCats();
    const divisionRows = divisions.map((d) => {
      const cats = emptyCats();
      let campusCount = 0;
      for (const c of campusRows) {
        if (c.divisionId !== String(d._id)) continue;
        campusCount++;
        for (const k of CATEGORIES) cats[k] += c.categories[k];
      }
      for (const k of CATEGORIES) overall[k] += cats[k];
      return {
        _id: String(d._id),
        divisionName: d.divisionName,
        campusCount,
        categories: cats,
        total: sum(cats),
      };
    });

    return NextResponse.json({
      success: true,
      total: sum(overall),
      categories: overall,
      divisions: divisionRows,
      campuses: campusRows,
    });
  } catch (error) {
    console.error("Muta'allim summary error:", error);
    return NextResponse.json({ success: false, message: "Failed to load summary" }, { status: 500 });
  }
}
