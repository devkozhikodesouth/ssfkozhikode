"use client";

import { useEffect, useState } from "react";

interface Sector {
  sectorName: string;
  studentCount: number;
}

interface DivisionData {
  divisionName: string;
  totalStudents: number;
  sectors: Sector[];
}

interface ApiError {
  error: string;
}

export default function DivisionTable({
  divisionName,
}: {
  divisionName: string;
}) {
  const [data, setData] = useState<DivisionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!divisionName) {
      setLoading(false);
      return;
    }
    console.log(divisionName);
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

        const result = await res.json();

        if (!res.ok) {
          const apiError = result as ApiError;
          setError(apiError.error || `HTTP error! status: ${res.status}`);
          setData(null);
          return;
        }

        setData(result as DivisionData);
        setError(null);
      } catch (error) {
        console.error("Error fetching division data:", error);
        setError("Failed to fetch division data. Please try again later.");
        setData(null);
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

  // ❌ Error State
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // ❌ No Data
  if (!data) {
    const name = String(divisionName ?? "").trim();
    return (
      <p className="text-center py-10 text-red-500">
        {name
          ? `No data found for "${name}"`
          : "Please provide a valid division name in the URL."}
      </p>
    );
  }

  // ✅ Render Table
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-10 border border-gray-200">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-blue-700">Students Gala</h1>
        <p className="text-gray-600 text-bold text-xl mb-2">
          Sector Wise Registration Status
        </p>

        <h2 className="text-4xl font-extrabold text-gray-800 mt-4">
          {data.divisionName}
        </h2>

        <p className="text-gray-700 mt-3 text-lg">
          Total Students:{" "}
          <span className="font-bold text-blue-600">{data.totalStudents}</span>
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
                <td className="px-4 py-3 text-gray-800">{sector.sectorName}</td>
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
