import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/adminAuth";
import { mutaallimReportPath } from "@/app/lib/mutaallimLink";

export const runtime = "nodejs";

/* GET : path of the public (secret-link) report, for the admin to share */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ success: true, path: mutaallimReportPath });
}
