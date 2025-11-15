"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  const exportPDF = async () => {
    const element: any = document.getElementById("pdf-content");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${selectedSector}-students.pdf`);
  };

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

  useEffect(() => {
    const fetchStudents = async () => {
      setStudentsLoading(true);
      const res = await fetch(`/api/gala/sector/studentsdata/${encodeURIComponent(selectedSectorId)}`);
      const data = await res.json();
      if (res.ok) setStudents(data.students ?? []);
      else setStudentsError(data?.message || "Failed to fetch students");
      setStudentsLoading(false);
    };
    if (selectedSectorId) fetchStudents();
  }, [selectedSectorId]);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full px-4 md:px-10 py-6">
      {/* Header Title */}
      <h1 className="text-center text-3xl md:text-4xl font-extrabold text-blue-700 mb-6 tracking-wide">
        Students Gala Registration
      </h1>

      {/* Sector Dropdown */}
      <div className="flex justify-center mb-6">
        {loading ? (
          <p className="animate-pulse text-gray-600">Loading sectors...</p>
        ) : (
          <select
            value={selectedSectorId}
            onChange={(e) => {
              setSelectedSectorId(e.target.value);
              const sec = sectors.find((s) => s._id === e.target.value);
              setSelectedSector(sec?.name || "");
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
          {/* Search and Export */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full md:w-1/3 shadow-sm focus:ring-blue-500 focus:ring-2 outline-none"
            />

            <button
              onClick={exportPDF}
              className="bg-linear-to-r from-blue-600 to-blue-800 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition"
            >
              Download PDF
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
            <div className="text-center mb-5">
              <h2 className="text-2xl font-extrabold text-blue-700">{selectedSector}</h2>
              <p className="text-lg font-medium text-gray-700">
                Registered Students:{" "}
                <span className="text-blue-600 font-bold">{filteredStudents.length}</span>
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
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-2/5">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">Unit</th>
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
                          {stu.email
                            ? stu.email
                            : stu.school
                            ? stu.school
                            : <span className="text-gray-400 italic">N/A</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* HIDDEN PDF PRINT AREA */}
       <div
  id="pdf-content"
  style={{
    width: "794px",
    padding: "25px",
    background: "white",
    position: "absolute",
    left: "-9999px",

  }}
>
  {/* Header Row */}
  <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "25px" }}>
    {/* Left Image */}
    <img
      src="/Students-Gala.png"
      alt=""
      style={{
        width: "160px",
        height: "auto",
        objectFit: "contain",
      }}
    />

    {/* Right Title Section */}
    <div style={{ flex: 1 }}>
      <h1
        style={{
          textAlign: "left",
          fontSize: "30px",
          fontWeight: "bold",
          color: "#E81B41",
        }}
      >
        {selectedSector} Sector
      </h1>
      <p
        style={{
          textAlign: "left",
          fontSize: "18px", 
          color: "#333",
        }}
      >
        Registered Students Report
      </p>
      <p
        style={{
          textAlign: "left",
          fontSize: "18px",
          fontWeight: "600",
          color: "#000",
        }}
      >
        Total Students:{" "}
        <span style={{ color: "#0d6efd", fontWeight: "bold" }}>
          {filteredStudents.length}
        </span>
      </p>
    </div>
  </div>

  {/* TABLE */}
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      border: "1px solid #ccc",
      fontSize: "14px",
    }}
  >
    <thead>
      <tr style={{ background: "#e8f0ff", fontWeight: 600 }}>
        <th style={{ padding: "8px", border: "1px solid #ccc" }}>#</th>
        <th style={{ padding: "8px", border: "1px solid #ccc" }}>Name</th>
        <th style={{ padding: "8px", border: "1px solid #ccc" }}>Phone</th>
        <th style={{ padding: "8px", border: "1px solid #ccc" }}>Unit</th>
      </tr>
    </thead>

    <tbody>
      {filteredStudents.map((stu, i) => (
        <tr key={stu._id}>
          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{i + 1}</td>
          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{stu.name}</td>
          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{stu.phone}</td>
          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{stu.unitName}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        </div>
      )}
    </div>
  );
}
