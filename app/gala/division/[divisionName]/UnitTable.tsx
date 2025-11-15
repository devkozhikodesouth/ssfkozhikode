"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
} from "lucide-react";

interface UnitData {
  unitName: string;
  studentCount: number;
}

export default function UnitTable({ divisionName }: { divisionName: string }) {
  const [divisions, setDivisions] = useState<string[]>([]);
  const [units, setUnits] = useState<UnitData[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [loadingDivisions, setLoadingDivisions] = useState<boolean>(true);
  const [loadingUnits, setLoadingUnits] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 🟢 Fetch Divisions
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const res = await fetch("/api/register");
        const data = await res.json();
        if (res.ok && data?.success && Array.isArray(data.data)) {
          const names = data.data.map((d: any) => d.divisionName).filter(Boolean);
          setDivisions(names);
        }
      } catch (err) {
        console.error("Error fetching divisions:", err);
      } finally {
        setLoadingDivisions(false);
      }
    };
    fetchDivisions();
  }, []);

  // 🟣 Fetch Units
  useEffect(() => {
    if (!divisionName) return;

    const fetchUnits = async () => {
      console.log("UnitTable: fetching units for division:", divisionName);
      setLoadingUnits(true);
      try {
        const res = await fetch(
          `/api/admin/unitdata/${encodeURIComponent(divisionName)}`
        );
        console.log("UnitTable: fetch response status", res.status);
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Invalid response format (non-JSON):", text);
          setUnits([]);
          setTotalStudents(0);
          return;
        }

        const data = await res.json();
        console.log("UnitTable: response JSON", data);
        if (!res.ok) {
          console.error("API returned error status:", res.status, data);
          setUnits([]);
          setTotalStudents(0);
        } else if (Array.isArray(data?.units)) {
          setUnits(data.units);
          setTotalStudents(data.totalStudents || 0);
        } else if (Array.isArray(data?.data)) {
          setUnits(
            data.data.map((u: any) => ({
              unitName: u.unitName || "Unnamed Unit",
              studentCount: u.studentCount || 0,
            }))
          );
          setTotalStudents(data.totalStudents || 0);
        } else {
          console.warn("API returned unexpected shape:", data);
          setUnits([]);
          setTotalStudents(0);
        }
      } catch (err) {
        console.error("Error fetching units:", err);
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchUnits();
  }, [divisionName]);

  // 🧭 Sort Function
  const handleSort = () => {
    const sorted = [...units].sort((a, b) =>
      sortOrder === "asc"
        ? a.studentCount - b.studentCount
        : b.studentCount - a.studentCount
    );
    setUnits(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
          Students Gala — Unit Wise Data
        </h1>

        {/* Data Section */}
        {divisionName && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-8 border border-gray-200 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center sm:text-left">
                {divisionName} —{" "}
                <span className="text-blue-600">Unit Wise Student Count</span>
              </h2>

              {totalStudents > 0 && (
                <div className="text-center sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Total Students
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                    {totalStudents}
                  </p>
                </div>
              )}
            </div>

            {/* Loading */}
            {loadingUnits ? (
              <div className="flex justify-center py-10">
                <div className="flex items-center gap-2 text-gray-600 animate-pulse">
                  <svg
                    className="w-5 h-5 animate-spin text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span>Loading unit data...</span>
                </div>
              </div>
            ) : units.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full border-collapse text-sm sm:text-base">
                  <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        #
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Unit Name
                      </th>
                      <th
                        onClick={handleSort}
                        className="px-3 sm:px-6 py-3 text-right font-semibold text-gray-700 flex items-center justify-end gap-1 cursor-pointer select-none hover:text-blue-600 transition whitespace-nowrap"
                      >
                        Student Count
                        {sortOrder === "asc" ? (
                          <ArrowUpNarrowWide className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ArrowDownWideNarrow className="w-4 h-4 text-blue-600" />
                        )}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {units.map((unit, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50 transition-all duration-200 text-gray-800"
                      >
                        <td className="px-3 sm:px-6 py-3 text-gray-600 text-center sm:text-left">
                          {index + 1}
                        </td>
                        <td className="px-3 sm:px-6 py-3 font-medium">
                          {unit.unitName}
                        </td>
                        <td className="px-3 sm:px-6 py-3 text-right font-semibold text-blue-600">
                          {unit.studentCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p className="text-base sm:text-lg font-medium">
                  No units found for this division.
                </p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Try selecting another division.
                </p>
              </div>
            )}
          </div>
        )}

        {!divisionName && !loadingDivisions && (
          <p className="text-center text-gray-600 text-sm sm:text-base">
            Please select a division to view unit data.
          </p>
        )}
      </div>
    </main>
  );
}
