"use client";

import { useEffect, useState } from "react";
import DivisionDelegatesTable from "@/app/gc26/division/[divisionName]/DIvisionDeligates";

export default function GC26AdminDivisionPage() {
  const [divisions, setDivisions] = useState<string[]>([]);
  const [divisionName, setDivisionName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const res = await fetch("/api/register");
        const data = await res.json();

        if (res.ok && data?.success && Array.isArray(data.data)) {
          const names = data.data.map((d: any) => d.divisionName).filter(Boolean);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">
            Grand Conclave 26 — Division Delegates
          </h1>
          <p className="text-sm text-gray-500">
            View division-level registered delegates
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading divisions...</p>
        ) : (
          <select
            value={divisionName}
            onChange={(e) => setDivisionName(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 bg-white text-sm font-semibold shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">Select Division</option>
            {divisions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
      </div>

      {divisionName ? (
        <DivisionDelegatesTable divisionName={divisionName} lightMode={true} />
      ) : (
        <p className="text-center py-10 text-gray-500">Please select a division.</p>
      )}
    </div>
  );
}
