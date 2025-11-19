"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
} from "lucide-react";

interface SectorData {
  divisionName: string;
  sectorName: string;
  unitCount: number;
  studentCount: number;
}

export default function SectorTable() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [loadingSectors, setLoadingSectors] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchSectors = async () => {
      setLoadingSectors(true);
      try {
        const res = await fetch(`/api/admin/sectorwise`);
        const data = await res.json();

        if (res.ok && Array.isArray(data?.sectors)) {
          setSectors(data.sectors);
          setTotalStudents(data.totalStudents || 0);
        } else {
          setSectors([]);
          setTotalStudents(0);
        }
      } catch (err) {
        console.error("Error fetching sectors:", err);
      } finally {
        setLoadingSectors(false);
      }
    };

    fetchSectors();
  }, []);

  const handleSort = () => {
    const sorted = [...sectors].sort((a, b) =>
      sortOrder === "asc"
        ? a.studentCount - b.studentCount
        : b.studentCount - a.studentCount
    );
    setSectors(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
          🟩 Students Gala — All Sector Wise Data
        </h1>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              All Sectors — <span className="text-blue-600">Register Count</span>
            </h2>

            {totalStudents > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-blue-700">{totalStudents}</p>
              </div>
            )}
          </div>

          {loadingSectors ? (
            <div className="flex justify-center py-10">
              <span className="animate-pulse text-gray-600">Loading...</span>
            </div>
          ) : sectors.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full text-sm sm:text-base">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Division</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Sector</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Units</th>
                    <th
                      onClick={handleSort}
                      className="px-4 py-3 text-right font-semibold text-gray-700 flex items-center justify-end gap-1 cursor-pointer hover:text-blue-600"
                    >
                      Students
                      {sortOrder === "asc" ? (
                        <ArrowUpNarrowWide className="w-4 h-4 text-blue-600" />
                      ) : (
                        <ArrowDownWideNarrow className="w-4 h-4 text-blue-600" />
                      )}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {sectors.map((sector, index) => (
                    <tr key={index} className="hover:bg-blue-50 duration-200">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{sector.divisionName}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{sector.sectorName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-700">{sector.unitCount}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">{sector.studentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">No sector found.</div>
          )}
        </div>
      </div>
    </main>
  );
}
