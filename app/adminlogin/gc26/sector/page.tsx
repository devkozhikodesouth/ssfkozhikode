"use client";

import { useEffect, useState } from "react";
import { Building2, Layers } from "lucide-react";
import GrandConclave26SectorList from "@/app/components/GrandConclave26SectorList";

export default function GC26AdminSectorPage() {
  const [divisions, setDivisions] = useState<string[]>([]);
  const [divisionName, setDivisionName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

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
          if (names.length > 0) setDivisionName(names[0]);
        }
      } catch (err) {
        console.error("Error fetching divisions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDivisions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header Card with Division Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-indigo-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-purple-600" />
            Sector Wise Delegates
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Grand Conclave 26 — Sector Level Registrations & Attendance
          </p>
        </div>

        {/* Division Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-purple-600 pointer-events-none" />
            <select
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white shadow-sm transition cursor-pointer"
            >
              {loading ? (
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
      </div>

      {/* Main Sector Content */}
      {divisionName ? (
        <GrandConclave26SectorList divisionName={divisionName} />
      ) : (
        !loading && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-semibold">
              Please select a division from above to view its sector delegates.
            </p>
          </div>
        )
      )}
    </div>
  );
}
