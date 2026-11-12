import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import { lookupLimited } from "@/app/lib/rateLimit";
import MutaallimRegistration from "@/app/models/MutaallimRegistration";
import { phoneSchema } from "@/app/utils/mutaallim";
import { toTicket } from "@/app/lib/mutaallimTicket";
import "@/app/models/Division";
import "@/app/models/Campus";

export const dynamic = "force-dynamic";

/* POST { phone } -> { registered, ticket? }. Rate limited per IP. */
export async function POST(req: NextRequest) {
  const wait = lookupLimited(req);
  if (wait) {
    return NextResponse.json(
      { success: false, message: "Too many attempts. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(wait) } }
    );
  }
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = phoneSchema.safeParse(body?.phone);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }
    const phone = parsed.data;
    await connectDB();
    const reg = await MutaallimRegistration.findOne({ phone })
      .populate("divisionId", "divisionName")
      .populate("campusId", "name")
      .lean();
    if (!reg) return NextResponse.json({ success: true, registered: false, phone });
    return NextResponse.json({ success: true, registered: true, phone, ticket: toTicket(reg) });
  } catch (error) {
    console.error("Muta'allim lookup error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
