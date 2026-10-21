import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import { isAdmin } from "@/app/lib/adminAuth";
import FundMember from "@/app/models/FundMember";
import FundEntry from "@/app/models/FundEntry";
import FundHandover from "@/app/models/FundHandover";
import { parseGroup } from "@/app/utils/fund";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

const sumBy = (rows: any[]) => new Map(rows.map((r: any) => [String(r._id), r.total as number]));

/* GET : members of both groups (collected / paid) + handover history, newest first */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    await connectDB();
    const [members, collected, paid, handovers] = await Promise.all([
      FundMember.find().select("name group active").sort({ name: 1 }).lean(),
      FundEntry.aggregate([{ $group: { _id: "$memberId", total: { $sum: "$amount" } } }]),
      FundHandover.aggregate([{ $group: { _id: "$memberId", total: { $sum: "$amount" } } }]),
      FundHandover.find().sort({ createdAt: -1 }).limit(500).lean(),
    ]);

    const collectedMap = sumBy(collected);
    const paidMap = sumBy(paid);
    const nameMap = new Map(members.map((m: any) => [String(m._id), m.name]));

    return NextResponse.json({
      success: true,
      members: members.map((m: any) => ({
        _id: String(m._id),
        name: m.name,
        group: parseGroup(m.group),
        active: m.active,
        collected: collectedMap.get(String(m._id)) || 0,
        paid: paidMap.get(String(m._id)) || 0,
      })),
      handovers: handovers.map((h: any) => ({
        _id: String(h._id),
        memberId: String(h.memberId),
        memberName: nameMap.get(String(h.memberId)) || "Removed member",
        group: parseGroup(h.group),
        amount: h.amount,
        createdAt: h.createdAt,
      })),
    });
  } catch (error) {
    console.error("Fund handovers list error:", error);
    return NextResponse.json({ success: false, message: "Failed to load handovers" }, { status: 500 });
  }
}

/* POST { memberId, amount } : record cash handed over to the admin */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    await connectDB();
    const { memberId, amount } = await req.json();
    const amountStr = String(amount ?? "").trim();

    if (!mongoose.Types.ObjectId.isValid(String(memberId))) {
      return NextResponse.json({ success: false, message: "Select a member" }, { status: 400 });
    }
    if (!/^\d+$/.test(amountStr) || Number(amountStr) <= 0) {
      return NextResponse.json({ success: false, message: "Enter an amount greater than 0" }, { status: 400 });
    }

    const member: any = await FundMember.findById(memberId).select("name group").lean();
    if (!member) {
      return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
    }

    const handover = await FundHandover.create({
      memberId,
      group: parseGroup(member.group),
      amount: Number(amountStr),
    });
    return NextResponse.json({ success: true, handover });
  } catch (error) {
    console.error("Fund handover save error:", error);
    return NextResponse.json({ success: false, message: "Failed to save handover" }, { status: 500 });
  }
}
