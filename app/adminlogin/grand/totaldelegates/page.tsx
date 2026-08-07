"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Users, CheckCircle2 } from "lucide-react";

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

  const grandTotalRegistered = data.reduce(
    (sum, row) => sum + row.totalRegistered,
    0
  );

  const grandTotalAttended = data.reduce(
    (sum, row) => sum + row.totalAttended,
    0
  );

  return (
    <section className="p-2 sm:p-6 space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Registered</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700">{grandTotalRegistered}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-teal-100 text-teal-700 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Attended</p>
            <p className="text-2xl sm:text-3xl font-black text-teal-700">{grandTotalAttended}</p>
          </div>
        </div>
      </div>

      {/* Container */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
            Grand Conclave — Division Summary
          </h3>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="space-y-3 md:hidden">
          {data.map((row) => (
            <div
              key={row._id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
            >
              <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-200 pb-2">
                <span className="text-base">{row.divisionName}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                  Total: {row.totalRegistered}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-500 block">Division Reg / Att</span>
                  <span className="font-bold text-slate-800">
                    {row.divisionRegistered} / {row.divisionAttended}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sector Reg / Att</span>
                  <span className="font-bold text-emerald-600">
                    {row.sectorRegistered} / {row.sectorAttended}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Responsive Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200 font-semibold">
                <th className="pb-3">Division</th>

                {[
                  { key: "divisionRegistered", label: "Division Reg" },
                  { key: "sectorRegistered", label: "Sector Reg" },
                  { key: "totalRegistered", label: "Total Reg" },
                  { key: "divisionAttended", label: "Division Att" },
                  { key: "sectorAttended", label: "Sector Att" },
                  { key: "totalAttended", label: "Total Att" },
                ].map(({ key, label }) => (
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
              {data.map((row, i) => (
                <motion.tr
                  key={row._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-emerald-50/50 transition"
                >
                  <td className="py-3.5 font-bold text-slate-900">{row.divisionName}</td>
                  <td className="py-3.5 text-right font-semibold">{row.divisionRegistered}</td>
                  <td className="py-3.5 text-right font-semibold text-emerald-600">
                    {row.sectorRegistered}
                  </td>
                  <td className="py-3.5 text-right font-bold text-emerald-700">
                    {row.totalRegistered}
                  </td>
                  <td className="py-3.5 text-right text-slate-600">{row.divisionAttended}</td>
                  <td className="py-3.5 text-right text-emerald-600">{row.sectorAttended}</td>
                  <td className="py-3.5 text-right text-teal-600 font-bold">
                    {row.totalAttended}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
