import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/adminAuth";
import { attendanceLookup, attendanceMark } from "@/app/lib/mutaallimAttendanceRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const denied = () => NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

/* GET ?q=<code|phone> : find a registration;  POST { id } : mark present */
export const GET = (req: NextRequest) => attendanceLookup(req, isAdmin(req), denied());
export const POST = (req: NextRequest) => attendanceMark(req, isAdmin(req), denied());
