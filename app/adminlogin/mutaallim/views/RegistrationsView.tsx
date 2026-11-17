"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Phone, Search, SlidersHorizontal } from "lucide-react";
import { CATEGORIES } from "@/app/utils/mutaallim";
import {
  ColumnsMenu,
  EVENT_TITLE,
  Loading,
  WhatsAppShareButton,
  apiUrl,
  th,
  tableWrap,
  today,
  useColumns,
  useSource,
  useSummary,
} from "../shared";

type Row = {
  _id: string;
  registrationCode: string;
  name: string;
  place: string;
  phone: string;
  category: string;
  division: string;
  campus: string;
  createdAt: string;
  attended: boolean;
  attendedAt: string | null;
};
type SortKey = "createdAt" | "registrationCode" | "name" | "place" | "phone" | "category" | "attendedAt";

/* # and Name always show; the rest can be hidden (and leave the share too) */
const COLUMNS = [
  { id: "code", label: "Code" },
  { id: "place", label: "Place" },
  { id: "phone", label: "Phone" },
  { id: "division", label: "Division" },
  { id: "campus", label: "Campus" },
  { id: "category", label: "Category" },
  { id: "registered", label: "Registered" },
  { id: "attendance", label: "Attendance" },
];

const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
const input = "min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-base sm:min-h-10 sm:text-sm";

const SORT_LABELS: { key: SortKey; label: string }[] = [
  { key: "createdAt", label: "Registered time" },
  { key: "name", label: "Name" },
  { key: "registrationCode", label: "Code" },
  { key: "place", label: "Place" },
  { key: "phone", label: "Phone" },
  { key: "category", label: "Category" },
  { key: "attendedAt", label: "Attendance time" },
];

