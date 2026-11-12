"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/app/utils/mutaallim";

export type Cats = Record<string, number>;
export type DivisionRow = { _id: string; divisionName: string; campusCount: number; categories: Cats; total: number };
export type CampusRow = { _id: string; name: string; divisionId: string; isActive: boolean; categories: Cats; total: number };
export type Summary = { total: number; categories: Cats; divisions: DivisionRow[]; campuses: CampusRow[] };

export const BASE = "/adminlogin/mutaallim";

export function useSummary() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    fetch("/api/admin/mutaallim/summary", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d.success ? setData(d) : setError(d.message || "Failed to load")))
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  return { data, loading, error, reload: load };
}

const TABS = [
  { href: BASE, label: "Divisions" },
  { href: `${BASE}/campuses`, label: "Campuses" },
  { href: `${BASE}/registrations`, label: "All registrations" },
  { href: `${BASE}/manage`, label: "Manage campuses" },
];

export function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
        <p className="text-sm text-slate-500">Muta&apos;allim Sammelanam, Mukkam</p>
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Muta'allim sections">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              path === t.href ? "bg-purple-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}

export function SummaryCards({ data }: { data: Summary }) {
  const top = [...data.divisions].sort((a, b) => b.total - a.total).slice(0, 3);
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
      <div className="col-span-2 rounded-2xl bg-gradient-to-br from-purple-700 to-fuchsia-600 p-4 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Total registrations</p>
        <p className="mt-1 text-4xl font-extrabold">{data.total}</p>
      </div>
      {CATEGORIES.map((c) => (
        <div key={c} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{data.categories[c] ?? 0}</p>
        </div>
      ))}
      <div className="col-span-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:col-span-4 xl:col-span-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top divisions</p>
        <ol className="mt-2 grid gap-2 sm:grid-cols-3">
          {top.map((d, i) => (
            <li key={d._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
              <span className="font-semibold text-slate-800">
                {i + 1}. {d.divisionName}
              </span>
              <span className="font-bold text-purple-700">{d.total}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function CatCells({ cats }: { cats: Cats }) {
  return (
    <>
      {CATEGORIES.map((c) => (
        <td key={c} className="px-3 py-3 text-right tabular-nums text-slate-700">
          {cats[c] ?? 0}
        </td>
      ))}
    </>
  );
}

export const CatHeads = () => (
  <>
    {CATEGORIES.map((c) => (
      <th key={c} scope="col" className="px-3 py-3 text-right font-semibold">
        {c}
      </th>
    ))}
  </>
);

export const tableWrap = "overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200";
export const th = "px-3 py-3 text-left font-semibold";

export function Loading({ error }: { error?: string }) {
  return (
    <div role="status" className={`rounded-2xl bg-white p-10 text-center text-sm shadow-sm ring-1 ring-slate-200 ${error ? "text-red-600" : "text-slate-500"}`}>
      {error || "Loading…"}
    </div>
  );
}
