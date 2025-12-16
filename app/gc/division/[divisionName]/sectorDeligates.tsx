"use client";

import { useEffect, useState } from "react";

interface Delegate {
  _id: string;
  name: string;
  mobile: string;
  designation: string;
  ticket: string;
  attendance: boolean;
}

export default function DivisionDelegatesTable({
  divisionName,
}: {
  divisionName: string;
}) {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!divisionName) return;

    const fetchDelegates = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/gc/divdelegates/${encodeURIComponent(divisionName)}`
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to fetch delegates");
          setDelegates([]);
        } else {
          setDelegates(data.delegates || []);
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDelegates();
  }, [divisionName]);

  const filtered = delegates.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-blue-700">
            {divisionName}
          </h2>
          <p className="text-gray-600 font-medium">
            Registered Division Delegates
          </p>
        </div>

        <div className="text-center md:text-right">
          <p className="text-sm text-gray-500">Total Delegates</p>
          <p className="text-3xl font-bold text-blue-700">
            {filtered.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {/* Content */}
      {loading ? (
        <p className="text-center py-10 text-gray-600 animate-pulse">
          Loading delegates...
        </p>
      ) : error ? (
        <p className="text-center py-10 text-red-600">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-10 text-gray-500">
          No delegates found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold w-12">#</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Mobile</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Designation
                </th>
                <th className="px-4 py-3 text-left font-semibold">Ticket</th>
                <th className="px-4 py-3 text-left font-semibold">Division</th>
                {/* <th className="px-4 py-3 text-center font-semibold">
                  Attendance
                </th> */}
              </tr>
            </thead>

            <tbody>
              {filtered.map((d, index) => (
                <tr
                  key={d._id}
                  className="border-t hover:bg-blue-50 transition"
                >
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {d.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{d.mobile}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {d.designation}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-700">
                    {d.ticket}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {divisionName}
                  </td>
                  {/* <td className="px-4 py-3 text-center">
                    {d.attendance ? (
                      <span className="text-green-600 font-bold">Present</span>
                    ) : (
                      <span className="text-red-600 font-bold">Absent</span>
                    )}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
