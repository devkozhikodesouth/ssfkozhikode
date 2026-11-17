import { NextRequest, NextResponse } from "next/server";
import { isMutaallimReportKey } from "@/app/lib/mutaallimLink";
import { getMutaallimSummary } from "@/app/lib/mutaallimData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* GET ?key= : public report summary (secret link only) */
export async function GET(req: NextRequest) {
  if (!isMutaallimReportKey(req.nextUrl.searchParams.get("key"))) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }
  try {
    return NextResponse.json({ success: true, ...(await getMutaallimSummary()) });
  } catch (error) {
    console.error("Muta'allim report summary error:", error);
    return NextResponse.json({ success: false, message: "Failed to load summary" }, { status: 500 });
  }
}
