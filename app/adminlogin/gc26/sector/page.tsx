"use client";

import { useEffect, useState } from "react";
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
    <main className="space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Grand Conclave 26 Delegates — Sector Wise Data
        </h1>

        <div className="flex justify-center mb-8">
          {loading ? (
            <p className="text-gray-600 animate-pulse">Loading divisions...</p>
          ) : (
            <select
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a Division</option>
              {divisions.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          )}
        </div>

        {divisionName ? (
          <GrandConclave26SectorList divisionName={divisionName} />
        ) : (
          !loading && (
            <p className="text-center text-gray-600">
              Please select a division to view its data.
            </p>
          )
        )}
      </div>
    </main>
  );
}
