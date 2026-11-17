"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Columns3, Copy, ExternalLink, Link2, Share2 } from "lucide-react";
import { CATEGORIES } from "@/app/utils/mutaallim";
import SharePreview, { ShareRequest } from "@/app/fundchallenge/SharePreview";

export type Cats = Record<string, number>;
export type DivisionRow = { _id: string; divisionName: string; campusCount: number; categories: Cats; total: number; attended: number };
export type CampusRow = { _id: string; name: string; divisionId: string; isActive: boolean; categories: Cats; total: number; attended: number };
export type Summary = {
  total: number;
  categories: Cats;
  attended: number;
  attendedCategories: Cats;
  divisions: DivisionRow[];
  campuses: CampusRow[];
};

export const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

export const BASE = "/adminlogin/mutaallim";

/* Where the views read data from and link to: the admin panel (login) or the
 * public report (secret key, read-only). Same screens, different source. */
export type Source = { apiBase: string; linkBase: string; reportKey?: string; isPublic: boolean };

const ADMIN_SOURCE: Source = { apiBase: "/api/admin/mutaallim", linkBase: BASE, isPublic: false };
const SourceCtx = createContext<Source>(ADMIN_SOURCE);
export const useSource = () => useContext(SourceCtx);

export function ReportSourceProvider({ reportKey, children }: { reportKey: string; children: React.ReactNode }) {
  const value = useMemo<Source>(
    () => ({
      apiBase: "/api/mutaallim/report",
      linkBase: `/mutaallim-conference/report/${reportKey}`,
      reportKey,
      isPublic: true,
    }),
    [reportKey]
  );
  return <SourceCtx.Provider value={value}>{children}</SourceCtx.Provider>;
}

/* API URL for the current source (adds the secret key on the public report) */
export function apiUrl(src: Source, path: "summary" | "registrations" | "attendance", query = "") {
  const p = new URLSearchParams(query);
  if (src.reportKey) p.set("key", src.reportKey);
  const qs = p.toString();
  return `${src.apiBase}/${path}${qs ? `?${qs}` : ""}`;
}

export function useSummary() {
  const src = useSource();
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true);
    fetch(apiUrl(src, "summary"), { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d.success ? setData(d) : setError(d.message || "Failed to load")))
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  return { data, loading, error, reload: load };
}

const TABS = [
  { path: "", label: "Divisions" },
  { path: "/campuses", label: "Campuses" },
  { path: "/registrations", label: "All registrations" },
  { path: "/attendance", label: "Mark attendance" },
  { path: "/manage", label: "Manage campuses", adminOnly: true },
];

