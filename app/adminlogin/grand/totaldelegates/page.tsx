"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Users, CheckCircle2, Share2 } from "lucide-react";
import { useAttendanceMode } from "@/app/utils/useAttendanceMode";

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

export default function DivisionRegistrationTable() {
  const [data, setData] = useState<DivisionRow[]>([]);
  const [sortKey, setSortKey] = useState<
    "divisionRegistered" | "sectorRegistered" | "totalRegistered"
  >("totalRegistered");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAttendedOnly, setShowAttendedOnly] = useState(false);

  const { attendanceMode, toggleAttendanceMode } = useAttendanceMode();
  const isAttendanceActive = attendanceMode || showAttendedOnly;

  useEffect(() => {
    fetch("/api/admin/grand/totaldeligates", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => setData(res.divisions || []))
      .catch(console.error);
  }, []);

  const sortBy = (key: typeof sortKey) => {
    const sorted = [...data].sort((a, b) =>
      sortOrder === "asc" ? a[key] - b[key] : b[key] - a[key]
    );
    setData(sorted);
    setSortKey(key);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleToggleAttendedOnly = () => {
    const nextState = !showAttendedOnly;
    setShowAttendedOnly(nextState);
    if (nextState && !attendanceMode) {
      toggleAttendanceMode();
    }
  };

  const displayedData = showAttendedOnly
    ? data.filter((row) => row.totalAttended > 0)
    : data;

  const grandTotalRegistered = data.reduce(
    (sum, row) => sum + row.totalRegistered,
    0
  );

  const grandTotalAttended = data.reduce(
    (sum, row) => sum + row.totalAttended,
    0
  );

  const shareSummaryToWhatsApp = () => {
    if (displayedData.length === 0) return;

    let text = "";
    if (showAttendedOnly) {
      const listItems = displayedData
        .map((row, i) => {
          return `${i + 1}. *${row.divisionName}*\n   Attended: ${row.totalAttended} (Div: ${row.divisionAttended}, Sector: ${row.sectorAttended})`;
        })
        .join("\n\n");

      text = `*Grand Conclave — Attended Delegates Summary*\n\n✅ *Total Attended:* ${grandTotalAttended} Delegates\n📍 *Attended Divisions:* ${displayedData.length}\n\n*Attended Divisions Breakdown:*\n${listItems}\n\n*SSF Kozhikode South*`;
    } else {
      const listItems = displayedData
        .map((row, i) => {
          let line = `${i + 1}. *${row.divisionName}*\n   Registered: ${row.totalRegistered} (Div: ${row.divisionRegistered}, Sector: ${row.sectorRegistered})`;
          if (isAttendanceActive) {
            line += `\n   Attended: ${row.totalAttended} (Div: ${row.divisionAttended}, Sector: ${row.sectorAttended})`;
          }
          return line;
        })
        .join("\n\n");

      text = `*Grand Conclave — Division Registration Summary*\n\n📊 *Total Registered:* ${grandTotalRegistered}`;
      if (isAttendanceActive) {
        text += `\n✅ *Total Attended:* ${grandTotalAttended}`;
      }
      text += `\n\n*Division Breakdown:*\n${listItems}\n\n*SSF Kozhikode South*`;
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const tableColumns = showAttendedOnly
    ? [
        { key: "divisionAttended", label: "Division Att" },
        { key: "sectorAttended", label: "Sector Att" },
        { key: "totalAttended", label: "Total Att" },
      ]
    : [
        { key: "divisionRegistered", label: "Division Reg" },
        { key: "sectorRegistered", label: "Sector Reg" },
        { key: "totalRegistered", label: "Total Reg" },
        ...(isAttendanceActive
          ? [
              { key: "divisionAttended", label: "Division Att" },
              { key: "sectorAttended", label: "Sector Att" },
              { key: "totalAttended", label: "Total Att" },
            ]
          : []),
      ];

  return (
    <section className="p-2 sm:p-6 space-y-6">
      {/* Metric Cards */}
      <div
        className={`grid ${
          showAttendedOnly
            ? "grid-cols-1"
            : isAttendanceActive
            ? "grid-cols-2"
            : "grid-cols-1"
        } gap-3 sm:gap-6`}
      >
        {!showAttendedOnly && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Total Registered
              </p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700">
                {grandTotalRegistered}
              </p>
            </div>
          </div>
        )}

        {isAttendanceActive && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-teal-100 text-teal-700 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Total Attended {showAttendedOnly && `(${displayedData.length} Divisions)`}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-teal-700">
                {grandTotalAttended}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Container */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
            {showAttendedOnly
              ? "Attended Divisions Only — Grand Conclave"
              : "Grand Conclave — Division Summary"}
          </h3>

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={handleToggleAttendedOnly}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition active:scale-95 cursor-pointer shadow-sm ${
                showAttendedOnly
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${showAttendedOnly ? "text-white" : "text-emerald-600"}`} />
              <span>{showAttendedOnly ? "Showing Attended Only" : "Show Attended Only"}</span>
            </button>

            <button
              onClick={shareSummaryToWhatsApp}
              disabled={displayedData.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto justify-center"
            >
              <Share2 className="w-4 h-4" />
              <span>{showAttendedOnly ? "Share Attended List" : "Share Table List to WhatsApp"}</span>
            </button>
          </div>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="space-y-3 md:hidden">
          {displayedData.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-semibold text-sm">
              {showAttendedOnly
                ? "No attended delegates found yet."
                : "No delegate records found."}
            </div>
          ) : (
            displayedData.map((row) => (
              <div
                key={row._id}
                className={`p-4 rounded-xl border bg-slate-50/50 space-y-2 ${
                  showAttendedOnly ? "border-emerald-300" : "border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span className="text-base">{row.divisionName}</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      showAttendedOnly
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {showAttendedOnly ? `Attended: ${row.totalAttended}` : `Total: ${row.totalRegistered}`}
                  </span>
                </div>
                {!showAttendedOnly && (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-500 block">Division Reg</span>
                      <span className="font-bold text-slate-800">{row.divisionRegistered}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sector Reg</span>
                      <span className="font-bold text-emerald-600">{row.sectorRegistered}</span>
                    </div>
                  </div>
                )}
                {isAttendanceActive && (
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 pt-2">
                    <div>
                      <span className="text-slate-500 block">Division Att</span>
                      <span className="font-bold text-teal-700">{row.divisionAttended}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sector Att</span>
                      <span className="font-bold text-teal-700">{row.sectorAttended}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop Responsive Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200 font-semibold">
                <th className="pb-3">Division</th>

                {tableColumns.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => sortBy(key as any)}
                    className="pb-3 cursor-pointer text-right select-none"
                  >
                    <div className="flex items-center justify-end">
                      {label}
                      <ArrowUpDown className="w-4 h-4 ml-1 text-slate-400" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {displayedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={showAttendedOnly ? 4 : isAttendanceActive ? 7 : 4}
                    className="py-8 text-center text-slate-400 font-semibold"
                  >
                    {showAttendedOnly
                      ? "No attended delegates found yet."
                      : "No delegate records found."}
                  </td>
                </tr>
              ) : (
                displayedData.map((row, i) => (
                  <motion.tr
                    key={row._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-emerald-50/50 transition"
                  >
                    <td className="py-3.5 font-bold text-slate-900">{row.divisionName}</td>
                    {!showAttendedOnly && (
                      <>
                        <td className="py-3.5 text-right font-semibold">{row.divisionRegistered}</td>
                        <td className="py-3.5 text-right font-semibold text-emerald-600">
                          {row.sectorRegistered}
                        </td>
                        <td className="py-3.5 text-right font-bold text-emerald-700">
                          {row.totalRegistered}
                        </td>
                      </>
                    )}
                    {isAttendanceActive && (
                      <>
                        <td className="py-3.5 text-right text-slate-600">{row.divisionAttended}</td>
                        <td className="py-3.5 text-right text-emerald-600">{row.sectorAttended}</td>
                        <td className="py-3.5 text-right text-teal-600 font-bold">
                          {row.totalAttended}
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
