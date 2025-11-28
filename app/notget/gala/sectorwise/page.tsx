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
  attendanceCount: number;
}

export default function SectorTable() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalAttendance, setTotalAttendance] = useState<number>(0);
  const [loadingSectors, setLoadingSectors] = useState<boolean>(false);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [attendanceSortOrder, setAttendanceSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchSectors = async () => {
      setLoadingSectors(true);
      try {
        const res = await fetch(`/api/admin/sectorwise`);
        const data = await res.json();

        if (res.ok && Array.isArray(data?.sectors)) {
          setSectors(data.sectors);
          setTotalStudents(data.totalStudents || 0);
          setTotalAttendance(data.totalAttendance || 0);
        } else {
          setSectors([]);
          setTotalStudents(0);
          setTotalAttendance(0);
        }
      } catch (err) {
        console.error("Error fetching sectors:", err);
      } finally {
        setLoadingSectors(false);
      }
    };

    fetchSectors();
  }, []);

  const handleSortStudents = () => {
    const sorted = [...sectors].sort((a, b) =>
      sortOrder === "asc"
        ? a.studentCount - b.studentCount
        : b.studentCount - a.studentCount
    );
    setSectors(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSortAttendance = () => {
    const sorted = [...sectors].sort((a, b) =>
      attendanceSortOrder === "asc"
        ? a.attendanceCount - b.attendanceCount
        : b.attendanceCount - a.attendanceCount
    );
    setSectors(sorted);
    setAttendanceSortOrder(attendanceSortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
          Students Gala — All Sector Wise Data
        </h1>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              All Sectors — <span className="text-blue-600">Register Count</span>
            </h2>

            <div className="text-right">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-3xl font-bold text-blue-700">{totalStudents}</p>

              <p className="text-sm text-gray-500 mt-2">Total Attendance</p>
              <p className="text-3xl font-bold text-green-600">{totalAttendance}</p>
            </div>
          </div>

          {loadingSectors ? (
            <div className="flex justify-center py-10">
              <span className="animate-pulse text-gray-600">Loading...</span>
            </div>
          ) : sectors.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-[700px] w-full text-sm sm:text-base">
               <thead className="bg-gray-100">
  <tr>
    <th className="px-4 py-3 text-left font-semibold">#</th>
    <th className="px-4 py-3 text-left font-semibold">Division</th>
    <th className="px-4 py-3 text-left font-semibold">Sector</th>
    <th className="px-4 py-3 text-right font-semibold">Units</th>

    {/* STUDENT SORT */}
    <th
      onClick={handleSortStudents}
      className="px-4 py-3 text-right font-semibold cursor-pointer hover:text-blue-600"
    >
      <div className="flex items-center justify-end gap-1">
        Students
        {sortOrder === "asc" ? (
          <ArrowUpNarrowWide className="w-4 h-4 text-blue-600" />
        ) : (
          <ArrowDownWideNarrow className="w-4 h-4 text-blue-600" />
        )}
      </div>
    </th>

    {/* ATTENDANCE SORT */}
    <th
      onClick={handleSortAttendance}
      className="px-4 py-3 text-right font-semibold cursor-pointer hover:text-green-600"
    >
      <div className="flex items-center justify-end gap-1">
        Attendance
        {attendanceSortOrder === "asc" ? (
          <ArrowUpNarrowWide className="w-4 h-4 text-green-600" />
        ) : (
          <ArrowDownWideNarrow className="w-4 h-4 text-green-600" />
        )}
      </div>
    </th>
  </tr>
</thead>


                <tbody className="divide-y divide-gray-200">
                  {sectors.map((sector, index) => (
                    <tr key={index} className="hover:bg-blue-50 duration-200">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3 font-medium">{sector.divisionName}</td>
                      <td className="px-4 py-3 font-medium">{sector.sectorName}</td>
                      <td className="px-4 py-3 text-right font-semibold">{sector.unitCount}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">{sector.studentCount}</td>
                      <td className="px-4 py-3 text-right  font-bold text-green-600">{sector.attendanceCount}</td>
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
