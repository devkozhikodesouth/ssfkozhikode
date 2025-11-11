"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowUpDown,
} from "lucide-react";

interface UnitData {
  unitName: string;
  studentCount: number;
}

export default function UnitPage() {
  const [divisions, setDivisions] = useState<string[]>([]);
  const [divisionName, setDivisionName] = useState<string>("");
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
          const names = data.data
            .map((d: any) => d.divisionName)
            .filter(Boolean);
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

  // 🟣 Fetch Units for Selected Division
  useEffect(() => {
    if (!divisionName) return;

    const fetchUnits = async () => {
      setLoadingUnits(true);
      try {
        const res = await fetch(
          `/api/admin/unitdata/${encodeURIComponent(divisionName)}`
        );
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          console.error("Invalid response format");
          return;
        }

        const data = await res.json();
        if (res.ok && Array.isArray(data?.units)) {
          setUnits(data.units);
          setTotalStudents(data.totalStudents || 0);
        } else if (res.ok && Array.isArray(data?.data)) {
          setUnits(
            data.data.map((u: any) => ({
              unitName: u.unitName || "Unnamed Unit",
              studentCount: u.studentCount || 0,
            }))
          );
          setTotalStudents(data.totalStudents || 0);
        } else {
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
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Students Gala — Unit Wise Data
        </h1>

        {/* Division Selector */}
        <div className="flex justify-center mb-8">
          {loadingDivisions ? (
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
        {divisionName && (
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 text-center sm:text-left">
                {divisionName} —{" "}
                <span className="text-blue-600">Unit Wise Student Count</span>
              </h2>

              {totalStudents > 0 && (
                <div className="mt-3 sm:mt-0 text-center sm:text-right">
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {totalStudents}
                  </p>
                </div>
              )}
            </div>

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
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        #
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">
                        Unit Name
                      </th>
                      <th
                        onClick={handleSort}
                        className="px-6 py-3 text-right font-semibold text-gray-700 flex items-center justify-end gap-1 cursor-pointer select-none hover:text-blue-600 transition"
                      >
                        Student Count
                        {sortOrder === "asc" ? (
                          <ArrowUpNarrowWide className="w-4 h-4 text-blue-600 transition-transform" />
                        ) : (
                          <ArrowDownWideNarrow className="w-4 h-4 text-blue-600 transition-transform" />
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {units.map((unit, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50/40 transition-all duration-200"
                      >
                        <td className="px-6 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-6 py-3 font-medium text-gray-800">
                          {unit.unitName}
                        </td>
                        <td className="px-6 py-3 text-right font-semibold text-blue-600">
                          {unit.studentCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p className="text-lg font-medium">
                  No units found for this division.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try selecting another division.
                </p>
              </div>
            )}
          </div>
        )}

        {!divisionName && !loadingDivisions && (
          <p className="text-center text-gray-600">
            Please select a division to view unit data.
          </p>
        )}
      </div>
    </main>
  );
}
