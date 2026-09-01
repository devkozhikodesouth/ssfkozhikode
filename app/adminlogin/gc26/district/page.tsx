"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle2,
  Share2,
  Download,
  Search,
  ArrowUpDown,
  Filter,
  Shield,
  Phone,
  Ticket,
  Sparkles,
} from "lucide-react";
import { useAttendanceMode } from "@/app/utils/useAttendanceMode";

interface DistrictDelegate {
  _id: string;
  name: string;
  mobile: string;
  designation: string;
  organizationLevel: string;
  attendance: boolean;
  ticket?: string;
  createdAt?: string;
}

export default function GC26DistrictDelegatesPage() {
  const [delegates, setDelegates] = useState<DistrictDelegate[]>([]);
  const [designationBreakdown, setDesignationBreakdown] = useState<
    Record<string, { total: number; attended: number }>
  >({});
  const [designations, setDesignations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedDesignation, setSelectedDesignation] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAttendedOnly, setShowAttendedOnly] = useState(false);
  const [sortKey, setSortKey] = useState<"name" | "designation" | "createdAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { attendanceMode } = useAttendanceMode();

  const fetchDistrictData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/gc26/district", {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setDelegates(data.delegates || []);
        setDesignationBreakdown(data.designationBreakdown || {});
        setDesignations(data.designations || []);
      } else {
        setError(data.message || "Failed to load district delegates");
      }
    } catch (err: any) {
      console.error(err);
      setError("Error fetching district delegates data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistrictData();
  }, []);

  // Filtered & Sorted Delegates
  const filteredDelegates = useMemo(() => {
    let result = [...delegates];

    // Filter by Designation
    if (selectedDesignation !== "all") {
      result = result.filter(
        (d) => d.designation?.toLowerCase() === selectedDesignation.toLowerCase()
      );
    }

    // Filter by Attendance
    if (attendanceMode && showAttendedOnly) {
      result = result.filter((d) => d.attendance === true);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.mobile?.includes(q) ||
          d.ticket?.toLowerCase().includes(q) ||
          d.designation?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = (a.name || "").localeCompare(b.name || "");
      } else if (sortKey === "designation") {
        cmp = (a.designation || "").localeCompare(b.designation || "");
      } else if (sortKey === "createdAt") {
        cmp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [delegates, selectedDesignation, showAttendedOnly, searchQuery, sortKey, sortOrder, attendanceMode]);

  const totalRegistered = delegates.length;
  const totalAttended = delegates.filter((d) => d.attendance).length;

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // WhatsApp Single Delegate Share
  const shareSingleToWhatsApp = (d: DistrictDelegate) => {
    let text = `*Grand Conclave 26 — SSF Kozhikode South*\n\n📌 *District Delegate Details*\n👤 *Name:* ${d.name}\n📱 *Mobile:* ${d.mobile}\n🏷️ *Designation:* ${d.designation || "District Delegate"}\n🎫 *Ticket:* ${d.ticket || "N/A"}\n📍 *Level:* District Level`;
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

  // WhatsApp Summary Share (sorted descending by count)
  const shareSummaryToWhatsApp = () => {
    if (delegates.length === 0) return;

    // Sort designations descending by count
    const sortedEntries = Object.entries(designationBreakdown).sort(
      ([, a], [, b]) => b.total - a.total
    );

    const listItems = sortedEntries
      .map(([des, stats], i) => {
        let line = `${i + 1}. *${des}*: ${stats.total}`;
        if (attendanceMode) {
          line += ` (Attended: ${stats.attended})`;
        }
        return line;
      })
      .join("\n");

    let text = `*GRAND CONCLAVE ’26 🌟*\n> 10th Sep Thursday 5:30pm @Markaz\n\n📌 *District Delegates Summary*\n\n${listItems}\n\n📊 *Total District Delegates:* ${totalRegistered}`;
    if (attendanceMode) {
      text += `\n✅ *Total Attended:* ${totalAttended}`;
    }
    text += `\n\n©️ *SSF Kozhikode South District*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // WhatsApp Full / Filtered List Share
  const shareFilteredListToWhatsApp = () => {
    if (filteredDelegates.length === 0) return;

    const designationTitle =
      selectedDesignation === "all" ? "All District Delegates" : `${selectedDesignation}s`;

    const listItems = filteredDelegates
      .map((d, i) => {
        let line = `${i + 1}. *${d.name}* (${d.designation || "District Delegate"})\n   📱 ${d.mobile} | 🎫 ${d.ticket || "N/A"}`;
        if (attendanceMode) {
          line += ` | ${d.attendance ? "✅ Present" : "❌ Not Marked"}`;
        }
        return line;
      })
      .join("\n\n");

    let text = `*Grand Conclave 26 — ${designationTitle}*\n📊 *Total Delegates:* ${filteredDelegates.length}`;
    if (attendanceMode) {
      const att = filteredDelegates.filter((d) => d.attendance).length;
      text += `\n✅ *Total Attended:* ${att}`;
    }
    text += `\n\n${listItems}\n\n*SSF Kozhikode South*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Export CSV
  const downloadCSV = () => {
    if (filteredDelegates.length === 0) return;

    const headers = ["#", "Name", "Mobile", "Designation", "Level", "Ticket"];
    if (attendanceMode) headers.push("Attendance");

    const rows = filteredDelegates.map((d, i) => {
      const row = [
        String(i + 1),
        `"${d.name.replace(/"/g, '""')}"`,
        d.mobile,
        `"${(d.designation || "").replace(/"/g, '""')}"`,
        "District",
        d.ticket || "",
      ];
      if (attendanceMode) {
        row.push(d.attendance ? "Present" : "Absent");
      }
      return row.join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `GC26_District_Delegates_${selectedDesignation.replace(/[^a-zA-Z0-9_-]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-800 flex items-center gap-2">
            <Shield className="w-7 h-7 text-purple-600" />
            District Level Delegates
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Grand Conclave 26 — District Leaders & Committee Members
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={shareSummaryToWhatsApp}
            disabled={delegates.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Summary</span>
          </button>

          <button
            onClick={shareFilteredListToWhatsApp}
            disabled={filteredDelegates.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share List</span>
          </button>

          <button
            onClick={downloadCSV}
            disabled={filteredDelegates.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className={`grid ${attendanceMode ? "grid-cols-3" : "grid-cols-2"} gap-3 sm:gap-6`}>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total District</p>
            <p className="text-2xl sm:text-3xl font-black text-purple-700">{totalRegistered}</p>
          </div>
        </div>

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

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Filtered Count</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-700">{filteredDelegates.length}</p>
          </div>
        </div>
      </div>

      {/* Designation Filter Chips */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-purple-600" />
            Filter by Designation:
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {designations.length} designation categories
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* All Designations Button */}
          <button
            type="button"
            onClick={() => setSelectedDesignation("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedDesignation === "all"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 scale-105"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>All Designations</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedDesignation === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-800"
              }`}
            >
              {totalRegistered}
            </span>
          </button>

          {/* Individual Designation Chips */}
          {designations.map((des) => {
            const stats = designationBreakdown[des] || { total: 0, attended: 0 };
            const isActive = selectedDesignation.toLowerCase() === des.toLowerCase();

            return (
              <button
                key={des}
                type="button"
                onClick={() => setSelectedDesignation(des)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{des}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {stats.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Secondary Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, mobile, ticket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
          />
        </div>

        {/* Filters and Sorting Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {attendanceMode && (
            <button
              type="button"
              onClick={() => setShowAttendedOnly(!showAttendedOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                showAttendedOnly
                  ? "bg-emerald-600 text-white border-emerald-600 shadow"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{showAttendedOnly ? "Attended Only" : "Show Attended Only"}</span>
            </button>
          )}

          {/* Sort Menu Buttons */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 px-2">Sort:</span>
            {[
              { key: "name" as const, label: "Name" },
              { key: "designation" as const, label: "Designation" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSort(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  sortKey === key
                    ? "bg-white text-purple-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
                {sortKey === key && (
                  <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-purple-600 font-bold animate-pulse text-base">
            Loading district delegates...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 text-red-700 font-semibold">
          {error}
        </div>
      ) : filteredDelegates.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <p className="text-slate-700 font-extrabold text-lg">No district delegates found</p>
          <p className="text-slate-500 text-xs sm:text-sm">
            Try adjusting your designation filter or search query.
          </p>
        </div>
      ) : (
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
            <span>Showing {filteredDelegates.length} delegates</span>
            <span>Grand Conclave 26</span>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {filteredDelegates.map((d, i) => (
              <div
                key={d._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 hover:border-purple-300 transition shadow-sm"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 mr-1.5">#{i + 1}</span>
                    <span className="text-base font-black text-slate-900">{d.name}</span>
                  </div>
                  <span className="text-xs font-mono font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                    {d.ticket || "—"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="space-y-0.5">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-extrabold text-xs">
                      {d.designation || "District Delegate"}
                    </span>
                    <p className="text-xs text-slate-600 font-semibold mt-1">📱 {d.mobile}</p>
                  </div>

                  {attendanceMode && (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        d.attendance
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {d.attendance ? "✅ Present" : "❌ Absent"}
                    </span>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-end">
                  <button
                    onClick={() => shareSingleToWhatsApp(d)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200 font-semibold text-xs uppercase tracking-wider">
                  <th className="pb-3 w-12 text-center">#</th>
                  <th
                    onClick={() => handleSort("name")}
                    className="pb-3 cursor-pointer hover:text-slate-900 transition"
                  >
                    <div className="flex items-center gap-1">
                      Name
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="pb-3">Mobile</th>
                  <th
                    onClick={() => handleSort("designation")}
                    className="pb-3 cursor-pointer hover:text-slate-900 transition"
                  >
                    <div className="flex items-center gap-1">
                      Designation
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="pb-3">Ticket</th>
                  {attendanceMode && (
                    <th className="pb-3 text-center">Attendance</th>
                  )}
                  <th className="pb-3 text-center">Share</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDelegates.map((d, i) => (
                  <motion.tr
                    key={d._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.015 }}
                    className="hover:bg-purple-50/50 transition"
                  >
                    <td className="py-3.5 text-center text-slate-400 font-mono text-xs">
                      {i + 1}
                    </td>
                    <td className="py-3.5 font-bold text-slate-900">
                      {d.name}
                    </td>
                    <td className="py-3.5 text-slate-700 font-mono text-xs">
                      {d.mobile}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                        {d.designation || "District Delegate"}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-purple-700 text-xs">
                      {d.ticket || "—"}
                    </td>
                    {attendanceMode && (
                      <td className="py-3.5 text-center">
                        {d.attendance ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Present
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">
                            —
                          </span>
                        )}
                      </td>
                    )}
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => shareSingleToWhatsApp(d)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
