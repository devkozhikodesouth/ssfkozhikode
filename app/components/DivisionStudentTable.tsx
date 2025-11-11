"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  ArrowUpDown,
} from "lucide-react";

type DivisionCount = {
  _id: string;
  divisionName: string;
  totalStudents: number;
};

export default function DivisionStudentTable({
  darkMode,
}: {
  darkMode?: boolean;
}) {
  const [data, setData] = useState<DivisionCount[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetch("/api/admin/divisiondata", { credentials: "include" })
      .then((res) => res.json())
      .then((result) => {
        setData(result.divisions || []);
        setTotal(result.totalStudents || 0);
      })
      .catch(console.error);
  }, []);

  // 🧭 Sort Handler
  const handleSort = () => {
    const sorted = [...data].sort((a, b) =>
      sortOrder === "asc"
        ? a.totalStudents - b.totalStudents
        : b.totalStudents - a.totalStudents
    );
    setData(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <section className="p-6">
      <h2 className="text-xl font-semibold mb-4">Tables</h2>

      <div
        className={`p-6 rounded-lg shadow-sm transition-colors duration-300 ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Division Student Count</h3>

          <div className="flex items-center gap-3">
            

            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                darkMode
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Total Students: {total}
            </span>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className={`text-sm ${
                darkMode
                  ? "text-gray-400 border-gray-700"
                  : "text-gray-500 border-gray-200"
              }`}
            >
              <th className="pb-3 border-b">Division</th>
              <th
                onClick={handleSort}
                className={`pb-3 border-b cursor-pointer select-none flex items-center justify-between group ${
                  darkMode
                    ? "hover:text-blue-400"
                    : "hover:text-blue-600 text-gray-500"
                }`}
              >
                Total Students
                <ArrowUpDown
                  className={`w-4 h-4 ml-2 transition-transform ${
                    sortOrder === "asc"
                      ? "rotate-180 text-blue-500"
                      : "text-gray-400"
                  }`}
                />
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="py-4 text-center text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            ) : (
              data.map((division: DivisionCount, i: number) => (
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
                  <td className="py-3 font-medium flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full ${
                        darkMode ? "bg-gray-600" : "bg-gray-300"
                      }`}
                    />
                    {division.divisionName}
                  </td>
                  <td className="py-3 font-semibold">
                    {division.totalStudents}
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
