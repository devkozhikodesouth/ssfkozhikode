import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import { isAdmin } from "@/app/lib/adminAuth";
import FundMember from "@/app/models/FundMember";
import FundEntry from "@/app/models/FundEntry";
import { FUND_GROUPS, groupFilter, parseGroup } from "@/app/utils/fund";
import { fundLinkPath } from "@/app/lib/fundLinks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

/* GET : all members (active + inactive) with collected totals */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    await connectDB();
    const group = parseGroup(req.nextUrl.searchParams.get("group"));
    const [members, stats] = await Promise.all([
      FundMember.find(groupFilter(group)).sort({ name: 1 }).lean(),
      FundEntry.aggregate([
        { $group: { _id: "$memberId", collected: { $sum: "$amount" }, entryCount: { $sum: 1 } } },
      ]),
    ]);
    const statMap = new Map(stats.map((s: any) => [String(s._id), s]));

    return NextResponse.json({
      success: true,
      target: FUND_GROUPS[group].target,
      publicPath: fundLinkPath(group),
      members: members.map((m: any) => {
        const s: any = statMap.get(String(m._id));
        return {
          _id: String(m._id),
          name: m.name,
          target: FUND_GROUPS[group].target,
          active: m.active,
          collected: s?.collected || 0,
          entryCount: s?.entryCount || 0,
        };
      }),
    });
  } catch (error) {
    console.error("Fund members list error:", error);
    return NextResponse.json({ success: false, message: "Failed to load members" }, { status: 500 });
  }
}

/* POST : add a member { name, group } — target is fixed per group */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    await connectDB();
    const { name, group: rawGroup } = await req.json();
    const group = parseGroup(rawGroup);
    const cleanName = String(name || "").trim();

    if (!cleanName) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }
    if (await FundMember.exists({ name: cleanName, ...groupFilter(group) })) {
      return NextResponse.json({ success: false, message: "A member with this name already exists" }, { status: 409 });
    }

    const member = await FundMember.create({ name: cleanName, target: FUND_GROUPS[group].target, group });
    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    if (error?.code === 11000) {
      // An older unique index on name alone also blocks the same name in the other group
      return NextResponse.json(
        { success: false, message: "This name already exists (possibly in the other group). Use a slightly different name." },
        { status: 409 }
      );
    }
    console.error("Fund member create error:", error);
    return NextResponse.json({ success: false, message: "Failed to add member" }, { status: 500 });
  }
}
