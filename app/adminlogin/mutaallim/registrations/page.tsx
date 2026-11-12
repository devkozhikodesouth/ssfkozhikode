"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Search } from "lucide-react";
import { CATEGORIES } from "@/app/utils/mutaallim";
import { Loading, PageShell, th, tableWrap, useSummary } from "../shared";

type Row = { _id: string; registrationCode: string; name: string; place: string; phone: string; category: string; division: string; campus: string; createdAt: string };
type SortKey = "createdAt" | "registrationCode" | "name" | "place" | "phone" | "category";

const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
const input = "min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm";

function Inner() {
  const params = useSearchParams();
  const { data: summary } = useSummary();

  const [search, setSearch] = useState("");
  const [q, setQ] = useState(""); // debounced
  const [divisionId, setDivisionId] = useState(params.get("divisionId") || "");
  const [campusId, setCampusId] = useState(params.get("campusId") || "");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  // A campus link from the campus view should also pre-select its division
  useEffect(() => {
    if (summary && campusId && !divisionId) {
      const c = summary.campuses.find((x) => x._id === campusId);
      if (c) setDivisionId(c.divisionId);
    }
  }, [summary, campusId, divisionId]);

  useEffect(() => {
    const t = setTimeout(() => { setQ(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const qs = useCallback(
    (extra: Record<string, string>) => {
      const p = new URLSearchParams({ sort, dir, ...extra });
      if (q) p.set("search", q);
      if (divisionId) p.set("divisionId", divisionId);
      if (campusId) p.set("campusId", campusId);
      if (category) p.set("category", category);
      if (from) p.set("from", from);
      if (to) p.set("to", to);
      return p.toString();
    },
    [q, divisionId, campusId, category, from, to, sort, dir]
  );

  useEffect(() => {
    let live = true;
    setLoading(true);
    fetch(`/api/admin/mutaallim/registrations?${qs({ page: String(page), limit: String(limit) })}`, { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        if (d.success) { setRows(d.rows); setTotal(d.total); setPages(d.pages); setError(""); }
        else setError(d.message || "Failed to load");
      })
      .catch(() => live && setError("Failed to load"))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [qs, page, limit]);

  const campusOptions = useMemo(
    () => (summary?.campuses || []).filter((c) => !divisionId || c.divisionId === divisionId),
    [summary, divisionId]
  );

  const toggleSort = (k: SortKey) => {
    if (sort === k) setDir(dir === "asc" ? "desc" : "asc");
    else { setSort(k); setDir(k === "createdAt" ? "desc" : "asc"); }
    setPage(1);
  };
  const SortIcon = ({ k }: { k: SortKey }) =>
    sort !== k ? <ArrowUpDown className="h-3 w-3 opacity-40" /> : dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  const Head = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <th scope="col" aria-sort={sort === k ? (dir === "asc" ? "ascending" : "descending") : "none"} className={th}>
      <button type="button" onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 uppercase cursor-pointer">
        {children}<SortIcon k={k} />
      </button>
    </th>
  );

  const exportRows = async (kind: "csv" | "xlsx") => {
    setExporting(true);
    try {
      const d = await fetch(`/api/admin/mutaallim/registrations?${qs({ all: "1" })}`, { credentials: "include", cache: "no-store" }).then((r) => r.json());
      if (!d.success) throw new Error(d.message);
      const data = (d.rows as Row[]).map((r, i) => ({
        "#": i + 1,
        Code: r.registrationCode,
        Division: r.division,
        Campus: r.campus,
        Name: r.name,
        Place: r.place,
        Phone: r.phone,
        Category: r.category,
        "Registered at": fmt(r.createdAt),
      }));
      const stamp = new Date().toISOString().slice(0, 10);
      if (kind === "xlsx") {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Registrations");
        XLSX.writeFile(wb, `mutaallim-registrations-${stamp}.xlsx`);
      } else {
        // Neutralise cells that spreadsheets would execute as formulas
        const cell = (v: unknown) => {
          let s = String(v ?? "");
          if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
          return `"${s.replace(/"/g, '""')}"`;
        };
        const head = Object.keys(data[0] || { "#": 0, Code: 0, Division: 0, Campus: 0, Name: 0, Place: 0, Phone: 0, Category: 0, "Registered at": 0 });
        const csv = [head.map(cell).join(","), ...data.map((r) => head.map((h) => cell((r as any)[h])).join(","))].join("\r\n");
        const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
        const a = document.createElement("a");
        a.href = url; a.download = `mutaallim-registrations-${stamp}.csv`; a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const clear = () => {
    setSearch(""); setQ(""); setDivisionId(""); setCampusId(""); setCategory(""); setFrom(""); setTo(""); setPage(1);
  };

  return (
    <>
      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            aria-label="Search code, name, phone or place"
            placeholder="Search code, name, phone or place"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${input} w-full pl-9`}
          />
        </div>
        <select aria-label="Division" className={input} value={divisionId} onChange={(e) => { setDivisionId(e.target.value); setCampusId(""); setPage(1); }}>
          <option value="">All divisions</option>
          {[...(summary?.divisions || [])].sort((a, b) => a.divisionName.localeCompare(b.divisionName)).map((d) => (
            <option key={d._id} value={d._id}>{d.divisionName}</option>
          ))}
        </select>
        <select aria-label="Campus" className={input} value={campusId} onChange={(e) => { setCampusId(e.target.value); setPage(1); }}>
          <option value="">All campuses</option>
          {campusOptions.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select aria-label="Category" className={input} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input aria-label="From date" type="date" className={`${input} min-w-0 flex-1`} value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          <span className="text-slate-400">–</span>
          <input aria-label="To date" type="date" className={`${input} min-w-0 flex-1`} value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600"><b>{total}</b> registrations</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={clear} className="min-h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50 cursor-pointer">Clear filters</button>
          <button type="button" disabled={exporting || !total} onClick={() => exportRows("csv")} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-purple-700 ring-1 ring-purple-300 hover:bg-purple-50 disabled:opacity-50 cursor-pointer">
            <Download className="h-4 w-4" /> CSV
          </button>
          <button type="button" disabled={exporting || !total} onClick={() => exportRows("xlsx")} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-purple-700 px-4 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50 cursor-pointer">
            <Download className="h-4 w-4" /> {exporting ? "Exporting…" : "Excel"}
          </button>
        </div>
      </div>

      {error && <Loading error={error} />}

      <div className={tableWrap}>
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className={th}>#</th>
              <Head k="registrationCode">Code</Head>
              <Head k="name">Name</Head>
              <Head k="place">Place</Head>
              <Head k="phone">Phone</Head>
              <th scope="col" className={th}>Division</th>
              <th scope="col" className={th}>Campus</th>
              <Head k="category">Category</Head>
              <Head k="createdAt">Registered</Head>
            </tr>
          </thead>
          <tbody className={`divide-y divide-slate-100 ${loading ? "opacity-50" : ""}`}>
            {rows.map((r, i) => (
              <tr key={r._id} className="hover:bg-purple-50/50">
                <td className="px-3 py-3 text-slate-400">{(page - 1) * limit + i + 1}</td>
                <td className="whitespace-nowrap px-3 py-3 font-mono text-xs font-semibold text-purple-800">{r.registrationCode}</td>
                <td className="px-3 py-3 font-semibold text-slate-900">{r.name}</td>
                <td className="px-3 py-3 text-slate-700">{r.place}</td>
                <td className="px-3 py-3 tabular-nums text-slate-700">{r.phone}</td>
                <td className="px-3 py-3 text-slate-700">{r.division}</td>
                <td className="px-3 py-3 text-slate-700">{r.campus}</td>
                <td className="px-3 py-3"><span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">{r.category}</span></td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-500">{fmt(r.createdAt)}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-500">{loading ? "Loading…" : "No registrations match."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <label className="flex items-center gap-2">
          Rows
          <select className={input} value={limit} onChange={(e) => { setLimit(+e.target.value); setPage(1); }}>
            {[25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-10 rounded-xl px-4 font-semibold ring-1 ring-slate-300 disabled:opacity-40 cursor-pointer">Prev</button>
          <span>Page {page} / {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="min-h-10 rounded-xl px-4 font-semibold ring-1 ring-slate-300 disabled:opacity-40 cursor-pointer">Next</button>
        </div>
      </div>
    </>
  );
}

export default function MutaallimRegistrationsPage() {
  return (
    <PageShell title="All registrations">
      <Suspense fallback={<Loading />}>
        <Inner />
      </Suspense>
    </PageShell>
  );
}
