"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Share2,
  ReceiptText,
  RefreshCw,
  Download,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
} from "lucide-react";
import {
  FUND_GROUPS,
  FundEntryRow,
  FundGroup,
  FundMemberSummary,
  formatDate,
  formatINR,
  progressTone,
  membersSummaryMessage,
  downloadMembersCsv,
} from "@/app/utils/fund";
import ProgressBar from "./ProgressBar";
import AddEntryDrawer from "./AddEntryDrawer";
import ReceiptView from "./ReceiptView";
import MemberPicker from "./MemberPicker";
import SharePreview, { ShareRequest } from "./SharePreview";

type Totals = { target: number; collected: number; balance: number; percent: number };

const REFRESH_MS = 30_000;

type StatusFilter = "all" | "green" | "orange" | "red" | "zero";
type SortDir = "desc" | "asc";

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "green", label: "80%+" },
  { id: "orange", label: "40–79%" },
  { id: "red", label: "Below 40%" },
  { id: "zero", label: "Not started" },
];

const matchesStatus = (m: FundMemberSummary, f: StatusFilter) =>
  f === "all" ? true : f === "zero" ? m.collected === 0 : progressTone(m.percent) === f;
// Executive keeps the original key so existing phones remember their selection
const storageKey = (g: FundGroup) => (g === "executive" ? "fc:selectedMember" : `fc:selectedMember:${g}`);

const readStored = (g: FundGroup) => {
  try {
    return localStorage.getItem(storageKey(g)) || "";
  } catch {
    return "";
  }
};
const writeStored = (g: FundGroup, v: string) => {
  try {
    v ? localStorage.setItem(storageKey(g), v) : localStorage.removeItem(storageKey(g));
  } catch {
    /* storage unavailable: selection just isn't remembered */
  }
};

