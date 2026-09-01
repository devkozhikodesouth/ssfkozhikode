"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle2,
  Share2,
  Download,
  Search,
  ArrowUpDown,
  Building2,
  Layers,
  Sparkles,
  Trophy,
  RefreshCw,
  X,
  ExternalLink,
  Phone,
  Ticket,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAttendanceMode } from "@/app/utils/useAttendanceMode";

export interface SectorSummaryItem {
  _id: string;
  sectorName: string;
  divisionId: string;
  divisionName: string;
  registeredCount: number;
  attendedCount: number;
}

export interface DelegateItem {
  _id: string;
  name: string;
  mobile: string;
  designation: string;
  organizationLevel: string;
  attendance: boolean;
  ticket?: string;
}

type SortKey =
  | "registeredCount"
  | "attendedCount"
  | "sectorName"
  | "divisionName";

export default function GC26SectorRankingList({
  initialDivision = "all",
  showDivisionSelector = true,
}: {
  initialDivision?: string;
  showDivisionSelector?: boolean;
}) {
  const [sectors, setSectors] = useState<SectorSummaryItem[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>(initialDivision);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("registeredCount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Delegate Drilldown Modal
  const [activeModalSector, setActiveModalSector] = useState<SectorSummaryItem | null>(null);
  const [modalDelegates, setModalDelegates] = useState<DelegateItem[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");

  const { attendanceMode } = useAttendanceMode();

  const fetchSectorData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const url =
        selectedDivision && selectedDivision !== "all"
          ? `/api/admin/gc26/sectorwise?division=${encodeURIComponent(selectedDivision)}`
          : "/api/admin/gc26/sectorwise";

      const res = await fetch(url, { credentials: "include", cache: "no-store" });
      const data = await res.json();

      if (res.ok && data.success) {
        setSectors(data.sectors || []);
        if (data.summary?.divisions) {
          setDivisions(data.summary.divisions);
        }
      } else {
        setError(data.message || "Failed to load sector data");
      }
    } catch (err: any) {
      console.error("Error fetching sector-wise data:", err);
      setError("Failed to load sector data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSectorData();
  }, [selectedDivision]);

  // Open Delegate Drilldown Modal
  const openSectorDelegates = async (sector: SectorSummaryItem) => {
    setActiveModalSector(sector);
    setLoadingModal(true);
    setModalSearch("");
    try {
      const res = await fetch(
        `/api/admin/gc26/sectorwise/${encodeURIComponent(sector.divisionName)}`,
        { credentials: "include", cache: "no-store" }
      );
      const data = await res.json();
      if (res.ok && data.sectors) {
        const matched = data.sectors.find(
          (s: any) => s.sectorName.toLowerCase() === sector.sectorName.toLowerCase()
        );
        setModalDelegates(matched?.registrations || []);
      } else {
        setModalDelegates([]);
      }
    } catch (e) {
      console.error("Error fetching sector delegates:", e);
      setModalDelegates([]);
    } finally {
      setLoadingModal(false);
    }
  };

  // Filtered & Sorted Sectors
  const filteredAndSortedSectors = useMemo(() => {
    let list = [...sectors];

    // Search query filter (sectorName or divisionName)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.sectorName.toLowerCase().includes(q) ||
          s.divisionName.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "sectorName") {
        cmp = a.sectorName.localeCompare(b.sectorName);
      } else if (sortKey === "divisionName") {
        cmp = a.divisionName.localeCompare(b.divisionName);
      } else if (sortKey === "attendedCount") {
        cmp = a.attendedCount - b.attendedCount;
      } else {
        cmp = a.registeredCount - b.registeredCount;
      }

      return sortOrder === "asc" ? cmp : -cmp;
    });

    return list;
  }, [sectors, searchQuery, sortKey, sortOrder]);

  // Global Totals
  const totalRegistered = useMemo(
    () => sectors.reduce((sum, s) => sum + s.registeredCount, 0),
    [sectors]
  );
  const totalAttended = useMemo(
    () => sectors.reduce((sum, s) => sum + s.attendedCount, 0),
    [sectors]
  );

  const maxRegistered = useMemo(
    () => Math.max(...sectors.map((s) => s.registeredCount), 1),
    [sectors]
  );

  const topSector = useMemo(() => {
    if (sectors.length === 0) return null;
    return [...sectors].sort((a, b) => b.registeredCount - a.registeredCount)[0];
  }, [sectors]);

  // Sort Handler
  const sortBy = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder(key === "sectorName" || key === "divisionName" ? "asc" : "desc");
    }
  };

  const toggleSortDirection = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // WhatsApp Sector Delegate List Share from Modal
  const shareSectorDelegateListToWhatsApp = (
    sector: SectorSummaryItem,
    delegates: DelegateItem[]
  ) => {
    if (!delegates || delegates.length === 0) return;

    const listItems = delegates
      .map((d, i) => {
        let line = `${i + 1}. *${d.name}* (${d.designation || "Delegate"})\n   📱 ${d.mobile} | 🎫 ${d.ticket || "N/A"}`;
        if (attendanceMode) {
          line += ` | ${d.attendance ? "✅ Present" : "❌ Not Marked"}`;
        }
        return line;
      })
      .join("\n\n");

    let text = `*Grand Conclave 26 — ${sector.sectorName} Sector Delegates*\n🏢 *Division:* ${sector.divisionName}\n📊 *Total Registered:* ${delegates.length}`;
    if (attendanceMode) {
      const att = delegates.filter((d) => d.attendance).length;
      text += `\n✅ *Total Attended:* ${att}`;
    }
    text += `\n\n${listItems}\n\n*SSF Kozhikode South*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // WhatsApp Full Ranking List Share
  const shareAllSectorsToWhatsApp = () => {
    if (filteredAndSortedSectors.length === 0) return;

    const listItems = filteredAndSortedSectors
      .map((s, i) => {
        let medal = "";
        if (i === 0) medal = "🥇 ";
        else if (i === 1) medal = "🥈 ";
        else if (i === 2) medal = "🥉 ";

        let line = `${medal}${i + 1}. *${s.sectorName}* (${s.divisionName}): *${s.registeredCount}*`;
        if (attendanceMode) {
          line += ` (Att: ${s.attendedCount})`;
        }
        return line;
      })
      .join("\n");

    const scopeTitle =
      selectedDivision === "all"
        ? "All Sectors (Kozhikode South)"
        : `${selectedDivision} Division Sectors`;

    let text = `*GRAND CONCLAVE ’26 🌟*\n> 10th Sep Thursday 5:30pm @Markaz\n\n📊 *Sector-Wise Registration Ranking — ${scopeTitle}*\n\n${listItems}\n\n━━━━━━━━━━━━━━━\n👥 *Total Sector Delegates:* ${totalRegistered}\n📍 *Total Sectors:* ${sectors.length}`;
    if (attendanceMode) {
      text += `\n✅ *Total Attended:* ${totalAttended}`;
    }
    text += `\n\n©️ *SSF Kozhikode South*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // WhatsApp Single Delegate Share from Drilldown
  const shareSingleDelegateToWhatsApp = (d: DelegateItem, sectorName: string, divisionName: string) => {
    let text = `*Grand Conclave 26 — SSF Kozhikode South*\n\n📌 *Delegate Details*\n👤 *Name:* ${d.name}\n📱 *Mobile:* ${d.mobile}\n🏷️ *Designation:* ${d.designation || "Delegate"}\n🎫 *Ticket:* ${d.ticket || "N/A"}\n📍 *Sector / Division:* ${sectorName} / ${divisionName}`;
    if (attendanceMode) {
      text += `\n✅ *Attendance:* ${d.attendance ? "Present" : "Not Marked"}`;
    }
    text += `\n\nThank you!`;

    const cleanMobile = d.mobile ? d.mobile.replace(/\D/g, "") : "";
    const phoneParam = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const url = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Export CSV of Sector Registration Single List
  const downloadCSV = () => {
    if (filteredAndSortedSectors.length === 0) {
      alert("No sector data to export.");
      return;
    }

    const headers = ["Rank", "Sector Name", "Division Name", "Registered Delegates"];
    if (attendanceMode) {
      headers.push("Attended Delegates", "Attendance %");
    }

    const rows: string[][] = filteredAndSortedSectors.map((s, i) => {
      const row = [
        String(i + 1),
        `"${s.sectorName.replace(/"/g, '""')}"`,
        `"${s.divisionName.replace(/"/g, '""')}"`,
        String(s.registeredCount),
      ];
      if (attendanceMode) {
        const attRate = s.registeredCount > 0 ? `${Math.round((s.attendedCount / s.registeredCount) * 100)}%` : "0%";
        row.push(String(s.attendedCount), attRate);
      }
      return row;
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanDiv = (selectedDivision === "all" ? "All_Divisions" : selectedDivision).replace(/[^a-zA-Z0-9_-]/g, "_");
    link.setAttribute("download", `GC26_Sector_Wise_Registration_Counts_${cleanDiv}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "registeredCount", label: "Registered Count" },
    ...(attendanceMode ? [{ key: "attendedCount" as SortKey, label: "Attended Count" }] : []),
    { key: "sectorName", label: "Sector (A-Z)" },
    { key: "divisionName", label: "Division (A-Z)" },
  ];

  return (
    <div className="space-y-6">
      {/* ───────── Top Stat Cards ───────── */}
      <div className={`grid ${attendanceMode ? "grid-cols-3" : "grid-cols-2"} gap-3 sm:gap-6`}>
        {/* Total Registered */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Sector Delegates</p>
            <p className="text-2xl sm:text-3xl font-black text-purple-700">{totalRegistered}</p>
          </div>
        </div>

        {/* Total Sectors */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Sectors</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-700">{sectors.length}</p>
          </div>
        </div>

        {/* Attendance (Optional) */}
        {attendanceMode && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Attended</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700">{totalAttended}</p>
            </div>
          </div>
        )}
      </div>

      {/* ───────── Main Sector Single List Container ───────── */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {/* Header & Main Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Sector Wise Registered Delegates List
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Consolidated single list of all sectors and their registration counts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Division Selector */}
            {showDivisionSelector && (
              <div className="relative flex-1 sm:flex-initial sm:w-60">
                <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-purple-600 pointer-events-none" />
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white shadow-sm transition cursor-pointer"
                >
                  <option value="all">All Divisions (All Sectors)</option>
                  {divisions.map((d) => (
                    <option key={d} value={d}>
                      {d} Division
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Share Full List */}
            <button
              type="button"
              onClick={shareAllSectorsToWhatsApp}
              disabled={filteredAndSortedSectors.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Share ranking list to WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Ranking List</span>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={downloadCSV}
              disabled={filteredAndSortedSectors.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Export single list as CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => fetchSectorData(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 cursor-pointer"
              title="Refresh sector data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-purple-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* ───────── Search & Sort Bar ───────── */}
        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by sector or division name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap items-center gap-1.5 justify-start md:justify-end">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-600" />
              Sort:
            </span>

            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => sortBy(opt.key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sortKey === opt.key
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{opt.label}</span>
                {sortKey === opt.key && (
                  <span className="text-[10px]">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            ))}

            <button
              type="button"
              onClick={toggleSortDirection}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Toggle sort direction"
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <ArrowDown className="w-4 h-4 text-purple-600" />
              )}
            </button>
          </div>
        </div>

        {/* ───────── Content: Single List / Table ───────── */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100">
            <p className="text-purple-600 font-bold animate-pulse text-base">
              Loading sector-wise registration counts...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 text-center bg-red-50 rounded-2xl border border-red-200 text-red-700 font-semibold">
            {error}
          </div>
        ) : filteredAndSortedSectors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 space-y-2">
            <p className="text-slate-700 font-extrabold text-lg">No sectors found</p>
            <p className="text-slate-500 text-xs sm:text-sm">
              Try adjusting your search query or division filter.
            </p>
          </div>
        ) : (
          <div>
            {/* List Header Count Indicator */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 pb-2 px-1">
              <span>Showing {filteredAndSortedSectors.length} sectors in single list</span>
              <span>
                Sorted by {sortOptions.find((o) => o.key === sortKey)?.label} ({sortOrder === "asc" ? "Low to High" : "High to Low"})
              </span>
            </div>

            {/* ───────── Mobile Card List View ───────── */}
            <div className="space-y-3 md:hidden">
              {filteredAndSortedSectors.map((s, idx) => {
                const isTop3 = idx < 3 && sortKey === "registeredCount" && sortOrder === "desc";
                const rankMedal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;

                return (
                  <div
                    key={s._id}
                    onClick={() => openSectorDelegates(s)}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3 hover:border-purple-400 hover:shadow-md transition cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                            isTop3
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {rankMedal || `#${idx + 1}`}
                        </span>
                        <div>
                          <p className="font-extrabold text-slate-900 text-base">{s.sectorName}</p>
                          <span className="inline-block text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md mt-0.5">
                            {s.divisionName} Division
                          </span>
                        </div>
                      </div>

                      {/* Registered Count Badge */}
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-xl bg-purple-600 text-white font-black text-sm shadow-sm">
                          {s.registeredCount} Reg
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar relative to max sector */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max((s.registeredCount / maxRegistered) * 100, 3)}%`,
                        }}
                      />
                    </div>

                    {/* Attendance Info (if mode on) */}
                    {attendanceMode && (
                      <div className="flex justify-between items-center text-xs bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                        <span className="text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Attended:
                        </span>
                        <span className="font-black text-emerald-700">
                          {s.attendedCount} / {s.registeredCount}{" "}
                          ({s.registeredCount > 0 ? Math.round((s.attendedCount / s.registeredCount) * 100) : 0}%)
                        </span>
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <span>Tap to view delegates</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {s.registeredCount} delegates
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ───────── Desktop Single List Table View ───────── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200 font-semibold text-xs uppercase tracking-wider">
                    <th className="pb-3 w-16 text-center">Rank</th>
                    <th
                      onClick={() => sortBy("sectorName")}
                      className="pb-3 cursor-pointer select-none hover:text-slate-900 transition"
                    >
                      <div className="flex items-center gap-1">
                        Sector Name
                        <ArrowUpDown className={`w-3.5 h-3.5 ${sortKey === "sectorName" ? "text-purple-600" : "text-slate-400"}`} />
                      </div>
                    </th>
                    <th
                      onClick={() => sortBy("divisionName")}
                      className="pb-3 cursor-pointer select-none hover:text-slate-900 transition"
                    >
                      <div className="flex items-center gap-1">
                        Division
                        <ArrowUpDown className={`w-3.5 h-3.5 ${sortKey === "divisionName" ? "text-purple-600" : "text-slate-400"}`} />
                      </div>
                    </th>
                    <th
                      onClick={() => sortBy("registeredCount")}
                      className="pb-3 text-right cursor-pointer select-none hover:text-slate-900 transition w-44"
                    >
                      <div className="flex items-center justify-end gap-1">
                        Registered Delegates
                        <ArrowUpDown className={`w-3.5 h-3.5 ${sortKey === "registeredCount" ? "text-purple-600" : "text-slate-400"}`} />
                      </div>
                    </th>
                    {attendanceMode && (
                      <th
                        onClick={() => sortBy("attendedCount")}
                        className="pb-3 text-center cursor-pointer select-none hover:text-slate-900 transition"
                      >
                        <div className="flex items-center justify-center gap-1">
                          Attendance
                          <ArrowUpDown className={`w-3.5 h-3.5 ${sortKey === "attendedCount" ? "text-purple-600" : "text-slate-400"}`} />
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAndSortedSectors.map((s, idx) => {
                    const isTop3 = idx < 3 && sortKey === "registeredCount" && sortOrder === "desc";
                    const rankMedal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;

                    return (
                      <motion.tr
                        key={s._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.015, 0.3) }}
                        onClick={() => openSectorDelegates(s)}
                        className="hover:bg-purple-50/70 transition group cursor-pointer"
                        title="Click to view delegates in this sector"
                      >
                        {/* Rank */}
                        <td className="py-3.5 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                              isTop3
                                ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {rankMedal || `#${idx + 1}`}
                          </span>
                        </td>

                        {/* Sector Name */}
                        <td className="py-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm text-slate-900 group-hover:text-purple-700 transition">
                              {s.sectorName}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition" />
                          </div>
                        </td>

                        {/* Division */}
                        <td className="py-3.5">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                            {s.divisionName}
                          </span>
                        </td>

                        {/* Registered Count & Mini Progress */}
                        <td className="py-3.5 text-right">
                          <div className="inline-flex flex-col items-end">
                            <span className="text-base font-black text-purple-700">
                              {s.registeredCount}
                            </span>
                            <div className="w-24 bg-slate-100 rounded-full h-1 mt-0.5 overflow-hidden">
                              <div
                                className="bg-purple-600 h-full rounded-full"
                                style={{
                                  width: `${Math.max((s.registeredCount / maxRegistered) * 100, 4)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Attendance */}
                        {attendanceMode && (
                          <td className="py-3.5 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <span className="font-bold text-emerald-700">
                                {s.attendedCount} / {s.registeredCount}
                              </span>
                              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {s.registeredCount > 0 ? Math.round((s.attendedCount / s.registeredCount) * 100) : 0}%
                              </span>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ───────── Sector Delegates Drilldown Modal ───────── */}
      <AnimatePresence>
        {activeModalSector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalSector(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center gap-3">
                <div>
                  <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    {activeModalSector.sectorName} Sector Delegates
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {activeModalSector.divisionName} Division • {activeModalSector.registeredCount} registered
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      shareSectorDelegateListToWhatsApp(activeModalSector, modalDelegates)
                    }
                    disabled={modalDelegates.length === 0 || loadingModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Share delegate list to WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Share Delegate List</span>
                    <span className="sm:hidden">Share List</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalSector(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Search Bar */}
              <div className="p-3 sm:p-4 border-b border-slate-100 bg-white">
                <div className="relative">
                  <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search delegates in this sector..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Modal Body: Delegates List */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
                {loadingModal ? (
                  <p className="text-center py-8 text-purple-600 font-bold animate-pulse text-sm">
                    Loading delegate records...
                  </p>
                ) : modalDelegates.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 font-medium text-sm">
                    No delegates found for this sector.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {modalDelegates
                      .filter((d) => {
                        if (!modalSearch.trim()) return true;
                        const q = modalSearch.toLowerCase().trim();
                        return (
                          d.name.toLowerCase().includes(q) ||
                          d.mobile.includes(q) ||
                          d.designation?.toLowerCase().includes(q) ||
                          d.ticket?.toLowerCase().includes(q)
                        );
                      })
                      .map((d, i) => (
                        <div
                          key={`${d.name}-${d.mobile}-${i}`}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:border-purple-300 transition"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                              <span className="font-extrabold text-slate-900 text-sm">{d.name}</span>
                              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.2 rounded">
                                {d.ticket || "—"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-semibold">
                              {d.designation || "Delegate"} • 📱 {d.mobile}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                            {attendanceMode && (
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  d.attendance
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {d.attendance ? "✅ Present" : "❌ Absent"}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                shareSingleDelegateToWhatsApp(
                                  d,
                                  activeModalSector.sectorName,
                                  activeModalSector.divisionName
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() =>
                    shareSectorDelegateListToWhatsApp(activeModalSector, modalDelegates)
                  }
                  disabled={modalDelegates.length === 0 || loadingModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Delegate List</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalSector(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
