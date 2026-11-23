import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/adminAuth";
import { isMutaallimRegistrationOpen, setMutaallimRegistrationOpen } from "@/app/lib/mutaallimSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

/* GET : current registration state */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    return NextResponse.json({ success: true, registrationOpen: await isMutaallimRegistrationOpen() });
  } catch (error) {
    console.error("Muta'allim settings read error:", error);
    return NextResponse.json({ success: false, message: "Failed to load settings" }, { status: 500 });
  }
}

/* PATCH { registrationOpen: boolean } : open or close new registrations */
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.registrationOpen !== "boolean") {
      return NextResponse.json({ success: false, message: "registrationOpen must be true or false" }, { status: 400 });
    }
    const open = await setMutaallimRegistrationOpen(body.registrationOpen);
    return NextResponse.json({ success: true, registrationOpen: open });
  } catch (error) {
    console.error("Muta'allim settings update error:", error);
    return NextResponse.json({ success: false, message: "Failed to update settings" }, { status: 500 });
  }
}