export function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  const path = usePathname();
  const src = useSource();
  const tabs = TABS.filter((t) => !(t.adminOnly && src.isPublic)).map((t) => ({
    href: `${src.linkBase}${t.path}`,
    label: t.label,
  }));
  const activeTab = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    activeTab.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [path]);
  return (
    <div className="mx-auto max-w-7xl space-y-4 px-3 py-4 sm:space-y-5 sm:p-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900 sm:text-2xl">{title}</h1>
        <p className="text-sm text-slate-500">Muta&apos;allim Sammelanam, Mukkam</p>
      </div>
      <nav className="-mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0" aria-label="Muta'allim sections">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            ref={path === t.href ? activeTab : undefined}
            aria-current={path === t.href ? "page" : undefined}
            className={`flex min-h-11 snap-start items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold transition ${
              path === t.href ? "bg-purple-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {!src.isPublic && <ReportLinkBar />}
      {children}
    </div>
  );
}

export function SummaryCards({ data }: { data: Summary }) {
  const top = [...data.divisions].sort((a, b) => b.total - a.total).slice(0, 3);
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
      <div className="rounded-2xl bg-gradient-to-br from-purple-700 to-fuchsia-600 p-4 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Total registrations</p>
        <p className="mt-1 text-4xl font-extrabold">{data.total}</p>
      </div>
      <div className="rounded-2xl bg-emerald-600 p-4 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Attended</p>
        <p className="mt-1 text-4xl font-extrabold">
          {data.attended}
          <span className="ml-1.5 text-base font-semibold text-white/80">{pct(data.attended, data.total)}%</span>
        </p>
      </div>
      {CATEGORIES.map((c) => (
        <div key={c} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{data.categories[c] ?? 0}</p>
        </div>
      ))}
      <div className="col-span-2 hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:block lg:col-span-4 xl:col-span-6">
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

export function CatCells({ cats, only }: { cats: Cats; only?: readonly string[] }) {
  return (
    <>
      {CATEGORIES.filter((c) => !only || only.includes(c)).map((c) => (
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

/* ───────── Public report link (admin only) ───────── */
function ReportLinkBar() {
  const [path, setPath] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/mutaallim/link", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.success && setPath(d.path))
      .catch(() => {});
  }, []);
  if (!path) return null;

  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
        <Link2 className="h-4 w-4 text-purple-600" /> Public report link
      </span>
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700"
      />
      <div className="flex gap-2">
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-3 py-2 text-xs font-bold text-white hover:bg-purple-800 cursor-pointer">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
        </button>
        <a href={path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
          <ExternalLink className="h-4 w-4" /> Open
        </a>
      </div>
      <p className="text-[11px] text-amber-700 sm:hidden">Shows phone numbers — share only with organisers.</p>
    </div>
  );
}

/* ───────── Client-side table sort ───────── */
export type SortDir = "asc" | "desc";

export function useTableSort<T>(
  rows: T[],
  getters: Record<string, (r: T) => string | number>,
  initial: { key: string; dir: SortDir }
) {
  const [sort, setSort] = useState(initial);
  const sorted = useMemo(() => {
    const get = getters[sort.key];
    if (!get) return rows;
    const m = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = get(a);
      const y = get(b);
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * m;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort]);
  // Text columns start A–Z, number columns start highest first
  const toggle = (key: string, numeric: boolean) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: numeric ? "desc" : "asc" }));
  return { sorted, sort, toggle, setSort };
}

/* Phones have no column headers: sort with a select + direction toggle */
export function MobileSortBar({
  options,
  sort,
  onChange,
}: {
  options: { key: string; label: string; numeric?: boolean }[];
  sort: { key: string; dir: SortDir };
  onChange: (s: { key: string; dir: SortDir }) => void;
}) {
  return (
    <div className="flex items-center gap-2 sm:hidden">
      <label htmlFor="m-sort" className="shrink-0 text-sm font-medium text-slate-600">Sort</label>
      <select
        id="m-sort"
        value={sort.key}
        onChange={(e) => {
          const opt = options.find((o) => o.key === e.target.value);
          onChange({ key: e.target.value, dir: opt?.numeric ? "desc" : "asc" });
        }}
        className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-base"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onChange({ key: sort.key, dir: sort.dir === "asc" ? "desc" : "asc" })}
        aria-label={sort.dir === "asc" ? "Ascending, tap for descending" : "Descending, tap for ascending"}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-300 active:bg-slate-100 cursor-pointer"
      >
        {sort.dir === "asc" ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
      </button>
    </div>
  );
}

export function SortTh({
  label,
  k,
  sort,
  onSort,
  numeric = false,
}: {
  label: string;
  k: string;
  sort: { key: string; dir: SortDir };
  onSort: (key: string, numeric: boolean) => void;
  numeric?: boolean;
}) {
  const active = sort.key === k;
  return (
    <th
      scope="col"
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-3 py-3 font-semibold ${numeric ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={() => onSort(k, numeric)}
        className={`inline-flex items-center gap-1 uppercase cursor-pointer hover:text-slate-800 ${active ? "text-purple-700" : ""}`}
      >
        {label}
        {!active ? (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        ) : sort.dir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )}
      </button>
    </th>
  );
}

/* Sortable category headers (one per category) */
export const catKey = (c: string) => `cat:${c}`;
export function CatSortHeads({
  sort,
  onSort,
  only,
}: {
  sort: { key: string; dir: SortDir };
  onSort: (k: string, n: boolean) => void;
  only?: readonly string[];
}) {
  return (
    <>
      {CATEGORIES.filter((c) => !only || only.includes(c)).map((c) => (
        <SortTh key={c} label={c} k={catKey(c)} sort={sort} onSort={onSort} numeric />
      ))}
    </>
  );
}
export const catGetters = <T extends { categories: Cats }>() =>
  Object.fromEntries(CATEGORIES.map((c) => [catKey(c), (r: T) => r.categories[c] ?? 0])) as Record<
    string,
    (r: T) => number
  >;

/* ───────── WhatsApp share (with preview) ───────── */
export const EVENT_TITLE = "📋 *Muta'allim Sammelanam, Mukkam*";

export const catLine = (cats: Cats, only?: readonly string[]) =>
  CATEGORIES.filter((c) => !only || only.includes(c))
    .map((c) => `${c} ${cats[c] ?? 0}`)
    .join(" · ");

export function WhatsAppShareButton({
  title,
  build,
  disabled,
}: {
  title: string;
  build: () => string | Promise<string>;
  disabled?: boolean;
}) {
  const [req, setReq] = useState<ShareRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const open = async () => {
    setBusy(true);
    try {
      setReq({ title, message: await build() });
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={disabled || busy}
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-[#0B3B1E] hover:opacity-90 disabled:opacity-50 sm:flex-none cursor-pointer"
      >
        <Share2 className="h-4 w-4" /> {busy ? "Preparing…" : "WhatsApp"}
      </button>
      {req && <SharePreview request={req} onClose={() => setReq(null)} />}
    </>
  );
}

export const today = () =>
  new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/* ───────── Column chooser (remembered per table on this device) ───────── */
export type ColumnDef = { id: string; label: string };

export function useColumns(tableId: string, columns: ColumnDef[], defaults?: string[]) {
  const storageKey = `mut:cols:${tableId}`;
  const initial = defaults ?? columns.map((c) => c.id);
  const [visible, setVisible] = useState<string[]>(initial);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (Array.isArray(saved)) setVisible(saved.filter((id) => columns.some((c) => c.id === id)));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const save = (next: string[]) => {
    setVisible(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };
  const toggle = (id: string) => save(visible.includes(id) ? visible.filter((v) => v !== id) : [...visible, id]);
  const reset = () => {
    setVisible(initial);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };
  const show = (id: string) => visible.includes(id);
  return { visible, show, toggle, reset, columns };
}

/* Category columns use ids "cat:<name>"; returns the visible category names */
export const visibleCats = (show: (id: string) => boolean) => CATEGORIES.filter((c) => show(catKey(c)));
export const catColumns: ColumnDef[] = CATEGORIES.map((c) => ({ id: catKey(c), label: c }));

export function ColumnsMenu({ cols }: { cols: ReturnType<typeof useColumns> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hidden = cols.columns.length - cols.columns.filter((c) => cols.show(c.id)).length;

  return (
    <div ref={ref} className="relative flex-1 sm:flex-none">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 cursor-pointer"
      >
        <Columns3 className="h-4 w-4" /> Columns{hidden > 0 && <span className="text-slate-400">({hidden} hidden)</span>}
      </button>
      {open && (
        <>
          {/* phone: dim the page behind the sheet */}
          <div className="fixed inset-0 z-40 bg-slate-900/40 sm:hidden" aria-hidden onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="Choose columns"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-3xl bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:z-30 sm:mt-2 sm:max-h-80 sm:w-60 sm:rounded-xl sm:p-2 sm:pb-2 sm:ring-1 sm:ring-slate-200"
          >
            <div className="mb-1 flex justify-center pt-1 sm:hidden">
              <span className="h-1.5 w-10 rounded-full bg-slate-300" />
            </div>
            <p className="px-2.5 pb-1 pt-2 text-sm font-bold text-slate-900 sm:hidden">Show columns</p>
            {cols.columns.map((c) => (
              <label
                key={c.id}
                className="flex min-h-11 items-center gap-3 rounded-lg px-2.5 text-base text-slate-700 hover:bg-slate-50 sm:min-h-0 sm:py-2 sm:text-sm cursor-pointer"
              >
                <input type="checkbox" checked={cols.show(c.id)} onChange={() => cols.toggle(c.id)} className="h-5 w-5 accent-purple-700 sm:h-4 sm:w-4" />
                {c.label}
              </label>
            ))}
            <div className="mt-2 flex gap-2 border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={cols.reset}
                className="min-h-11 flex-1 rounded-lg px-2.5 text-left text-sm font-semibold text-purple-700 hover:bg-purple-50 sm:min-h-0 sm:py-2 sm:text-xs cursor-pointer"
              >
                Show all columns
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white sm:hidden cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
