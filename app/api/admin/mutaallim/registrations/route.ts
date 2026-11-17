import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/adminAuth";
import { queryMutaallimRegistrations } from "@/app/lib/mutaallimData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* GET : filtered, sorted, paginated registrations. ?all=1 returns every match (for export). */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ success: true, ...(await queryMutaallimRegistrations(req.nextUrl.searchParams)) });
  } catch (error) {
    console.error("Muta'allim registrations error:", error);
    return NextResponse.json({ success: false, message: "Failed to load registrations" }, { status: 500 });
  }
}
