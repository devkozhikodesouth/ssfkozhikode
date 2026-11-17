import { NextRequest, NextResponse } from "next/server";
import { findMutaallimAttendee, markMutaallimAttendance } from "@/app/lib/mutaallimData";

/* Shared handlers for the admin and public (secret-key) attendance APIs.
 * `allowed` is the caller's access check. */

export async function attendanceLookup(req: NextRequest, allowed: boolean, denied: NextResponse) {
  if (!allowed) return denied;
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const attendee = await findMutaallimAttendee(q);
    if (!attendee) {
      return NextResponse.json({ success: false, message: "No registration found for this code or phone" }, { status: 404 });
    }
    return NextResponse.json({ success: true, attendee });
  } catch (error) {
    console.error("Muta'allim attendance lookup error:", error);
    return NextResponse.json({ success: false, message: "Lookup failed" }, { status: 500 });
  }
}

export async function attendanceMark(req: NextRequest, allowed: boolean, denied: NextResponse) {
  if (!allowed) return denied;
  try {
    const { id } = await req.json();
    const attendee = await markMutaallimAttendance(String(id || ""));
    if (!attendee) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, attendee });
  } catch (error) {
    console.error("Muta'allim attendance mark error:", error);
    return NextResponse.json({ success: false, message: "Could not mark attendance" }, { status: 500 });
  }
}
