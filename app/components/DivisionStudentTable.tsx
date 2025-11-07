"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type DivisionCount = {
  _id: string;
  divisionName: string;
  totalStudents: number;
};

export default function DivisionStudentTable({ darkMode }: { darkMode?: boolean }) {
  const [data, setData] = useState<DivisionCount[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (  
    <section className="p-6">
      <h2 className="text-xl font-semibold mb-4">Tables</h2>

      <div
        className={`p-6 rounded-lg shadow-sm transition-colors duration-300 ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        }`}
      >
        <h3 className="font-semibold text-lg mb-3">Division Student Count</h3>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className={`text-sm ${
                darkMode ? "text-gray-400 border-gray-700" : "text-gray-500 border-gray-200"
              }`}
            >
              <th className="pb-3 border-b">Division</th>
              <th className="pb-3 border-b">Total Students</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-4 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : (
              data.map((division: DivisionCount, i: number) => (
                <motion.tr
                  key={division._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`border-t ${
                    darkMode ? "border-gray-700 hover:bg-gray-700/30" : "border-gray-200 hover:bg-gray-50"
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
                  <td className="py-3">{division.totalStudents}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
