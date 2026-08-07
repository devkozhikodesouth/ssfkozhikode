"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Share2 } from "lucide-react";

type DivisionCount = {
  _id: string;
  divisionName: string;
  totalStudents: number;
  attendanceMarked: number;
};

export default function DivisionStudentTable({ darkMode }: { darkMode?: boolean }) {
  const [data, setData] = useState<DivisionCount[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [attendanceTotal, setAttendanceTotal] = useState<number>(0);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [attendanceSortOrder, setAttendanceSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetch("/api/admin/divisiondata", { credentials: "include" })
      .then((res) => res.json())
      .then((result) => {
        setData(result.divisions || []);
        setTotal(result.totalStudents || 0);
        setAttendanceTotal(result.attendanceTotal || 0);
      })
      .catch(console.error);
  }, []);

  // Sorting Total Students
  const handleSort = () => {
    const sorted = [...data].sort((a, b) =>
      sortOrder === "asc"
        ? a.totalStudents - b.totalStudents
        : b.totalStudents - a.totalStudents
    );
    setData(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Sorting Attendance Marked
  const handleAttendanceSort = () => {
    const sorted = [...data].sort((a, b) =>
      attendanceSortOrder === "asc"
        ? a.attendanceMarked - b.attendanceMarked
        : b.attendanceMarked - a.attendanceMarked
    );
    setData(sorted);
    setAttendanceSortOrder(attendanceSortOrder === "asc" ? "desc" : "asc");
  };

  const shareSummaryToWhatsApp = () => {
    if (data.length === 0) return;

    const listItems = data
      .map(
        (row, i) =>
          `${i + 1}. *${row.divisionName}*\n   Registered: ${row.totalStudents} | Attended: ${row.attendanceMarked}`
      )
      .join("\n\n");

    const text = `*Students Gala — Division Registration Summary*\n\n📊 *Total Students:* ${total}\n✅ *Total Attended:* ${attendanceTotal}\n\n*Division Breakdown:*\n${listItems}\n\n*SSF Kozhikode South*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <section className="p-2 sm:p-6">
      <div className={`p-6 rounded-2xl shadow-sm border ${darkMode ? "bg-gray-800 text-gray-200 border-gray-700" : "bg-white text-gray-800 border-gray-200"}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="font-extrabold text-lg sm:text-xl">Division Student Count</h3>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
              darkMode ? "bg-gray-700 text-gray-200" : "bg-purple-100 text-purple-700"
            }`}>
              Total: {total}
            </span>

            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
              Attended: {attendanceTotal}
            </span>

            <button
              onClick={shareSummaryToWhatsApp}
              disabled={data.length === 0}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Table List</span>
            </button>
          </div>
        </div>

       <table className="w-full text-left border-collapse text-sm">
  <thead>
    <tr
      className={`text-sm ${
        darkMode ? "text-gray-400 border-gray-700" : "text-gray-500 border-gray-200"
      }`}
    >
      <th className="pb-3 border-b text-left">Division</th>

      <th
        onClick={handleSort}
        className="pb-3 border-b cursor-pointer select-none text-right"
      >
        <div className="flex items-center justify-end">
          Total Students
          <ArrowUpDown
            className={`w-4 h-4 ml-2 ${
              sortOrder === "asc" ? "rotate-180 text-blue-500" : "text-gray-400"
            }`}
          />
        </div>
      </th>

      <th
        onClick={handleAttendanceSort}
        className="pb-3 border-b cursor-pointer select-none text-right"
      >
        <div className="flex items-center justify-end">
          Attendance Marked
          <ArrowUpDown
            className={`w-4 h-4 ml-2 ${
              attendanceSortOrder === "asc" ? "rotate-180 text-green-600" : "text-gray-400"
            }`}
          />
        </div>
      </th>
    </tr>
  </thead>

  <tbody>
    {data.length === 0 ? (
      <tr>
        <td colSpan={3} className="py-4 text-center text-gray-400">
          Loading...
        </td>
      </tr>
    ) : (
      data.map((division, i) => (
        <motion.tr
          key={division._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`border-t ${
            darkMode
              ? "border-gray-700 hover:bg-gray-700/30"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <td className="py-3 font-medium text-left">{division.divisionName}</td>
          <td className="py-3 font-semibold text-right">{division.totalStudents}</td>
          <td className="py-3 font-semibold text-right text-green-600">
            {division.attendanceMarked}
          </td>
        </motion.tr>
      ))
    )}
  </tbody>
</table>

      </div>
    </section>
  );
}
