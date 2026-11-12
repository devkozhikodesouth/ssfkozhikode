"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BASE, CatCells, CatHeads, Loading, PageShell, th, tableWrap, useSummary } from "../shared";

function Inner() {
  const { data, loading, error } = useSummary();
  const router = useRouter();
  const divisionId = useSearchParams().get("divisionId") || "";

  const rows = useMemo(() => {
    if (!data) return [];
    const nameOf = new Map(data.divisions.map((d) => [d._id, d.divisionName]));
    return data.campuses
      .filter((c) => !divisionId || c.divisionId === divisionId)
      .map((c) => ({ ...c, division: nameOf.get(c.divisionId) || "" }))
      .sort((a, b) => a.division.localeCompare(b.division) || b.total - a.total || a.name.localeCompare(b.name));
  }, [data, divisionId]);

  if (!data) return <Loading error={loading ? undefined : error} />;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="div" className="text-sm font-semibold text-slate-700">Division</label>
        <select
          id="div"
          value={divisionId}
          onChange={(e) => router.replace(e.target.value ? `${BASE}/campuses?divisionId=${e.target.value}` : `${BASE}/campuses`)}
          className="min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="">All divisions</option>
          {[...data.divisions].sort((a, b) => a.divisionName.localeCompare(b.divisionName)).map((d) => (
            <option key={d._id} value={d._id}>{d.divisionName}</option>
          ))}
        </select>
        <span className="text-sm text-slate-500">{rows.length} campuses · {rows.reduce((a, r) => a + r.total, 0)} registrations</span>
      </div>

      <div className={tableWrap}>
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className={th}>Campus</th>
              <th scope="col" className={th}>Division</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">Total</th>
              <CatHeads />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((c) => (
              <tr key={c._id} className="hover:bg-purple-50/50">
                <td className="px-3 py-3 font-semibold text-slate-900">
                  <Link href={`${BASE}/registrations?campusId=${c._id}`} className="hover:text-purple-700">
                    {c.name}
                  </Link>
                  {!c.isActive && <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">inactive</span>}
                </td>
                <td className="px-3 py-3 text-slate-600">{c.division}</td>
                <td className="px-3 py-3 text-right font-bold tabular-nums text-purple-700">{c.total}</td>
                <CatCells cats={c.categories} />
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={7} className="px-3 py-10 text-center text-slate-500">No campuses.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function MutaallimCampusesPage() {
  return (
    <PageShell title="Campus-wise registrations">
      <Suspense fallback={<Loading />}>
        <Inner />
      </Suspense>
    </PageShell>
  );
}
