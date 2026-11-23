import { NextResponse } from "next/server";
import { isMutaallimRegistrationOpen } from "@/app/lib/mutaallimSettings";

export const dynamic = "force-dynamic";

/* GET : whether new registrations are accepted (tickets are always available) */
export async function GET() {
  try {
    return NextResponse.json(
      { success: true, registrationOpen: await isMutaallimRegistrationOpen() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Muta'allim status error:", error);
    // Fail open for the page copy; the register API still enforces the real state
    return NextResponse.json({ success: true, registrationOpen: true });
  }
}
