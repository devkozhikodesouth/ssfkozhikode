"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  ticket: string;
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

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===== Export PDF =====
  const exportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: true,
    });

    doc.addImage("/galaHeading.png", "PNG", 15, 5, 45, 28);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(232, 27, 65);
    doc.text(`${selectedSector} Sector`, 80, 18);

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Registered Students Report", 80, 26);

    doc.setFontSize(15);
    doc.setTextColor(13, 110, 253);
    doc.text(`Total Students: ${filteredStudents.length}`, 80, 33);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Name", "Phone", "Ticket", "Unit"]],
      body: filteredStudents.map((stu, index) => [
        index + 1,
        stu.name,
        stu.phone,
        stu.ticket,
        stu.unitName,
      ]),
      theme: "grid",
      styles: { fontSize: 9 },
    });

    doc.save(`${selectedSector}-students.pdf`);
  };

  // ===== Export CSV =====
  const exportCSV = () => {
    const rows = [
      ["#", "Name", "Phone", "Ticket", "Unit"],
      ...filteredStudents.map((stu, i) => [
        i + 1,
        stu.name,
        stu.phone,
        stu.ticket,
        stu.unitName,
      ]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedSector}-students.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ===== Fetch Sectors =====
  useEffect(() => {
    const fetchSectors = async () => {
      setLoading(true);
      const res = await fetch(`/api/gala/sector/${encodeURIComponent(divisionName)}`);
      const data = await res.json();
      if (res.ok) setSectors(data.sectors || []);
      else setError(data?.message || "Failed to fetch sectors");
      setLoading(false);
    };
    if (divisionName) fetchSectors();
  }, [divisionName]);

  // ===== Fetch Students =====
  useEffect(() => {
    const fetchStudents = async () => {
      setStudentsLoading(true);
      const res = await fetch(
        `/api/gala/sector/studentsdata/${encodeURIComponent(selectedSectorId)}`
      );
      const data = await res.json();
      if (res.ok) setStudents(data.students ?? []);
      else setStudentsError(data?.message || "Failed to fetch students");
      setStudentsLoading(false);
    };
    if (selectedSectorId) fetchStudents();
  }, [selectedSectorId]);

  return (
    <div className="w-full px-4 md:px-10 py-6">
      <h1 className="text-center text-3xl md:text-4xl font-extrabold text-blue-700 mb-6 tracking-wide">
        Students Gala Registration
      </h1>

      {/* SELECT SECTOR */}
      <div className="flex justify-center mb-6">
        {loading ? (
          <p className="animate-pulse text-gray-600">Loading sectors...</p>
        ) : (
          <select
            value={selectedSectorId}
            onChange={(e) => {
              setSelectedSectorId(e.target.value);
              const sector = sectors.find((s) => s._id === e.target.value);
              setSelectedSector(sector?.name || "");
            }}
            className="border border-gray-300 bg-white rounded-xl px-4 py-3 w-80 shadow-md text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
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

      {selectedSector && (
        <div>
          {/* SEARCH + BUTTONS */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full md:w-1/3 shadow-sm focus:ring-blue-500 focus:ring-2 outline-none"
            />

            <div className="flex gap-3">
              <button
                onClick={exportPDF}
                className="bg-blue-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition"
              >
                PDF
              </button>

              <button
                onClick={exportCSV}
                className="bg-green-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition"
              >
                CSV
              </button>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <div className="text-center mb-5">
              <h2 className="text-2xl font-extrabold text-blue-700">{selectedSector}</h2>
              <p className="text-lg font-medium text-gray-700">
                Registered Students:
                <span className="text-blue-600 font-bold"> {filteredStudents.length}</span>
              </p>
            </div>

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
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-2/5">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">Ticket</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">Unit</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell w-52">
                        School / Email
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
                        <td className="px-4 py-3 text-gray-700">{stu.ticket}</td>
                        <td className="px-4 py-3 text-gray-700">{stu.unitName}</td>
                        <td className="px-4 py-3 text-gray-700 hidden md:table-cell">
                          {stu.school ?? stu.email ?? <span className="text-gray-400 italic">N/A</span>}
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
