"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BASE, CatCells, CatHeads, Loading, PageShell, SummaryCards, th, tableWrap, useSummary } from "./shared";

export default function MutaallimDivisionsPage() {
  const { data, loading, error } = useSummary();

  return (
    <PageShell title="Division-wise registrations">
      {!data ? (
        <Loading error={loading ? undefined : error} />
      ) : (
        <>
          <SummaryCards data={data} />
          <div className={tableWrap}>
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className={th}>Division</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Total</th>
                  <CatHeads />
                  <th scope="col" className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...data.divisions].sort((a, b) => b.total - a.total || a.divisionName.localeCompare(b.divisionName)).map((d) => (
                  <tr key={d._id} className="hover:bg-purple-50/50">
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      <Link href={`${BASE}/campuses?divisionId=${d._id}`} className="hover:text-purple-700">
                        {d.divisionName}
                        <span className="ml-2 text-xs font-normal text-slate-500">{d.campusCount} campuses</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-right font-bold tabular-nums text-purple-700">{d.total}</td>
                    <CatCells cats={d.categories} />
                    <td className="pr-3 text-slate-400">
                      <Link href={`${BASE}/campuses?divisionId=${d._id}`} aria-label={`View ${d.divisionName} campuses`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageShell>
  );
}
