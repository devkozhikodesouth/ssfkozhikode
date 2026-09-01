"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  Users,
  CheckCircle2,
  Share2,
  ArrowUp,
  ArrowDown,
  Building2,
  Layers,
} from "lucide-react";
import { useAttendanceMode } from "@/app/utils/useAttendanceMode";
import GC26SectorRankingList from "@/app/components/GC26SectorRankingList";

type DivisionRow = {
  _id: string;
  divisionName: string;

  divisionRegistered: number;
  sectorRegistered: number;
  totalRegistered: number;

  divisionAttended: number;
  sectorAttended: number;
  totalAttended: number;
};

type SortKey =
  | "divisionName"
  | "divisionRegistered"
  | "sectorRegistered"
  | "totalRegistered"
  | "divisionAttended"
  | "sectorAttended"
  | "totalAttended";

export default function GC26DivisionRegistrationTable() {
  const [activeTab, setActiveTab] = useState<"division" | "sector">("division");
  const [data, setData] = useState<DivisionRow[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("totalRegistered");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { attendanceMode } = useAttendanceMode();

  useEffect(() => {
    fetch("/api/admin/gc26/totaldeligates", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        const rows: DivisionRow[] = res.divisions || [];
        const sorted = [...rows].sort((a, b) => b.totalRegistered - a.totalRegistered);
        setData(sorted);
      })
      .catch(console.error);
  }, []);

  const sortBy = (key: SortKey) => {
    let nextOrder: "asc" | "desc" = "desc";
    if (sortKey === key) {
      nextOrder = sortOrder === "asc" ? "desc" : "asc";
    } else {
      nextOrder = key === "divisionName" ? "asc" : "desc";
    }

    const sorted = [...data].sort((a, b) => {
      if (key === "divisionName") {
        return nextOrder === "asc"
          ? a.divisionName.localeCompare(b.divisionName)
          : b.divisionName.localeCompare(a.divisionName);
      }
      return nextOrder === "asc" ? a[key] - b[key] : b[key] - a[key];
    });

    setData(sorted);
    setSortKey(key);
    setSortOrder(nextOrder);
  };

  const toggleSortOrder = () => {
    const nextOrder = sortOrder === "asc" ? "desc" : "asc";
    const sorted = [...data].sort((a, b) => {
      if (sortKey === "divisionName") {
        return nextOrder === "asc"
          ? a.divisionName.localeCompare(b.divisionName)
          : b.divisionName.localeCompare(a.divisionName);
      }
      return nextOrder === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
    });
    setData(sorted);
    setSortOrder(nextOrder);
  };

  const grandTotalRegistered = data.reduce(
    (sum, row) => sum + row.totalRegistered,
    0
  );

  const grandTotalAttended = data.reduce(
    (sum, row) => sum + row.totalAttended,
    0
  );

  const shareSummaryToWhatsApp = () => {
    if (data.length === 0) return;

    const listItems = data
      .map((row, i) => {
        let line = `${i + 1}. *${row.divisionName}*\n   Registered: ${row.totalRegistered} (Div: ${row.divisionRegistered}, Sector: ${row.sectorRegistered})`;
        if (attendanceMode) {
          line += `\n   Attended: ${row.totalAttended} (Div: ${row.divisionAttended}, Sector: ${row.sectorAttended})`;
        }
        return line;
      })
      .join("\n\n");

    let text = `*Grand Conclave 26 — Division Registration Summary*\n\n📊 *Total Registered:* ${grandTotalRegistered}`;
    if (attendanceMode) {
      text += `\n✅ *Total Attended:* ${grandTotalAttended}`;
    }
    text += `\n\n*Division Breakdown:*\n${listItems}\n\n*SSF Kozhikode South*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "totalRegistered", label: "Total Reg" },
    { key: "divisionRegistered", label: "Div Reg" },
    { key: "sectorRegistered", label: "Sector Reg" },
    { key: "divisionName", label: "Division (A-Z)" },
    ...(attendanceMode
      ? [
          { key: "totalAttended" as SortKey, label: "Total Att" },
          { key: "divisionAttended" as SortKey, label: "Div Att" },
          { key: "sectorAttended" as SortKey, label: "Sector Att" },
        ]
      : []),
  ];

  return (
    <section className="p-2 sm:p-6 space-y-6">
      {/* ───────── Top Navigation Tabs ───────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("division")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "division"
                ? "bg-white text-purple-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Division Breakdown</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sector")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "sector"
                ? "bg-white text-purple-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Sector Breakdown (Single List)</span>
          </button>
        </div>
      </div>

      {activeTab === "sector" ? (
        <GC26SectorRankingList />
      ) : (
        <>
          {/* Header Metric Cards */}
          <div className={`grid ${attendanceMode ? "grid-cols-2" : "grid-cols-1"} gap-3 sm:gap-6`}>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Registered</p>
                <p className="text-2xl sm:text-3xl font-black text-purple-700">{grandTotalRegistered}</p>
              </div>
            </div>

            {attendanceMode && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Attended</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-700">{grandTotalAttended}</p>
                </div>
              </div>
            )}
          </div>

          {/* Division Breakdown Container */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
                Division Breakdown — Grand Conclave 26
              </h3>

              <button
                onClick={shareSummaryToWhatsApp}
                disabled={data.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto justify-center"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Table List to WhatsApp</span>
              </button>
            </div>

            {/* Mobile & Desktop Sort Controls Bar */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-purple-600" />
                  Sort by:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => sortBy(opt.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        sortKey === opt.key
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                      {sortKey === opt.key && (
                        <span className="ml-1">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={toggleSortOrder}
                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Toggle sort direction"
              >
                {sortOrder === "asc" ? (
                  <>
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ascending (Low to High)</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                    <span>Descending (High to Low)</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="space-y-3 md:hidden">
              {data.map((row) => (
                <div
                  key={row._id}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2 hover:border-purple-300 transition"
                >
                  <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <span className="text-base font-extrabold">{row.divisionName}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-black ${
                      sortKey === "totalRegistered"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      Total: {row.totalRegistered}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div
                      onClick={() => sortBy("divisionRegistered")}
                      className={`p-2 rounded-lg cursor-pointer transition ${
                        sortKey === "divisionRegistered"
                          ? "bg-purple-50 border border-purple-200"
                          : "bg-slate-50"
                      }`}
                    >
                      <span className="text-slate-500 block">Division Reg</span>
                      <span className="font-bold text-slate-800 text-sm">{row.divisionRegistered}</span>
                    </div>
                    <div
                      onClick={() => sortBy("sectorRegistered")}
                      className={`p-2 rounded-lg cursor-pointer transition ${
                        sortKey === "sectorRegistered"
                          ? "bg-purple-50 border border-purple-200"
                          : "bg-slate-50"
                      }`}
                    >
                      <span className="text-slate-500 block">Sector Reg</span>
                      <span className="font-bold text-purple-600 text-sm">{row.sectorRegistered}</span>
                    </div>
                  </div>

                  {attendanceMode && (
                    <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-100 pt-2">
                      <div
                        onClick={() => sortBy("divisionAttended")}
                        className={`p-2 rounded-lg cursor-pointer transition ${
                          sortKey === "divisionAttended"
                            ? "bg-emerald-50 border border-emerald-200"
                            : "bg-slate-50"
                        }`}
                      >
                        <span className="text-slate-500 block text-[10px]">Div Att</span>
                        <span className="font-bold text-emerald-700">{row.divisionAttended}</span>
                      </div>
                      <div
                        onClick={() => sortBy("sectorAttended")}
                        className={`p-2 rounded-lg cursor-pointer transition ${
                          sortKey === "sectorAttended"
                            ? "bg-emerald-50 border border-emerald-200"
                            : "bg-slate-50"
                        }`}
                      >
                        <span className="text-slate-500 block text-[10px]">Sector Att</span>
                        <span className="font-bold text-emerald-700">{row.sectorAttended}</span>
                      </div>
                      <div
                        onClick={() => sortBy("totalAttended")}
                        className={`p-2 rounded-lg cursor-pointer transition ${
                          sortKey === "totalAttended"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        <span className="block text-[10px] opacity-80">Total Att</span>
                        <span className="font-black text-sm">{row.totalAttended}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Responsive Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200 font-semibold">
                    <th
                      onClick={() => sortBy("divisionName")}
                      className="pb-3 cursor-pointer select-none hover:text-slate-900 transition"
                    >
                      <div className="flex items-center">
                        Division
                        <ArrowUpDown className={`w-4 h-4 ml-1 ${sortKey === "divisionName" ? "text-purple-600" : "text-slate-400"}`} />
                      </div>
                    </th>

                    {[
                      { key: "divisionRegistered" as SortKey, label: "Division Reg" },
                      { key: "sectorRegistered" as SortKey, label: "Sector Reg" },
                      { key: "totalRegistered" as SortKey, label: "Total Reg" },
                      ...(attendanceMode
                        ? [
                            { key: "divisionAttended" as SortKey, label: "Division Att" },
                            { key: "sectorAttended" as SortKey, label: "Sector Att" },
                            { key: "totalAttended" as SortKey, label: "Total Att" },
                          ]
                        : []),
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => sortBy(key)}
                        className="pb-3 cursor-pointer text-right select-none hover:text-slate-900 transition"
                      >
                        <div className="flex items-center justify-end">
                          {label}
                          <ArrowUpDown className={`w-4 h-4 ml-1 ${sortKey === key ? "text-purple-600" : "text-slate-400"}`} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.map((row, i) => (
                    <motion.tr
                      key={row._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-purple-50/50 transition"
                    >
                      <td className="py-3.5 font-bold text-slate-900">{row.divisionName}</td>
                      <td className="py-3.5 text-right font-semibold">{row.divisionRegistered}</td>
                      <td className="py-3.5 text-right font-semibold text-purple-600">
                        {row.sectorRegistered}
                      </td>
                      <td className="py-3.5 text-right font-bold text-emerald-600">
                        {row.totalRegistered}
                      </td>
                      {attendanceMode && (
                        <>
                          <td className="py-3.5 text-right text-slate-600">{row.divisionAttended}</td>
                          <td className="py-3.5 text-right text-purple-600">{row.sectorAttended}</td>
                          <td className="py-3.5 text-right text-indigo-600 font-bold">
                            {row.totalAttended}
                          </td>
                        </>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
