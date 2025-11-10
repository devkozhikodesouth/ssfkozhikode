"use client";

import { useEffect, useState } from "react";
import DivisionTable from "@/app/gala/division/[divisionName]/DivisionTable";

export default function SectorPage() {
  const [divisions, setDivisions] = useState<string[]>([]);
  const [divisionName, setDivisionName] = useState<string>("");

  useEffect(() => {
    // Fetch division list
    const fetchDivisions = async () => {
      try {
        const res = await fetch("/api/register");
        const data = await res.json();

        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          const names = data.data.map((d: any) => d.divisionName || String(d));
          setDivisions(names);
        } else {
          console.warn("No divisions found");
          setDivisions([]);
        }
      } catch (err) {
        console.error("Error fetching divisions:", err);
        setDivisions([]);
      }
    };

    fetchDivisions();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Students Gala — Division Wise Data
        </h1>

        {/* Dropdown */}
        <div className="flex justify-center mb-8">
          <select
            value={divisionName}
            onChange={(e) => setDivisionName(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Division</option>
            {divisions.map((division, index) => (
              <option key={index} value={division}>
                {division}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional Render */}
        {divisionName ? (
          <DivisionTable divisionName={divisionName} />
        ) : (
          <p className="text-center text-gray-600">
            Please select a division to view its data.
          </p>
        )}
      </div>
    </main>
  );
}
