import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Campus from "@/app/models/Campus";
import MutaallimRegistration from "@/app/models/MutaallimRegistration";
import { lookupLimited } from "@/app/lib/rateLimit";
import { normalizePhone, parseRegistration } from "@/app/utils/mutaallim";
import { toTicket } from "@/app/lib/mutaallimTicket";
import { REGISTRATION_CLOSED_MESSAGE, isMutaallimRegistrationOpen } from "@/app/lib/mutaallimSettings";

export const dynamic = "force-dynamic";

/* Existing ticket for a phone, or null. Shares the lookup rate limit so this
 * path cannot be used to enumerate registrations. */
async function findTicket(phone: string, req?: NextRequest) {
  const reg = await MutaallimRegistration.findOne({ phone })
    .populate("divisionId", "divisionName")
    .populate("campusId", "name")
    .lean();
  if (!reg) return null;
  if (req) {
    const wait = lookupLimited(req);
    if (wait) {
      return NextResponse.json(
        { success: false, message: `Too many tries in a short time. Please wait ${wait} seconds and try again.` },
        { status: 429, headers: { "Retry-After": String(wait) } }
      );
    }
  }
  return NextResponse.json({ success: true, existing: true, ticket: toTicket(reg) });
}

export async function POST(req: NextRequest) {
  let errBody: any = null;
  try {
    const body = await req.json().catch(() => null);
    errBody = body;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, message: "Something went wrong. Please refresh the page and try again." }, { status: 400 });
    }

    const parsed = parseRegistration(body);
    if (!parsed.ok) {
      return NextResponse.json(
        { success: false, message: "Some details are missing or incorrect. Check the fields marked in red.", errors: parsed.errors },
        { status: 400 }
      );
    }
    const input = parsed.data; // trimmed, phone normalised

    await connectDB();

    // Closed: no new registrations, but an existing registrant still gets their pass
    if (!(await isMutaallimRegistrationOpen())) {
      const existing = await findTicket(input.phone, req);
      if (existing) return existing;
      return NextResponse.json(
        { success: false, closed: true, message: REGISTRATION_CLOSED_MESSAGE },
        { status: 403 }
      );
    }

    const [division, campus] = await Promise.all([
      Division.findById(input.divisionId).lean<any>(),
      Campus.findById(input.campusId).lean<any>(),
    ]);
    if (!division) {
      return NextResponse.json(
        {
          success: false,
          message: "That division isn't available. Please choose your division again.",
          errors: { divisionId: "Choose your division from the list." },
        },
        { status: 400 }
      );
    }
    if (!campus || !campus.isActive || String(campus.divisionId) !== String(division._id)) {
      return NextResponse.json(
        {
          success: false,
          message: "That campus isn't in the division you chose.",
          errors: { campusId: "Choose your campus from the list for this division." },
        },
        { status: 400 }
      );
    }

    const phone = input.phone;

    // Already registered (phone is unique per event): return the existing ticket
    const existing = await findTicket(phone, req);
    if (existing) return existing;

    const reg = await MutaallimRegistration.create({
      divisionId: division._id,
      campusId: campus._id,
      name: input.name,
      place: input.place,
      phone,
      category: input.category,
    });

    return NextResponse.json({
      success: true,
      existing: false,
      ticket: toTicket({ ...reg.toObject(), divisionId: division, campusId: campus }),
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      // Lost a race on the unique phone index: hand back the winner's ticket
      const phone = normalizePhone(String(errBody?.phone ?? ""));
      const existing = phone ? await findTicket(phone, req) : null;
      if (existing) return existing;
    }
    console.error("Muta'allim registration error:", error);
    return NextResponse.json({ success: false, message: "We couldn't complete your registration. Please try again in a moment." }, { status: 500 });
  }
}