export default function FundChallenge({
  group,
  fundKey,
}: {
  group: FundGroup;
  fundKey: string; // secret link key, sent with every API call
}) {
  const cfg = FUND_GROUPS[group];
  const [members, setMembers] = useState<FundMemberSummary[]>([]);
  const [totals, setTotals] = useState<Totals>({ target: 0, collected: 0, balance: 0, percent: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [entries, setEntries] = useState<FundEntryRow[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showAdd, setShowAdd] = useState(false);
  const [receipt, setReceipt] = useState<FundEntryRow | null>(null);
  const [sharing, setSharing] = useState<ShareRequest | null>(null);
  const memberSectionRef = useRef<HTMLElement>(null);

  /* ---------------- Data loading ---------------- */
  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/fund?key=${encodeURIComponent(fundKey)}`, { cache: "no-store" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setMembers(data.members);
      setTotals(data.totals);
      setLoadError("");
    } catch {
      setLoadError("Couldn't load the latest data. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [fundKey]);

  const loadEntries = useCallback(async (memberId: string) => {
    if (!memberId) return setEntries([]);
    setEntriesLoading(true);
    try {
      const res = await fetch(
        `/api/fund/entries?key=${encodeURIComponent(fundKey)}&memberId=${memberId}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setEntries(data.success ? data.entries : []);
    } catch {
      setEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  }, [fundKey]);

  useEffect(() => {
    setSelectedId(readStored(group));
    loadDashboard();
  }, [loadDashboard, group]);

  // Live: refresh while visible, and immediately when the tab comes back
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") loadDashboard();
    }, REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && loadDashboard();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadDashboard]);

  useEffect(() => {
    loadEntries(selectedId);
  }, [selectedId, loadEntries]);

  // Drop a remembered member who no longer exists / was deactivated
  useEffect(() => {
    if (!loading && selectedId && !members.some((m) => m._id === selectedId)) {
      setSelectedId("");
      writeStored(group, "");
    }
  }, [loading, members, selectedId]);

  const selected = members.find((m) => m._id === selectedId) || null;

  const ranked = useMemo(() => members.map((m, i) => ({ ...m, rank: i + 1 })), [members]);
  // Rank is always by collection; search, status filter and sort only change what is shown
  const statusCounts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: 0, green: 0, orange: 0, red: 0, zero: 0 };
    for (const m of ranked) {
      c.all++;
      c[progressTone(m.percent)]++;
      if (m.collected === 0) c.zero++;
    }
    return c;
  }, [ranked]);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = ranked.filter(
      (m) => matchesStatus(m, statusFilter) && (!q || m.name.toLowerCase().includes(q))
    );
    // ranked is already highest collection first
    return sortDir === "asc" ? rows.reverse() : rows;
  }, [ranked, search, statusFilter, sortDir]);

  const isFiltered = search.trim() !== "" || statusFilter !== "all";

  const alphabetical = useMemo(
    () => [...members].sort((a, b) => a.name.localeCompare(b.name)),
    [members]
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    writeStored(group, id);
  };

  // Picking from the list: select, then bring the member summary into view
  const pickFromList = (id: string) => {
    handleSelect(id);
    memberSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSaved = (entry: FundEntryRow) => {
    setShowAdd(false);
    setReceipt(entry);
    // Optimistic: show the entry + new totals at once, then confirm from server
    setEntries((prev) => [entry, ...prev.filter((e) => e._id !== entry._id)]);
    setMembers((prev) =>
      prev
        .map((m) => {
          if (m._id !== entry.memberId) return m;
          const collected = m.collected + entry.amount;
          return {
            ...m,
            collected,
            balance: Math.max(m.target - collected, 0),
            percent: m.target > 0 ? Math.round((collected / m.target) * 100) : 0,
            entryCount: m.entryCount + 1,
          };
        })
        .sort((a, b) => b.collected - a.collected || a.name.localeCompare(b.name))
    );
    setTotals((t) => {
      const collected = t.collected + entry.amount;
      return {
        ...t,
        collected,
        balance: Math.max(t.target - collected, 0),
        percent: t.target > 0 ? Math.round((collected / t.target) * 100) : 0,
      };
    });
    loadDashboard();
    loadEntries(entry.memberId);
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#15803D] to-[#1C75BC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
            <img src="/icon.png" alt="SSF" width={34} height={34} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight">Fund Challenge · {cfg.label}</h1>
            <p className="text-sm text-white/85 truncate">SSF Kozhikode South · District Committee</p>
          </div>
          <button
            type="button"
            onClick={() => loadDashboard()}
            className="ml-auto p-3 rounded-xl bg-white/15 active:bg-white/25 cursor-pointer"
            aria-label="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-4 space-y-5">
        {loadError && (
          <p className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
            {loadError}
          </p>
        )}

        {/* ===== MEMBER SELECTION ===== */}
        <section ref={memberSectionRef} className="scroll-mt-4 bg-white rounded-2xl border border-slate-200 p-4">
          <label htmlFor="fc-member" className="block text-sm font-semibold text-slate-700 mb-2">
            {cfg.memberLabel}
          </label>
          <MemberPicker
            members={alphabetical}
            value={selectedId}
            onChange={handleSelect}
            loading={loading}
          />

          {selected && (
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="Target" value={formatINR(selected.target)} />
                <Stat label="Collected" value={formatINR(selected.collected)} />
                <Stat label="Balance" value={formatINR(selected.balance)} />
              </div>
              <div className="mt-3">
                <ProgressBar percent={selected.percent} />
              </div>

              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="mt-4 w-full py-4 rounded-xl bg-[#15803D] text-white text-base font-semibold flex items-center justify-center gap-2 active:bg-[#166534] cursor-pointer"
              >
                <Plus className="w-5 h-5" /> Add New
              </button>

              {/* Past entries */}
              <h3 className="mt-5 mb-2 text-sm font-semibold text-slate-700">
                Entries {entries.length > 0 && <span className="text-slate-500 font-normal">({entries.length})</span>}
              </h3>
              {entriesLoading && entries.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">Loading entries…</p>
              ) : entries.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">No entries yet. Tap “Add New” to record one.</p>
              ) : (
                <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl">
                  {entries.map((e) => (
                    <li key={e._id} className="flex items-center gap-2 px-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{e.contributorName}</p>
                        <p className="text-xs text-slate-500">
                          {e.receiptNo} · {formatDate(e.date)}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-slate-900 shrink-0">
                        {formatINR(e.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setReceipt(e)}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[#15803D] bg-green-50 text-xs font-semibold active:bg-green-100 cursor-pointer"
                        aria-label={`Open receipt ${e.receiptNo} to view or share`}
                      >
                        <ReceiptText className="w-4 h-4" />
                        Receipt
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* ===== SUMMARY CARDS ===== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard label="Total Target" value={formatINR(totals.target)} loading={loading} />
          <SummaryCard label="Total Collected" value={formatINR(totals.collected)} loading={loading} accent />
          <SummaryCard label="Balance" value={formatINR(totals.balance)} loading={loading} />
          <SummaryCard label="Overall achieved" value={`${totals.percent}%`} loading={loading}>
            <div className="mt-2">
              <ProgressBar percent={totals.percent} showLabel={false} size="sm" />
            </div>
          </SummaryCard>
        </section>

        {/* ===== TABLE ===== */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                All members
                {isFiltered && (
                  <span className="ml-1.5 text-sm font-normal text-slate-500">
                    ({visibleRows.length} of {ranked.length})
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setSharing({ title: "Members summary", message: membersSummaryMessage(visibleRows, totals, cfg.label) })
                  }
                  disabled={visibleRows.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#25D366] text-[#0B3B1E] text-sm font-semibold active:opacity-80 disabled:opacity-50 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => downloadMembersCsv(visibleRows, cfg.label)}
                  disabled={visibleRows.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold active:bg-slate-100 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              </div>
            </div>
            <div className="relative sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1C75BC]"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-3 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                aria-label="Filter by progress"
                className="flex-1 sm:flex-none min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#1C75BC]"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id === "all" ? "All progress" : f.label} ({statusCounts[f.id]})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                aria-label={`Sorted by collected, ${sortDir === "desc" ? "highest" : "lowest"} first. Tap to reverse.`}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 active:bg-slate-100 cursor-pointer"
              >
                {sortDir === "desc" ? <ArrowDownWideNarrow className="w-4 h-4" /> : <ArrowUpNarrowWide className="w-4 h-4" />}
                Collected: {sortDir === "desc" ? "Highest first" : "Lowest first"}
              </button>
              {isFiltered && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="ml-auto px-3 py-2.5 rounded-xl text-sm font-medium text-[#1C75BC] active:bg-blue-50 cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Mobile: cards */}
          <ul className="sm:hidden space-y-2.5">
            {visibleRows.map((m) => (
              <li key={m._id}>
                <button
                  type="button"
                  onClick={() => pickFromList(m._id)}
                  className={`w-full text-left rounded-xl border p-3.5 cursor-pointer ${
                    m._id === selectedId ? "border-[#1C75BC] bg-blue-50" : "border-slate-200 active:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold tabular-nums text-slate-700">
                      {m.rank}
                    </span>
                    <span className="flex-1 min-w-0 font-semibold text-slate-900 truncate">{m.name}</span>
                    <span className="text-right shrink-0">
                      <span className="block text-base font-bold tabular-nums text-slate-900">
                        {formatINR(m.collected)}
                      </span>
                      <span className="block text-xs tabular-nums text-slate-500">of {formatINR(m.target)}</span>
                    </span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar percent={m.percent} size="sm" />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Balance <span className="font-semibold tabular-nums text-slate-800">{formatINR(m.balance)}</span>
                  </p>
                </button>
              </li>
            ))}
            {!loading && visibleRows.length === 0 && (
              <li className="py-6 text-center text-sm text-slate-500">
                {members.length === 0
                ? "No members added yet. The admin can add members and targets from the admin panel."
                : "No member matches these filters."}
              </li>
            )}
          </ul>

          {/* Tablet / desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 pr-2 w-12">Rank</th>
                  <th className="py-2.5 pr-2">Name</th>
                  <th className="py-2.5 pr-2 text-right">Target</th>
                  <th className="py-2.5 pr-2 text-right">Collected</th>
                  <th className="py-2.5 pr-3 text-right">Balance</th>
                  <th className="py-2.5 w-40">Achieved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.map((m) => (
                  <tr
                    key={m._id}
                    onClick={() => pickFromList(m._id)}
                    className={`cursor-pointer ${m._id === selectedId ? "bg-blue-50" : "active:bg-slate-50"}`}
                  >
                    <td className="py-3 pr-2 font-semibold tabular-nums text-slate-600">{m.rank}</td>
                    <td className="py-3 pr-2 font-medium text-slate-900">{m.name}</td>
                    <td className="py-3 pr-2 text-right tabular-nums">{formatINR(m.target)}</td>
                    <td className="py-3 pr-2 text-right tabular-nums font-semibold">{formatINR(m.collected)}</td>
                    <td className="py-3 pr-3 text-right tabular-nums">{formatINR(m.balance)}</td>
                    <td className="py-3">
                      <ProgressBar percent={m.percent} size="sm" />
                    </td>
                  </tr>
                ))}
                {!loading && visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      {members.length === 0
                        ? "No members added yet. The admin can add members and targets from the admin panel."
                        : "No member matches these filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showAdd && selected && (
        <AddEntryDrawer
          member={selected}
          fundKey={fundKey}
          onClose={() => setShowAdd(false)}
          onSaved={handleSaved}
        />
      )}
      {receipt && <ReceiptView entry={receipt} onClose={() => setReceipt(null)} />}
      {sharing && <SharePreview request={sharing} onClose={() => setSharing(null)} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-bold tabular-nums text-slate-900 truncate">{value}</p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  loading,
  accent,
  children,
}: {
  label: string;
  value: string;
  loading: boolean;
  accent?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "bg-[#F0FDF4] border-green-200" : "bg-white border-slate-200"}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums text-slate-900 truncate">
        {loading ? "—" : value}
      </p>
      {children}
    </div>
  );
}
