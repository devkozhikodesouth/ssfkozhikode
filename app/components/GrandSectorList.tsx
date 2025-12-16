"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react";

interface Registration {
  name: string;
  mobile: string;
  designation: string;
  organizationLevel: string;
  attendance: boolean;
}

interface Sector {
  sectorName: string;
  registrations: Registration[];
}

interface DivisionData {
  divisionName: string;
  totalStudents: number;
  sectors: Sector[];
}

interface ApiError {
  error: string;
}

export default function GrandSectorList({
  divisionName,
}: {
  divisionName: string;
}) {
  const [data, setData] = useState<DivisionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
console.log(divisionName);
  useEffect(() => {
    if (!divisionName) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/admin/grand/sectorwise/${encodeURIComponent(divisionName)}`,
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
      } catch (e) {
        console.error("Error fetching division data:", e);
        setError("Failed to fetch division data. Please try again later.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [divisionName]);

  if (loading)
    return (
      <p className="text-center py-10 text-gray-500">
        Loading division data...
      </p>
    );

  if (error)
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (!data)
    return <p className="text-center py-10 text-red-500">No data found.</p>;

  const handleSort = () => {
    if (!data) return;
    const sorted = [...data.sectors].sort((a, b) =>
      sortOrder === "asc"
        ? a.registrations.length - b.registrations.length
        : b.registrations.length - a.registrations.length
    );
    setData({ ...data, sectors: sorted });
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-200 mt-10 transition-all">
      <div className="text-center mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
         Grand Conclave
        </h1>
        <p className="text-gray-600 font-semibold text-lg mb-2">
          Sector Wise Registration Status
        </p>

        <h2 className="text-4xl font-extrabold text-blue-700 mt-4">
          {data.divisionName}
        </h2>

        <p className="text-gray-700 mt-3 text-lg">
          Total Students:{" "}
          <span className="font-bold text-blue-600">{data.totalStudents}</span>
        </p>
      </div>

      {/* Sort Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleSort}
          className="flex items-center  gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Sort by Count <ArrowUpDown className="w-4 h-4" />
        </button>
      </div>

      {/* Accordion List */}
      <div className="join join-vertical w-full space-y-2">
        {data.sectors.map((sector, index) => (
          <div
            key={index}
            className="collapse join-item border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <input type="radio" name="accordion-sectors" />

            <div className="collapse-title flex flex-col items-center gap-2 text-lg font-semibold bg-gray-50 group-open:bg-blue-50 px-5 py-4">
              <div className="w-full flex justify-between items-center">
                <span>{sector.sectorName}</span>
                <span className="text-blue-600 font-bold   ">{sector.registrations.length} </span>
              </div>
            </div>

            <div className="collapse-content px-5 pb-4 pt-2 bg-white">
              {sector.registrations?.length ? (
                <table className="w-full text-sm sm:text-base mt-3 border-collapse">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Mobile</th>
                      <th className="px-3 py-2 text-left">Designation</th>
                      <th className="px-3 py-2 text-left">Level</th>
                        {/* <th className="px-3 py-2 text-center">Attendance</th> */}
                    </tr>
                  </thead>  
                  <tbody className="divide-y">
                    {sector.registrations.map((user, i) => (
                      <tr key={i} className="hover:bg-blue-50 transition">
                        <td className="px-3 py-2 font-medium">{user.name}</td>
                        <td className="px-3 py-2">{user.mobile}</td>
                        <td className="px-3 py-2">{user.designation}</td>
                        <td className="px-3 py-2 capitalize">
                          {user.organizationLevel}
                        </td>
                          {/* <td className="px-3 py-2 text-center">
                            {user.attendance ? "✔️" : "—"}
                          </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500 py-2">
                  No registrations found.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
