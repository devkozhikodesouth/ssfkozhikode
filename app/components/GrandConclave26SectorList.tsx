"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  CheckCircle2,
  Download,
  Users,
  Search,
  Layers,
  Filter,
} from "lucide-react";
import { useAttendanceMode } from "@/app/utils/useAttendanceMode";

interface Registration {
  name: string;
  mobile: string;
  designation: string;
  organizationLevel: string;
  attendance: boolean;
  ticket?: string;
  sectorName?: string;
}

interface Sector {
  sectorName: string;
  registrations: Registration[];
}

interface DivisionData {
  divisionName: string;
  totalStudents: number;
  sectors: Sector[];
}

interface ApiError {
  error: string;
}

export default function GrandConclave26SectorList({
  divisionName,
}: {
  divisionName: string;
}) {
  const [data, setData] = useState<DivisionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab State: "all" or specific sectorName
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [showAttendedOnly, setShowAttendedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { attendanceMode } = useAttendanceMode();

  useEffect(() => {
    if (!divisionName) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/gc26/sectorwise/${encodeURIComponent(divisionName)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }
        );

        const result = await res.json();

        if (!res.ok) {
          setError(
            (result as ApiError)?.error || `HTTP error! status: ${res.status}`
          );
          setData(null);
          return;
        }

        const rawData = result as DivisionData;
        // Sort sectors descending by registration count
        if (rawData && Array.isArray(rawData.sectors)) {
          rawData.sectors.sort(
            (a, b) => b.registrations.length - a.registrations.length
          );
        }

        setData(rawData);
        setSelectedSector("all");
        setError(null);
      } catch (err) {
        console.error("Error fetching division sector data:", err);
        setError("Failed to fetch division data. Please try again later.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [divisionName]);

  // Filtered Sectors & Delegates based on active tab, search & attendance
  const sectorsToDisplay = useMemo(() => {
    if (!data || !data.sectors) return [];

    const q = searchQuery.toLowerCase().trim();

    return data.sectors
      .filter((sec) => {
        if (selectedSector === "all") return true;
        return sec.sectorName.toLowerCase() === selectedSector.toLowerCase();
      })
      .map((sec) => {
        let regs = (sec.registrations || []).map((r) => ({
          ...r,
          sectorName: sec.sectorName,
        }));

        if (attendanceMode && showAttendedOnly) {
          regs = regs.filter((r) => r.attendance);
        }

        if (q) {
          regs = regs.filter(
            (r) =>
              r.name?.toLowerCase().includes(q) ||
              r.mobile?.includes(q) ||
              r.ticket?.toLowerCase().includes(q) ||
              r.designation?.toLowerCase().includes(q) ||
              sec.sectorName?.toLowerCase().includes(q)
          );
        }

        return {
          ...sec,
          filteredRegistrations: regs,
        };
      })
      .filter((sec) => {
        if (!q) return true;
        return (
          sec.filteredRegistrations.length > 0 ||
          sec.sectorName?.toLowerCase().includes(q)
        );
      });
  }, [data, selectedSector, showAttendedOnly, searchQuery, attendanceMode]);

  // Total count of currently visible delegates
  const totalVisibleCount = useMemo(() => {
    return sectorsToDisplay.reduce(
      (sum, s) => sum + s.filteredRegistrations.length,
      0
    );
  }, [sectorsToDisplay]);

  // Robust CSV Download Utility using UTF-8 Blob
  const triggerCsvDownload = (filename: string, headers: string[], rows: string[][]) => {
    try {
      const csvRows = [headers.join(",")];
      rows.forEach((row) => {
        const escapedRow = row.map((cell) => {
          const str = cell == null ? "" : String(cell);
          if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return `"${str}"`;
        });
        csvRows.push(escapedRow.join(","));
      });

      const csvString = csvRows.join("\r\n");
      const blob = new Blob(["\uFEFF" + csvString], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 500);
    } catch (err) {
      console.error("CSV Download Error:", err);
      alert("Could not generate CSV file. Please try again.");
    }
  };

  // Export Current Filtered / Active View CSV
  const downloadCurrentViewCSV = () => {
    if (totalVisibleCount === 0) {
      alert("No delegate records to export.");
      return;
    }

    const headers = ["#", "Division", "Sector", "Name", "Mobile", "Designation", "Ticket"];
    if (attendanceMode) headers.push("Attendance");

    let counter = 1;
    const rows: string[][] = [];

    sectorsToDisplay.forEach((sec) => {
      sec.filteredRegistrations.forEach((d) => {
        const row = [
          String(counter++),
          divisionName || "",
          sec.sectorName || "",
          d.name || "",
          d.mobile || "",
          d.designation || "Delegate",
          d.ticket || "",
        ];
        if (attendanceMode) {
          row.push(d.attendance ? "Present" : "Absent");
        }
        rows.push(row);
      });
    });

    const cleanDiv = (divisionName || "Division").replace(/[^a-zA-Z0-9_-]/g, "_");
    const cleanSec = (selectedSector === "all" ? "All_Sectors" : selectedSector).replace(/[^a-zA-Z0-9_-]/g, "_");
    triggerCsvDownload(`GC26_${cleanDiv}_${cleanSec}_Delegates.csv`, headers, rows);
  };

  // Export Single Sector CSV
  const downloadSingleSectorCSV = (sectorName: string, registrations: Registration[]) => {
    const regs = attendanceMode && showAttendedOnly
      ? registrations.filter((r) => r.attendance)
      : registrations;

    if (!regs || regs.length === 0) {
      alert("No delegate records in this sector to export.");
      return;
    }

    const headers = ["#", "Division", "Sector", "Name", "Mobile", "Designation", "Ticket"];
    if (attendanceMode) headers.push("Attendance");

    const rows: string[][] = regs.map((r, i) => {
      const row = [
        String(i + 1),
        divisionName || "",
        sectorName || "",
        r.name || "",
        r.mobile || "",
        r.designation || "Delegate",
        r.ticket || "",
      ];
      if (attendanceMode) {
        row.push(r.attendance ? "Present" : "Absent");
      }
      return row;
    });

    const cleanDiv = (divisionName || "Division").replace(/[^a-zA-Z0-9_-]/g, "_");
    const cleanSec = (sectorName || "Sector").replace(/[^a-zA-Z0-9_-]/g, "_");
    triggerCsvDownload(`GC26_${cleanDiv}_${cleanSec}_Delegates.csv`, headers, rows);
  };

  // WhatsApp Single Delegate Share
  const shareSingleToWhatsApp = (user: Registration, sectorName: string) => {
    let text = `*Grand Conclave 26 — SSF Kozhikode South*\n\n📌 *Delegate Details*\n👤 *Name:* ${user.name}\n📱 *Mobile:* ${user.mobile}\n🏷️ *Designation:* ${user.designation || "N/A"}\n🎫 *Ticket:* ${user.ticket || "N/A"}\n📍 *Division / Sector:* ${divisionName} / ${sectorName}`;
    if (attendanceMode) {
      text += `\n✅ *Attendance:* ${user.attendance ? "Present" : "Not Marked"}`;
    }
    text += `\n\nThank you!`;

    const cleanMobile = user.mobile ? user.mobile.replace(/\D/g, "") : "";
    const phoneParam = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const url = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // WhatsApp Sector Summary Share (descending order)
  const shareSectorSummaryToWhatsApp = () => {
    if (!data || data.sectors.length === 0) return;

    const sortedSectors = [...data.sectors].sort((a, b) => {
      const countA = a.registrations.length;
      const countB = b.registrations.length;
      if (countA !== countB) return countB - countA;
      return a.sectorName.localeCompare(b.sectorName);
    });

    const listItems = sortedSectors
      .map((sec, i) => {
        let line = `${i + 1}. *${sec.sectorName}* Sector: ${sec.registrations.length}`;
        if (attendanceMode) {
          const att = sec.registrations.filter((r) => r.attendance).length;
          line += ` (Attended: ${att})`;
        }
        return line;
      })
      .join("\n");

    let text = `*GRAND CONCLAVE ’26 🌟*\n> 10th Sep Thursday 5:30pm @Markaz\n\n📌 *Sector-wise Delegates Summary — ${data.divisionName} Division*\n\n${listItems}\n\n📊 *Total Sector Delegates:* ${data.totalStudents}`;
    if (attendanceMode) {
      const totalAtt = data.sectors.reduce(
        (sum, sec) => sum + sec.registrations.filter((r) => r.attendance).length,
        0
      );
      text += `\n✅ *Total Attended:* ${totalAtt}`;
    }
    text += `\n\n©️ *SSF Kozhikode South*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // WhatsApp Sector List Share
  const shareSectorListToWhatsApp = (sectorName: string, registrations: Registration[]) => {
    const regs = attendanceMode && showAttendedOnly
      ? registrations.filter((r) => r.attendance)
      : registrations;

    if (regs.length === 0) return;

    const listItems = regs
      .map((r, i) => {
        let line = `${i + 1}. *${r.name}* (${r.designation || "Delegate"})\n   📱 ${r.mobile} | 🎫 ${r.ticket || "N/A"}`;
        if (attendanceMode) {
          line += ` | ${r.attendance ? "✅ Present" : "❌ Not Marked"}`;
        }
        return line;
      })
      .join("\n\n");

    let text = `*Grand Conclave 26 — ${divisionName} / ${sectorName} Sector Delegates*\n📊 *Total Delegates:* ${regs.length}`;
    if (attendanceMode) {
      const att = regs.filter((r) => r.attendance).length;
      text += `\n✅ *Total Attended:* ${att}`;
    }
    text += `\n\n${listItems}\n\n*SSF Kozhikode South*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // WhatsApp Active View Share (All or Selected Sector)
  const shareActiveViewToWhatsApp = () => {
    if (totalVisibleCount === 0) return;

    if (selectedSector !== "all") {
      const targetSec = sectorsToDisplay[0];
      if (targetSec) {
        shareSectorListToWhatsApp(targetSec.sectorName, targetSec.filteredRegistrations);
      }
      return;
    }

    // When All Sectors is active, format grouped by sector
    const textBlocks = sectorsToDisplay
      .filter((sec) => sec.filteredRegistrations.length > 0)
      .map((sec) => {
        const delegatesList = sec.filteredRegistrations
          .map((r, i) => {
            let line = `   ${i + 1}. *${r.name}* (${r.designation || "Delegate"})\n      📱 ${r.mobile} | 🎫 ${r.ticket || "N/A"}`;
            if (attendanceMode) {
              line += ` | ${r.attendance ? "✅ Present" : "❌ Not Marked"}`;
            }
            return line;
          })
          .join("\n");

        return `📍 *${sec.sectorName} Sector* (Reg: ${sec.filteredRegistrations.length})\n${delegatesList}`;
      });

    let text = `*Grand Conclave 26 — ${divisionName} Division Sector Data*\n📊 *Total Delegates:* ${totalVisibleCount}`;
    if (attendanceMode) {
      const totalAtt = sectorsToDisplay.reduce(
        (sum, sec) => sum + sec.filteredRegistrations.filter((r) => r.attendance).length,
        0
      );
      text += `\n✅ *Total Attended:* ${totalAtt}`;
    }
    text += `\n\n${textBlocks.join("\n\n")}\n\n*SSF Kozhikode South*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-purple-600 font-bold animate-pulse text-base">
          Loading sector delegates for {divisionName}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 text-red-700 font-semibold">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 font-semibold">No sector data found.</p>
      </div>
    );
  }

  const totalAttended = data.sectors.reduce(
    (sum, sec) => sum + sec.registrations.filter((r) => r.attendance).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Metric Cards Bar */}
      <div className={`grid ${attendanceMode ? "grid-cols-3" : "grid-cols-2"} gap-3 sm:gap-6`}>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Sector Delegates</p>
            <p className="text-2xl sm:text-3xl font-black text-purple-700">{data.totalStudents}</p>
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
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              {selectedSector === "all" ? "Visible Delegates" : `${selectedSector} Count`}
            </p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-700">{totalVisibleCount}</p>
          </div>
        </div>
      </div>

      {/* Sector Tabs Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-purple-600" />
            Sector Tabs:
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {data.sectors.length} sectors in {divisionName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* All Sectors Tab */}
          <button
            type="button"
            onClick={() => setSelectedSector("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedSector === "all"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 scale-105"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>All Sectors</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedSector === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-800"
              }`}
            >
              {data.totalStudents}
            </span>
          </button>

          {/* Individual Sector Tabs */}
          {data.sectors.map((sec) => {
            const count = sec.registrations?.length ?? 0;
            const isActive = selectedSector.toLowerCase() === sec.sectorName.toLowerCase();

            return (
              <button
                key={sec.sectorName}
                type="button"
                onClick={() => setSelectedSector(sec.sectorName)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{sec.sectorName}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${selectedSector === "all" ? "across all sectors" : selectedSector}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          <button
            onClick={shareSectorSummaryToWhatsApp}
            disabled={data.sectors.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Summary</span>
          </button>

          <button
            onClick={shareActiveViewToWhatsApp}
            disabled={totalVisibleCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{selectedSector === "all" ? "Share All Sectors" : `Share ${selectedSector}`}</span>
          </button>

          <button
            onClick={downloadCurrentViewCSV}
            disabled={totalVisibleCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

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
              <span>{showAttendedOnly ? "Attended Only" : "All Status"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sector-Based Delegates List View */}
      {sectorsToDisplay.length === 0 || totalVisibleCount === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <p className="text-slate-700 font-extrabold text-lg">No sector delegates found</p>
          <p className="text-slate-500 text-xs sm:text-sm">
            Try switching sector tabs or adjusting your search filter.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sectorsToDisplay.map((sec, secIdx) => {
            const rawRegs = sec.registrations || [];
            const visibleRegs = sec.filteredRegistrations || [];
            const attendedCount = rawRegs.filter((r) => r.attendance).length;

            if (visibleRegs.length === 0 && searchQuery.trim()) return null;

            return (
              <div
                key={sec.sectorName}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Sector Section Header */}
                <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                      {sec.sectorName} Sector
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800">
                      {rawRegs.length} delegates
                    </span>
                    {attendanceMode && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                        Att: {attendedCount}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => shareSectorListToWhatsApp(sec.sectorName, rawRegs)}
                      disabled={rawRegs.length === 0}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadSingleSectorCSV(sec.sectorName, rawRegs)}
                      disabled={rawRegs.length === 0}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>

                {/* Delegates List for this Sector */}
                <div className="p-4 sm:p-6">
                  {visibleRegs.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      No delegates match the search query in this sector.
                    </p>
                  ) : (
                    <>
                      {/* Mobile Card View */}
                      <div className="space-y-2.5 md:hidden">
                        {visibleRegs.map((d, i) => (
                          <div
                            key={`${d.name}-${d.mobile}-${i}`}
                            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2 hover:border-purple-300 transition shadow-sm text-xs"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-xs font-bold text-slate-400 mr-1.5">#{i + 1}</span>
                                <span className="text-sm font-black text-slate-900">{d.name}</span>
                              </div>
                              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                                {d.ticket || "—"}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600">
                              <span className="font-semibold">{d.designation || "Delegate"}</span>
                              <span className="font-mono">📱 {d.mobile}</span>
                            </div>

                            <div className="border-t border-slate-200/60 pt-2 flex justify-between items-center">
                              {attendanceMode ? (
                                <span
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                    d.attendance
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-slate-200 text-slate-600"
                                  }`}
                                >
                                  {d.attendance ? "✅ Present" : "❌ Absent"}
                                </span>
                              ) : <span />}

                              <button
                                onClick={() => shareSingleToWhatsApp(d, sec.sectorName)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition active:scale-95 cursor-pointer"
                              >
                                <Share2 className="w-3 h-3" />
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
                              <th className="pb-3">Name</th>
                              <th className="pb-3">Mobile</th>
                              <th className="pb-3">Designation</th>
                              <th className="pb-3">Ticket</th>
                              {attendanceMode && (
                                <th className="pb-3 text-center">Attendance</th>
                              )}
                              <th className="pb-3 text-center">Share</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100 font-medium">
                            {visibleRegs.map((d, i) => (
                              <tr
                                key={`${d.name}-${d.mobile}-${i}`}
                                className="hover:bg-purple-50/50 transition"
                              >
                                <td className="py-3 text-center text-slate-400 font-mono text-xs">
                                  {i + 1}
                                </td>
                                <td className="py-3 font-bold text-slate-900">
                                  {d.name}
                                </td>
                                <td className="py-3 text-slate-700 font-mono text-xs">
                                  {d.mobile}
                                </td>
                                <td className="py-3 text-xs text-slate-600 font-semibold">
                                  {d.designation || "Delegate"}
                                </td>
                                <td className="py-3 font-mono font-bold text-purple-700 text-xs">
                                  {d.ticket || "—"}
                                </td>
                                {attendanceMode && (
                                  <td className="py-3 text-center">
                                    {d.attendance ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Present
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 text-xs font-medium">—</span>
                                    )}
                                  </td>
                                )}
                                <td className="py-3 text-center">
                                  <button
                                    onClick={() => shareSingleToWhatsApp(d, sec.sectorName)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