/* Uses useSearchParams: render inside <Suspense> */
export default function RegistrationsView() {
  const params = useSearchParams();
  const src = useSource();
  const cols = useColumns("registrations", COLUMNS);
  const { show } = cols;
  const { data: summary } = useSummary();

  const [search, setSearch] = useState("");
  const [q, setQ] = useState(""); // debounced
  const [divisionId, setDivisionId] = useState(params.get("divisionId") || "");
  const [campusId, setCampusId] = useState(params.get("campusId") || "");
  const [category, setCategory] = useState("");
  const [attendance, setAttendance] = useState(""); // "" | "yes" | "no"
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
      if (attendance) p.set("attendance", attendance);
      if (from) p.set("from", from);
      if (to) p.set("to", to);
      return p.toString();
    },
    [q, divisionId, campusId, category, attendance, from, to, sort, dir]
  );

  useEffect(() => {
    let live = true;
    setLoading(true);
    fetch(apiUrl(src, "registrations", qs({ page: String(page), limit: String(limit) })), { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        if (d.success) { setRows(d.rows); setTotal(d.total); setPages(d.pages); setError(""); }
        else setError(d.message || "Failed to load");
      })
      .catch(() => live && setError("Failed to load"))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [qs, page, limit, src]);

  const campusOptions = useMemo(
    () => (summary?.campuses || []).filter((c) => !divisionId || c.divisionId === divisionId),
    [summary, divisionId]
  );

  const toggleSort = (k: SortKey) => {
    if (sort === k) setDir(dir === "asc" ? "desc" : "asc");
    else { setSort(k); setDir(k === "createdAt" || k === "attendedAt" ? "desc" : "asc"); }
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
      const d = await fetch(apiUrl(src, "registrations", qs({ all: "1" })), { credentials: "include", cache: "no-store" }).then((r) => r.json());
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
        Attended: r.attended ? "Yes" : "No",
        "Attended at": r.attendedAt ? fmt(r.attendedAt) : "",
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
        const head = Object.keys(data[0] || { "#": 0, Code: 0, Division: 0, Campus: 0, Name: 0, Place: 0, Phone: 0, Category: 0, "Registered at": 0, Attended: 0, "Attended at": 0 });
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

  /* WhatsApp: every registration matching the current filters, in the current sort */
  const shareMessage = async () => {
    const d = await fetch(apiUrl(src, "registrations", qs({ all: "1" })), { credentials: "include", cache: "no-store" }).then((r) => r.json());
    const list: Row[] = d.success ? d.rows : [];
    const filters = [
      summary?.divisions.find((x) => x._id === divisionId)?.divisionName,
      summary?.campuses.find((x) => x._id === campusId)?.name,
      category,
      attendance === "yes" ? "Attended" : attendance === "no" ? "Not attended" : "",
      q && `"${q}"`,
      (from || to) && `${from || "…"} to ${to || "…"}`,
    ].filter(Boolean);
    return [
      EVENT_TITLE,
      "SSF Kozhikode South",
      `📅 ${today()}`,
      "",
      `👥 *Registrations:* ${list.length}${filters.length ? `\n🔎 ${filters.join(" · ")}` : ""}`,
      "",
      ...list.map((r, i) => {
        const tick = show("attendance") && r.attended ? "✅ " : "";
        const code = show("code") && r.registrationCode ? ` (${r.registrationCode})` : "";
        const line2 = [show("place") && r.place, show("phone") && r.phone, show("category") && r.category].filter(Boolean);
        const line3 = [show("campus") && r.campus, show("division") && r.division].filter(Boolean);
        const line4 = [
          show("registered") && `Registered ${fmt(r.createdAt)}`,
          show("attendance") && r.attended && r.attendedAt && `Attended ${fmt(r.attendedAt)}`,
        ].filter(Boolean);
        return [`${i + 1}. ${tick}*${r.name}*${code}`, line2.join(" · "), line3.join(", "), line4.join(" · ")]
          .filter(Boolean)
          .join("\n    ");
      }),
    ].join("\n");
  };

  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = [divisionId, campusId, category, attendance, from || to].filter(Boolean).length;

  const clear = () => {
    setSearch(""); setQ(""); setDivisionId(""); setCampusId(""); setCategory(""); setAttendance(""); setFrom(""); setTo(""); setPage(1);
  };

  return (
    <>
      <div className="grid gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:grid-cols-2 sm:p-4 lg:grid-cols-5">
        <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              aria-label="Search code, name, phone or place"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${input} w-full pl-9`}
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            aria-controls="reg-filters"
            className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold ring-1 sm:hidden cursor-pointer ${
              activeFilters ? "bg-purple-700 text-white ring-purple-700" : "bg-white text-slate-700 ring-slate-300"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeFilters > 0 && ` (${activeFilters})`}
          </button>
        </div>
        <div id="reg-filters" className={`${filtersOpen ? "grid" : "hidden"} gap-3 sm:contents`}>
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
        <select aria-label="Attendance" className={input} value={attendance} onChange={(e) => { setAttendance(e.target.value); setPage(1); }}>
          <option value="">All (attendance)</option>
          <option value="yes">Attended</option>
          <option value="no">Not attended</option>
        </select>
        <div className="flex items-center gap-2">
          <input aria-label="From date" type="date" className={`${input} min-w-0 flex-1`} value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          <span className="text-slate-400">–</span>
          <input aria-label="To date" type="date" className={`${input} min-w-0 flex-1`} value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
        </div>
        {activeFilters > 0 && (
          <button type="button" onClick={clear} className="min-h-11 rounded-xl text-sm font-semibold text-purple-700 ring-1 ring-purple-200 sm:hidden cursor-pointer">
            Clear filters
          </button>
        )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600"><b className="tabular-nums">{total}</b> registrations</p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button type="button" onClick={clear} className="hidden min-h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50 sm:block cursor-pointer">Clear filters</button>
          <ColumnsMenu cols={cols} />
          <WhatsAppShareButton title="Registrations" build={shareMessage} disabled={!total} />
          <button type="button" disabled={exporting || !total} onClick={() => exportRows("csv")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-purple-700 ring-1 ring-purple-300 hover:bg-purple-50 disabled:opacity-50 sm:min-h-10 cursor-pointer">
            <Download className="h-4 w-4" /> CSV
          </button>
          <button type="button" disabled={exporting || !total} onClick={() => exportRows("xlsx")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50 sm:min-h-10 cursor-pointer">
            <Download className="h-4 w-4" /> {exporting ? "Exporting…" : "Excel"}
          </button>
        </div>
      </div>

      {error && <Loading error={error} />}

      {/* Phone: sort select (server-side sort, same state as the table headers) */}
      <div className="flex items-center gap-2 sm:hidden">
        <label htmlFor="reg-sort" className="shrink-0 text-sm font-medium text-slate-600">Sort</label>
        <select
          id="reg-sort"
          value={sort}
          onChange={(e) => {
            const k = e.target.value as SortKey;
            setSort(k);
            setDir(k === "createdAt" || k === "attendedAt" ? "desc" : "asc");
            setPage(1);
          }}
          className={`${input} min-w-0 flex-1`}
        >
          {SORT_LABELS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
        <button
          type="button"
          onClick={() => { setDir(dir === "asc" ? "desc" : "asc"); setPage(1); }}
          aria-label={dir === "asc" ? "Ascending, tap for descending" : "Descending, tap for ascending"}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-300 active:bg-slate-100 cursor-pointer"
        >
          {dir === "asc" ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Phone: one card per registration */}
      <ul className={`space-y-2.5 sm:hidden ${loading ? "opacity-50" : ""}`}>
        {rows.map((r, i) => (
          <li key={r._id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-bold leading-snug text-slate-900">
                  <span className="mr-1.5 text-sm font-normal tabular-nums text-slate-400">{(page - 1) * limit + i + 1}.</span>
                  {r.name}
                </p>
                {show("code") && <p className="font-mono text-xs font-semibold text-purple-800">{r.registrationCode}</p>}
              </div>
              {show("attendance") &&
                (r.attended ? (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    ✓ {r.attendedAt ? new Date(r.attendedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Present"}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">Not attended</span>
                ))}
            </div>
            <div className="mt-2 space-y-1 text-sm text-slate-700">
              {(show("category") || show("place")) && (
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {show("category") && (
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">{r.category}</span>
                  )}
                  {show("place") && <span>{r.place}</span>}
                </p>
              )}
              {(show("campus") || show("division")) && (
                <p className="text-slate-500">{[show("campus") && r.campus, show("division") && r.division].filter(Boolean).join(", ")}</p>
              )}
              {show("registered") && <p className="text-xs text-slate-400">Registered {fmt(r.createdAt)}</p>}
            </div>
            {show("phone") && (
              <a
                href={`tel:${r.phone}`}
                className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-50 text-sm font-semibold tabular-nums text-slate-800 ring-1 ring-slate-200 active:bg-slate-100"
              >
                <Phone className="h-4 w-4" /> {r.phone}
              </a>
            )}
          </li>
        ))}
        {!rows.length && (
          <li className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200">
            {loading ? "Loading…" : "No registrations match."}
          </li>
        )}
      </ul>

      <div className={`hidden sm:block ${tableWrap}`}>
        <table className="w-full text-sm" style={{ minWidth: 260 + cols.visible.length * 105 }}>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className={th}>#</th>
              {show("code") && <Head k="registrationCode">Code</Head>}
              <Head k="name">Name</Head>
              {show("place") && <Head k="place">Place</Head>}
              {show("phone") && <Head k="phone">Phone</Head>}
              {show("division") && <th scope="col" className={th}>Division</th>}
              {show("campus") && <th scope="col" className={th}>Campus</th>}
              {show("category") && <Head k="category">Category</Head>}
              {show("registered") && <Head k="createdAt">Registered</Head>}
              {show("attendance") && <Head k="attendedAt">Attendance</Head>}
            </tr>
          </thead>
          <tbody className={`divide-y divide-slate-100 ${loading ? "opacity-50" : ""}`}>
            {rows.map((r, i) => (
              <tr key={r._id} className="hover:bg-purple-50/50">
                <td className="px-3 py-3 text-slate-400">{(page - 1) * limit + i + 1}</td>
                {show("code") && <td className="whitespace-nowrap px-3 py-3 font-mono text-xs font-semibold text-purple-800">{r.registrationCode}</td>}
                <td className="px-3 py-3 font-semibold text-slate-900">{r.name}</td>
                {show("place") && <td className="px-3 py-3 text-slate-700">{r.place}</td>}
                {show("phone") && <td className="px-3 py-3 tabular-nums text-slate-700">{r.phone}</td>}
                {show("division") && <td className="px-3 py-3 text-slate-700">{r.division}</td>}
                {show("campus") && <td className="px-3 py-3 text-slate-700">{r.campus}</td>}
                {show("category") && <td className="px-3 py-3"><span className="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">{r.category}</span></td>}
                {show("registered") && <td className="whitespace-nowrap px-3 py-3 text-slate-500">{fmt(r.createdAt)}</td>}
                {show("attendance") && <td className="whitespace-nowrap px-3 py-3">
                  {r.attended ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800" title={r.attendedAt ? fmt(r.attendedAt) : undefined}>
                      ✓ {r.attendedAt ? new Date(r.attendedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Present"}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>}
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={2 + cols.visible.length} className="px-3 py-10 text-center text-slate-500">{loading ? "Loading…" : "No registrations match."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col-reverse gap-3 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <label className="flex items-center justify-center gap-2">
          Rows per page
          <select className={input} value={limit} onChange={(e) => { setLimit(+e.target.value); setPage(1); }}>
            {[25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-11 rounded-xl bg-white px-4 font-semibold ring-1 ring-slate-300 disabled:opacity-40 sm:min-h-10 cursor-pointer">Prev</button>
          <span className="whitespace-nowrap text-center tabular-nums">Page {page} / {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="min-h-11 rounded-xl bg-white px-4 font-semibold ring-1 ring-slate-300 disabled:opacity-40 sm:min-h-10 cursor-pointer">Next</button>
        </div>
      </div>
    </>
  );
}
