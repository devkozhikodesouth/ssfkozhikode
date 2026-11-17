import { NextRequest, NextResponse } from "next/server";
import { isMutaallimReportKey } from "@/app/lib/mutaallimLink";
import { attendanceLookup, attendanceMark } from "@/app/lib/mutaallimAttendanceRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const denied = () => NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

/* Same as the admin API, but authorised by the secret report key (?key=) */
export const GET = (req: NextRequest) =>
  attendanceLookup(req, isMutaallimReportKey(req.nextUrl.searchParams.get("key")), denied());
export const POST = (req: NextRequest) =>
  attendanceMark(req, isMutaallimReportKey(req.nextUrl.searchParams.get("key")), denied());
