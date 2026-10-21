import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import FundMember from "@/app/models/FundMember";
import FundEntry from "@/app/models/FundEntry";
import { FUND_GROUPS, groupFilter, percentOf } from "@/app/utils/fund";
import { resolveFundKey } from "@/app/lib/fundLinks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* GET ?key= : live dashboard data for the group behind the secret link key */
export async function GET(req: Request) {
  try {
    await connectDB();
    const group = await resolveFundKey(new URL(req.url).searchParams.get("key"));
    if (!group) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }
    const target = FUND_GROUPS[group].target; // fixed per member

    const [members, stats] = await Promise.all([
      FundMember.find({ active: true, ...groupFilter(group) }).select("name target").lean(),
      FundEntry.aggregate([
        {
          $group: {
            _id: "$memberId",
            collected: { $sum: "$amount" },
            entryCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statMap = new Map(stats.map((s: any) => [String(s._id), s]));

    const rows = members
      .map((m: any) => {
        const s: any = statMap.get(String(m._id));
        const collected = s?.collected || 0;
        return {
          _id: String(m._id),
          name: m.name,
          target,
          collected,
          balance: Math.max(target - collected, 0),
          percent: percentOf(collected, target),
          entryCount: s?.entryCount || 0,
        };
      })
      .sort((a, b) => b.collected - a.collected || a.name.localeCompare(b.name));

    const totalTarget = rows.reduce((t, r) => t + r.target, 0);
    const totalCollected = rows.reduce((t, r) => t + r.collected, 0);

    return NextResponse.json(
      {
        success: true,
        members: rows,
        totals: {
          target: totalTarget,
          collected: totalCollected,
          balance: Math.max(totalTarget - totalCollected, 0),
          percent: percentOf(totalCollected, totalTarget),
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("Fund dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load Fund Challenge data" },
      { status: 500 }
    );
  }
}
