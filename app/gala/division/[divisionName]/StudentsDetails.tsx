"use client";

import { useEffect, useState } from "react";

interface Sector {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  name: string;
  phone: string;
  unitName: string;
  email?: string;
  school?: string;
}

interface StudentsDetailsProps {
  divisionName: string;
}

export default function StudentsDetails({ divisionName }: StudentsDetailsProps) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentsError, setStudentsError] = useState("");

  useEffect(() => {
    if (!divisionName) return;

    const fetchSectors = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/gala/sector/${encodeURIComponent(divisionName)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to fetch sectors");

        if (Array.isArray(data.sectors)) {
          setSectors(data.sectors);
        } else {
          setError("No sectors found in this division.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, [divisionName]);

  useEffect(() => {
    if (!selectedSectorId) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      try {
        setStudentsLoading(true);
        setStudentsError("");

        const res = await fetch(`/api/gala/sector/studentsdata/${encodeURIComponent(selectedSectorId)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch students");

        setStudents(Array.isArray(data.students) ? data.students : []);
      } catch (err: any) {
        setStudentsError(err.message);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSectorId]);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Sector Selector */}
      <div className="flex justify-center mb-6">
        {loading ? (
          <p className="animate-pulse text-gray-600">Loading sectors...</p>
        ) : error ? (
          <p className="text-red-600 font-medium">{error}</p>
        ) : (
          <select
            value={selectedSectorId}
            onChange={(e) => {
              setSelectedSectorId(e.target.value);
              const sec = sectors.find((s) => s._id === e.target.value);
              setSelectedSector(sec?.name || "");
            }}
            className="border border-gray-300 text-gray-800 bg-white rounded-xl px-4 py-3 w-80 shadow-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select a Sector</option>
            {sectors.map((sec) => (
              <option key={sec._id} value={sec._id}>
                {sec.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Students Table */}
      {selectedSector && (
        <div className="w-full mt-4">
          {/* Search */}
          <div className="flex justify-end mb-4 pr-4">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg w-60 shadow-sm focus:ring-blue-500 focus:ring-2 outline-none"
            />
          </div>

          <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-4 border border-gray-200">
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold">Students Gala</h1>
              <p className="text-gray-600 font-semibold text-lg mb-1">
                Registered Students List
              </p>
              <h2 className="text-3xl font-extrabold text-gray-800 mt-3">
                {selectedSector}
              </h2>
              <p className="text-gray-700 mt-3 text-lg">
                Total Students:{" "}
                <span className="font-bold text-blue-600">{filteredStudents.length}</span>
              </p>
            </div>

            {/* Table */}
            {studentsLoading ? (
              <p className="text-center text-gray-600 animate-pulse">Loading students...</p>
            ) : studentsError ? (
              <p className="text-center text-red-600">{studentsError}</p>
            ) : filteredStudents.length === 0 ? (
              <p className="text-center text-gray-600">No students found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">#</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-2/5">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">
                        Unit
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell w-52">
                        Email / School
                      </th>
                    </tr>
                  </thead>

           <tbody>
  {filteredStudents.map((stu, index) => (
    <tr
      key={stu._id}
      className="border-t border-gray-300/40 hover:bg-blue-50 transition"
    >
      <td className="px-4 py-3 font-semibold text-gray-800">{index + 1}</td>
      <td className="px-4 py-3 font-bold text-gray-900">{stu.name}</td>
      <td className="px-4 py-3 text-gray-700">{stu.phone}</td>
      <td className="px-4 py-3 text-gray-700">{stu.unitName}</td>
      <td className="px-4 py-3 text-gray-700 hidden md:table-cell">
        {stu.email || stu.school || <span className="text-gray-400 italic">N/A</span>}
      </td>
    </tr>
  ))}
</tbody>

                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
