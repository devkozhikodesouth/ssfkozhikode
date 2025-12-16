"use client";

import { useEffect, useState } from "react";
import GrandSectorList from "@/app/components/GrandSectorList";

export default function SectorPage() {
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
            .filter(Boolean); // remove empty/null
          setDivisions(names);
        } else {
          console.warn("No valid divisions found:", data);
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
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Grand Conclave Deligates — Division Wise Data
        </h1>

        {/* Division Selector */}
        <div className="flex justify-center mb-8">
          {loading ? (
            <p className="text-gray-600 animate-pulse">Loading divisions...</p>
          ) : (
            <select
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Data Section */}
        {divisionName ? (
          <GrandSectorList divisionName={divisionName} />
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
