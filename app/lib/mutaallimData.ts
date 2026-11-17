import mongoose from "mongoose";
import { connectDB } from "@/app/lib/mongodb";
import Division from "@/app/models/Division";
import Campus from "@/app/models/Campus";
import MutaallimRegistration from "@/app/models/MutaallimRegistration";
import { CATEGORIES } from "@/app/utils/mutaallim";

/* Muta'allim report data, shared by the admin APIs (login) and the
 * public report APIs (secret link key). */

const emptyCats = () => Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<string, number>;

/* Totals, category counts, per-division and per-campus breakdowns */
export async function getMutaallimSummary() {
  await connectDB();
  const [divisions, campuses, stats] = await Promise.all([
    Division.find({}, { divisionName: 1 }).lean<any[]>(),
    Campus.find({}).sort({ sortOrder: 1, name: 1 }).lean<any[]>(),
    MutaallimRegistration.aggregate([
      {
        $group: {
          _id: { campusId: "$campusId", category: "$category" },
          n: { $sum: 1 },
          attended: { $sum: { $cond: [{ $eq: ["$attended", true] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const byCampus = new Map<string, Record<string, number>>();
  const attendedByCampus = new Map<string, number>();
  const attendedCats = emptyCats();
  for (const s of stats) {
    const key = String(s._id.campusId);
    if (!byCampus.has(key)) byCampus.set(key, emptyCats());
    byCampus.get(key)![s._id.category] = s.n;
    attendedByCampus.set(key, (attendedByCampus.get(key) || 0) + (s.attended || 0));
    if (s._id.category in attendedCats) attendedCats[s._id.category] += s.attended || 0;
  }
  const sum = (c: Record<string, number>) => Object.values(c).reduce((a, b) => a + b, 0);

  const campusRows = campuses.map((c) => {
    const cats = byCampus.get(String(c._id)) || emptyCats();
    return {
      _id: String(c._id),
      name: c.name,
      divisionId: String(c.divisionId),
      isActive: c.isActive,
      categories: cats,
      total: sum(cats),
      attended: attendedByCampus.get(String(c._id)) || 0,
    };
  });

  const overall = emptyCats();
  const divisionRows = divisions.map((d) => {
    const cats = emptyCats();
    let campusCount = 0;
    let attended = 0;
    for (const c of campusRows) {
      if (c.divisionId !== String(d._id)) continue;
      campusCount++;
      attended += c.attended;
      for (const k of CATEGORIES) cats[k] += c.categories[k];
    }
    for (const k of CATEGORIES) overall[k] += cats[k];
    return {
      _id: String(d._id),
      divisionName: d.divisionName,
      campusCount,
      categories: cats,
      total: sum(cats),
      attended,
    };
  });

  return {
    total: sum(overall),
    categories: overall,
    attended: sum(attendedCats),
    attendedCategories: attendedCats,
    divisions: divisionRows,
    campuses: campusRows,
  };
}

const SORTABLE = ["createdAt", "name", "place", "phone", "category", "registrationCode", "attendedAt"];
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Filtered, sorted, paginated registrations. ?all=1 returns every match. */
export async function queryMutaallimRegistrations(sp: URLSearchParams) {
  await connectDB();
  const filter: Record<string, any> = {};

  const divisionId = sp.get("divisionId");
  const campusId = sp.get("campusId");
  const category = sp.get("category");
  if (divisionId && mongoose.isValidObjectId(divisionId)) filter.divisionId = divisionId;
  if (campusId && mongoose.isValidObjectId(campusId)) filter.campusId = campusId;
  if (category && (CATEGORIES as readonly string[]).includes(category)) filter.category = category;

  const from = sp.get("from");
  const to = sp.get("to");
  if (from || to) {
    filter.createdAt = {};
    if (from && !isNaN(+new Date(from))) filter.createdAt.$gte = new Date(`${from}T00:00:00`);
    if (to && !isNaN(+new Date(to))) filter.createdAt.$lte = new Date(`${to}T23:59:59.999`);
    if (!Object.keys(filter.createdAt).length) delete filter.createdAt;
  }

  const attendance = sp.get("attendance");
  if (attendance === "yes") filter.attended = true;
  else if (attendance === "no") filter.attended = { $ne: true };

  const q = (sp.get("search") || "").trim();
  if (q) {
    const re = new RegExp(escapeRe(q), "i");
    filter.$or = [{ name: re }, { place: re }, { phone: re }, { registrationCode: re }];
  }

  const sortKey = SORTABLE.includes(sp.get("sort") || "") ? (sp.get("sort") as string) : "createdAt";
  const dir = sp.get("dir") === "asc" ? 1 : -1;
  const all = sp.get("all") === "1";
  const limit = Math.min(Math.max(parseInt(sp.get("limit") || "25", 10) || 25, 1), 200);
  const page = Math.max(parseInt(sp.get("page") || "1", 10) || 1, 1);

  let query = MutaallimRegistration.find(filter)
    .sort({ [sortKey]: dir, _id: -1 })
    .populate("divisionId", "divisionName")
    .populate("campusId", "name");
  if (!all) query = query.skip((page - 1) * limit).limit(limit);

  const [rows, total] = await Promise.all([
    query.lean<any[]>(),
    MutaallimRegistration.countDocuments(filter),
  ]);

  return {
    total,
    page,
    pages: all ? 1 : Math.max(1, Math.ceil(total / limit)),
    rows: rows.map((r) => ({
      _id: String(r._id),
      registrationCode: r.registrationCode ?? "",
      name: r.name,
      place: r.place,
      phone: r.phone,
      category: r.category,
      division: r.divisionId?.divisionName ?? "",
      campus: r.campusId?.name ?? "",
      createdAt: r.createdAt,
      attended: Boolean(r.attended),
      attendedAt: r.attendedAt ?? null,
    })),
  };
}

/* One registration as shown at the attendance desk */
const toAttendee = (r: any) => ({
  _id: String(r._id),
  registrationCode: r.registrationCode ?? "",
  name: r.name,
  place: r.place,
  phone: r.phone,
  category: r.category,
  division: r.divisionId?.divisionName ?? "",
  campus: r.campusId?.name ?? "",
  attended: Boolean(r.attended),
  attendedAt: r.attendedAt ?? null,
});

/* Find by registration code (QR / typed) or 10-digit phone */
export async function findMutaallimAttendee(raw: string) {
  await connectDB();
  const q = String(raw || "").trim();
  if (!q) return null;
  const code = q.toUpperCase();
  const digits = q.replace(/\D/g, "").slice(-10);
  const filter = /^MUT-\d+$/.test(code)
    ? { registrationCode: code }
    : digits.length === 10
    ? { phone: digits }
    : { registrationCode: code };
  const r = await MutaallimRegistration.findOne(filter)
    .populate("divisionId", "divisionName")
    .populate("campusId", "name")
    .lean();
  return r ? toAttendee(r) : null;
}

/* Mark present once; marking again keeps the first time */
export async function markMutaallimAttendance(id: string) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;
  await MutaallimRegistration.updateOne(
    { _id: id, attended: { $ne: true } },
    { $set: { attended: true, attendedAt: new Date() } }
  );
  const r = await MutaallimRegistration.findById(id)
    .populate("divisionId", "divisionName")
    .populate("campusId", "name")
    .lean();
  return r ? toAttendee(r) : null;
}
