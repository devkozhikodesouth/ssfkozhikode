
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown } from "lucide-react";

type DivisionRow = {
  _id: string;
  divisionName: string;

  divisionRegistered: number;
  sectorRegistered: number;
  totalRegistered: number;

  divisionAttended: number;
  sectorAttended: number;
  totalAttended: number;
};


export default function DivisionRegistrationTable({
  darkMode,
}: {
  darkMode?: boolean;
}) {
  const [data, setData] = useState<DivisionRow[]>([]);
  const [sortKey, setSortKey] = useState<
    "divisionRegistered" | "sectorRegistered" | "totalRegistered"
  >("totalRegistered");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    
    fetch("/api/admin/grand/totaldeligates", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => setData(res.divisions || []))
      .catch(console.error);
  }, []);

  const sortBy = (key: typeof sortKey) => {
    const sorted = [...data].sort((a, b) =>
      sortOrder === "asc" ? a[key] - b[key] : b[key] - a[key]
    );
    setData(sorted);
    setSortKey(key);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
const grandTotalRegistered = data.reduce(
  (sum, row) => sum + row.totalRegistered,
  0
);

const grandTotalAttended = data.reduce(
  (sum, row) => sum + row.totalAttended,
  0
);

  return (
    <section className="p-6">
      <div
        className={`p-6 rounded-lg shadow-sm ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        }`}
      >
<div className="flex justify-between items-center mb-4">
  <h3 className="font-semibold text-lg">
    Division Registration & Attendance Summary
  </h3>

  <div className="flex gap-3">
    <span
      className={`text-sm font-semibold px-4 py-1 rounded-full ${
        darkMode
          ? "bg-gray-700 text-green-400"
          : "bg-green-100 text-green-700"
      }`}
    >
      Registered: {grandTotalRegistered}
    </span>

    <span
      className={`text-sm font-semibold px-4 py-1 rounded-full ${
        darkMode
          ? "bg-gray-700 text-blue-400"
          : "bg-blue-100 text-blue-700"
      }`}
    >
      Attended: {grandTotalAttended}
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

              {[
  { key: "divisionRegistered", label: "Division Reg" },
  { key: "sectorRegistered", label: "Sector Reg" },
  { key: "totalRegistered", label: "Total Reg" },
  { key: "divisionAttended", label: "Division Att" },
  { key: "sectorAttended", label: "Sector Att" },
  { key: "totalAttended", label: "Total Att" },
]
.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => sortBy(key as any)}
                  className="pb-3 border-b cursor-pointer text-right select-none"
                >
                  <div className="flex items-center justify-end">
                    {label}
                    <ArrowUpDown
                      className={`w-4 h-4 ml-2 ${
                        sortKey === key && sortOrder === "asc"
                          ? "rotate-180 text-blue-500"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <motion.tr
                key={row._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`border-t ${
                  darkMode
                    ? "border-gray-700 hover:bg-gray-700/30"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <td className="py-3 font-medium">{row.divisionName}</td>
                <td className="py-3 text-right font-semibold">
                  {row.divisionRegistered}
                </td>
                <td className="py-3 text-right font-semibold text-indigo-500">
                  {row.sectorRegistered}
                </td>
                <td className="py-3 text-right font-semibold text-green-600">
                  {row.totalRegistered}
                </td>
                <td className="py-3 text-right">{row.divisionAttended}</td>
<td className="py-3 text-right text-indigo-500">{row.sectorAttended}</td>
<td className="py-3 text-right text-blue-600 font-semibold">
  {row.totalAttended}
</td>

              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
