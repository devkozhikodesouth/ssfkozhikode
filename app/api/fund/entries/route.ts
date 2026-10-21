import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import FundMember from "@/app/models/FundMember";
import FundEntry from "@/app/models/FundEntry";
import { groupFilter } from "@/app/utils/fund";
import { resolveFundKey } from "@/app/lib/fundLinks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const toRow = (e: any, memberName: string) => ({
  _id: String(e._id),
  memberId: String(e.memberId),
  memberName,
  contributorName: e.contributorName,
  amount: e.amount,
  mobile: e.mobile || null,
  date: e.date,
  createdAt: e.createdAt,
  receiptNo: e.receiptNo,
});

const notFound = () =>
  NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

/* GET ?key=&memberId= : a member's past entries, newest first */
export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const group = await resolveFundKey(params.get("key"));
    if (!group) return notFound();
    const memberId = params.get("memberId");

    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { success: false, message: "Invalid member" },
        { status: 400 }
      );
    }

    // The member must belong to this link's group
    const member: any = await FundMember.findOne({ _id: memberId, ...groupFilter(group) })
      .select("name")
      .lean();
    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    const entries = await FundEntry.find({ memberId })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, entries: entries.map((e) => toRow(e, member.name)) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Fund entries fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load entries" },
      { status: 500 }
    );
  }
}

/* POST : save a contribution and issue its receipt number (key required) */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const group = await resolveFundKey(body.key);
    if (!group) return notFound();

    const memberId = String(body.memberId || "");
    const contributorName = String(body.contributorName || "").trim();
    const amountRaw = String(body.amount ?? "").trim();
    const mobile = String(body.mobile || "").trim();
    const dateRaw = String(body.date || "").trim();
    const requestId = String(body.requestId || "").trim() || undefined;

    /* ---------- Validation ---------- */
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { success: false, message: "Select an executive member" },
        { status: 400 }
      );
    }
    if (!contributorName) {
      return NextResponse.json(
        { success: false, message: "Contributor name is required" },
        { status: 400 }
      );
    }
    if (!/^\d+$/.test(amountRaw) || Number(amountRaw) <= 0) {
      return NextResponse.json(
        { success: false, message: "Enter a valid amount greater than 0" },
        { status: 400 }
      );
    }
    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, message: "Mobile number must be 10 digits" },
        { status: 400 }
      );
    }
    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw)
      ? new Date(`${dateRaw}T00:00:00+05:30`)
      : new Date();

    const member: any = await FundMember.findOne({ _id: memberId, active: true, ...groupFilter(group) })
      .select("name")
      .lean();
    if (!member) {
      return NextResponse.json(
        { success: false, message: "Executive member not found" },
        { status: 404 }
      );
    }

    /* ---------- Idempotency: same request saves only once ---------- */
    if (requestId) {
      const existing = await FundEntry.findOne({ requestId }).lean();
      if (existing) {
        return NextResponse.json({ success: true, entry: toRow(existing, member.name) });
      }
    }

    try {
      const entry = await FundEntry.create({
        memberId,
        contributorName,
        amount: Number(amountRaw),
        mobile: mobile || null,
        date,
        group,
        requestId,
      });
      return NextResponse.json({ success: true, entry: toRow(entry, member.name) });
    } catch (err: any) {
      // A concurrent duplicate of the same request won the race
      if (err?.code === 11000 && requestId) {
        const existing = await FundEntry.findOne({ requestId }).lean();
        if (existing) {
          return NextResponse.json({ success: true, entry: toRow(existing, member.name) });
        }
      }
      throw err;
    }
  } catch (error) {
    console.error("Fund entry save error:", error);
    return NextResponse.json(
      { success: false, message: "Could not save the entry. Try again." },
      { status: 500 }
    );
  }
}
