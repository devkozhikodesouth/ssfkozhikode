"use client";

import { useState, useEffect } from "react";
import { Layers, ListFilter, LayoutGrid, Building2 } from "lucide-react";
import GC26SectorRankingList from "@/app/components/GC26SectorRankingList";
import GrandConclave26SectorList from "@/app/components/GrandConclave26SectorList";

export default function GC26AdminSectorPage() {
  const [viewMode, setViewMode] = useState<"singleList" | "detailed">("singleList");
  const [divisions, setDivisions] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [loadingDivisions, setLoadingDivisions] = useState(true);

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const res = await fetch("/api/register");
        const data = await res.json();

        if (res.ok && data?.success && Array.isArray(data.data)) {
          const names = data.data
            .map((d: any) => d.divisionName)
            .filter(Boolean);
          setDivisions(names);
          if (names.length > 0) setSelectedDivision(names[0]);
        }
      } catch (err) {
        console.error("Error fetching divisions:", err);
      } finally {
        setLoadingDivisions(false);
      }
    };

    fetchDivisions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-purple-600" />
            Sector Wise Delegates
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Grand Conclave 26 — Consolidated Sector Registrations & Counts
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode("singleList")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === "singleList"
                ? "bg-white text-purple-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Single List (All Sectors)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("detailed")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === "detailed"
                ? "bg-white text-purple-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Detailed Tabs</span>
          </button>
        </div>
      </div>

      {/* Main View Render */}
      {viewMode === "singleList" ? (
        <GC26SectorRankingList />
      ) : (
        <div className="space-y-6">
          {/* Division Selector for Detailed View */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Select Division for Detailed View:
            </span>
            <div className="relative w-full sm:w-64">
              <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-purple-600 pointer-events-none" />
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                disabled={loadingDivisions}
                className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white shadow-sm cursor-pointer"
              >
                {loadingDivisions ? (
                  <option value="">Loading divisions...</option>
                ) : (
                  divisions.map((d) => (
                    <option key={d} value={d}>
                      {d} Division
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {selectedDivision ? (
            <GrandConclave26SectorList divisionName={selectedDivision} />
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 font-semibold">Please select a division.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
