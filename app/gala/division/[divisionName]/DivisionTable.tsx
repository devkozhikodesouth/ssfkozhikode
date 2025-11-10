"use client";

import { useEffect, useState } from "react";

export default function DivisionTable({ divisionName }: { divisionName: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!divisionName) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/gala/division/${encodeURIComponent(divisionName)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching division data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [divisionName]);

  // 🌀 Loading State
  if (loading)
    return (
      <p className="text-center py-10 text-gray-500">
        Loading division data...
      </p>
    );

  // ❌ No Data or invalid divisionName
  if (!data) {
    const name = String(divisionName ?? "").trim();
    return (
      <p className="text-center py-10 text-red-500">
        {name
          ? `No data found for "${name}"`
          : "Invalid or missing division name in the URL."}
      </p>
    );
  }

  // ✅ Render Table
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-10 border border-gray-200">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {data.divisionName}
        </h1>
        <p className="text-gray-600 mt-2">
          Total Students:{" "}
          <span className="font-semibold text-blue-600">
            {data.totalStudents}
          </span>
        </p>
      </div>

      {/* Sector Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-700 font-semibold">
                Sector Name
              </th>
              <th className="text-right px-4 py-3 text-gray-700 font-semibold">
                Student Count
              </th>
            </tr>
          </thead>
          <tbody>
            {(data.sectors ?? []).map((sector: any, idx: number) => (
              <tr
                key={sector.sectorName ?? idx}
                className="border-t border-gray-200 hover:bg-blue-50 transition"
              >
                <td className="px-4 py-3 text-gray-800">
                  {sector.sectorName}
                </td>
                <td className="px-4 py-3 text-right font-medium text-blue-600">
                  {sector.studentCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
