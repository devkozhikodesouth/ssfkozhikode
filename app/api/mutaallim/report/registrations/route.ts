import { NextRequest, NextResponse } from "next/server";
import { isMutaallimReportKey } from "@/app/lib/mutaallimLink";
import { queryMutaallimRegistrations } from "@/app/lib/mutaallimData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* GET ?key=&… : public registrations list incl. phones (secret link only) */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  if (!isMutaallimReportKey(sp.get("key"))) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }
  try {
    return NextResponse.json({ success: true, ...(await queryMutaallimRegistrations(sp)) });
  } catch (error) {
    console.error("Muta'allim report registrations error:", error);
    return NextResponse.json({ success: false, message: "Failed to load registrations" }, { status: 500 });
  }
}
