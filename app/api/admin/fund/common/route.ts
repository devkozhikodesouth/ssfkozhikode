import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import { isAdmin } from "@/app/lib/adminAuth";
import FundCommonEntry from "@/app/models/FundCommonEntry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

/* Shape matches FundEntryRow so the shared receipt screen can render it */
const toRow = (e: any) => ({
  _id: String(e._id),
  memberId: "",
  memberName: "Common Collection",
  contributorName: e.contributorName,
  amount: e.amount,
  mobile: e.mobile || null,
  date: e.date,
  createdAt: e.createdAt,
  receiptNo: e.receiptNo,
});

/* GET : all common collection entries, newest first, with total */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    await connectDB();
    const entries = await FundCommonEntry.find().sort({ createdAt: -1 }).lean();
    const total = entries.reduce((t: number, e: any) => t + e.amount, 0);
    return NextResponse.json({ success: true, entries: entries.map(toRow), total });
  } catch (error) {
    console.error("Common collection list error:", error);
    return NextResponse.json({ success: false, message: "Failed to load entries" }, { status: 500 });
  }
}

/* POST : save an entry and issue its CC- receipt number */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    await connectDB();
    const body = await req.json();
    const contributorName = String(body.contributorName || "").trim();
    const amountRaw = String(body.amount ?? "").trim();
    const mobile = String(body.mobile || "").trim();
    const dateRaw = String(body.date || "").trim();
    const requestId = String(body.requestId || "").trim() || undefined;

    if (!contributorName) {
      return NextResponse.json({ success: false, message: "Contributor name is required" }, { status: 400 });
    }
    if (!/^\d+$/.test(amountRaw) || Number(amountRaw) <= 0) {
      return NextResponse.json({ success: false, message: "Enter a valid amount greater than 0" }, { status: 400 });
    }
    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      return NextResponse.json({ success: false, message: "Mobile number must be 10 digits" }, { status: 400 });
    }
    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? new Date(`${dateRaw}T00:00:00+05:30`) : new Date();

    // Idempotency: the same request saves only once
    if (requestId) {
      const existing = await FundCommonEntry.findOne({ requestId }).lean();
      if (existing) return NextResponse.json({ success: true, entry: toRow(existing) });
    }

    try {
      const entry = await FundCommonEntry.create({
        contributorName,
        amount: Number(amountRaw),
        mobile: mobile || null,
        date,
        requestId,
      });
      return NextResponse.json({ success: true, entry: toRow(entry) });
    } catch (err: any) {
      if (err?.code === 11000 && requestId) {
        const existing = await FundCommonEntry.findOne({ requestId }).lean();
        if (existing) return NextResponse.json({ success: true, entry: toRow(existing) });
      }
      throw err;
    }
  } catch (error) {
    console.error("Common collection save error:", error);
    return NextResponse.json({ success: false, message: "Could not save the entry. Try again." }, { status: 500 });
  }
}
