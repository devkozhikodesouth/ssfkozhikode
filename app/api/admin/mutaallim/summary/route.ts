import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/adminAuth";
import { getMutaallimSummary } from "@/app/lib/mutaallimData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* GET : totals, category counts, per-division and per-campus breakdowns */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ success: true, ...(await getMutaallimSummary()) });
  } catch (error) {
    console.error("Muta'allim summary error:", error);
    return NextResponse.json({ success: false, message: "Failed to load summary" }, { status: 500 });
  }
}
