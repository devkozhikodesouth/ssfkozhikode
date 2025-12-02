"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Student {
  _id: string;
  name: string;
  phone: string;
  unitName: string;
  sector: string;
  email?: string;
  school: string;
  ticket: string;
  divisionName: string;
}

export default function StudentsDetails() {
  const [divisions, setDivisions] = useState<string[]>([]);
  const [divisionName, setDivisionName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentsError, setStudentsError] = useState("");

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===== Fetch Divisions =====
  useEffect(() => {
const fetchStudents = async () => {
  setStudentsLoading(true);
  try {
    const res = await fetch(`/api/admin/attendancelist`);
    const data = await res.json();

    if (res.ok && data.success) {
      setStudents(data.data);
    } else {
      setStudentsError(data.message || "Failed to fetch");
    }
  } catch (err) {
    setStudentsError("Network error");
  } finally {
    setStudentsLoading(false);
  }
};


    fetchStudents();
  }, []);

  // ===== Fetch Students by Division =====
  

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
    doc.setFontSize(18);
    doc.setTextColor(232, 27, 65);
    doc.text(`Division: ${divisionName}`, 80, 15);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Students: ${filteredStudents.length}`, 80, 25);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Name", "Phone", "Ticket", "Unit", "Sector","Division","School"]],
      body: filteredStudents.map((stu, index) => [
        index + 1,
        stu.name,
        stu.phone,
        stu.ticket,
        stu?.unitName,
        stu?.sector,
        stu?.divisionName,
        stu.school
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [33, 150, 243] },
      didDrawPage: () => {
        doc.setFontSize(10);
        doc.text(`Page ${doc.getNumberOfPages()}`, 190, 290, { align: "right" });
      },
    });

    doc.save(`${divisionName}-students.pdf`);
  };

  const exportCSV = () => {
  const escapeCSV = (value: any) => {
    if (value === null || value === undefined) return "";
    const str = String(value).replace(/"/g, '""'); // escape internal quotes
    return `"${str}"`; // wrap in quotes
  };

  const rows = [
    ["#", "Name", "Phone", "Ticket", "Unit", "Sector", "Division", "School"],
    ...filteredStudents.map((stu, i) => [
      i + 1,
      escapeCSV(stu.name),
      escapeCSV(stu.phone),
      escapeCSV(stu.ticket),
      escapeCSV(stu?.unitName),
      escapeCSV(stu?.sector),
      escapeCSV(stu?.divisionName),
      escapeCSV(stu.school),
    ]),
  ];

  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${divisionName}-students.csv`;
  link.click();
  URL.revokeObjectURL(url);
};


  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 overflow-scroll">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6">
        <h1 className="text-center text-2xl md:text-3xl font-bold text-blue-700 mb-6">
          Students Gala Registration
        </h1>


        {/* Table Container */}
        {students && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-200 w-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border px-4 py-2 rounded-lg w-full sm:w-64"
              />

              <div className="flex flex-wrap items-center gap-4">
                <div className="font-bold text-gray-800">
                  Total Count: {filteredStudents.length}
                </div>

                <button onClick={exportPDF} className="bg-blue-600 text-white px-6 py-2 rounded-lg">PDF</button>
                <button onClick={exportCSV} className="bg-green-600 text-white px-6 py-2 rounded-lg">CSV</button>
              </div>
            </div>

            {studentsLoading ? (
              <p className="text-center text-gray-600 animate-pulse">Loading students...</p>
            ) : studentsError ? (
              <p className="text-center text-red-600">{studentsError}</p>
            ) : filteredStudents.length === 0 ? (
              <p className="text-center text-gray-600">No students found.</p>
            ) : (
              <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-400 rounded-lg">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100 text-sm md:text-base">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">#</th>
                      <th className="px-4 py-3 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 text-left font-semibold">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold">Ticket</th>
                      <th className="px-4 py-3 text-left font-semibold">Unit</th>
                      <th className="px-4 py-3 text-left font-semibold">Sector</th>
                      <th className="px-4 py-3 text-left font-semibold">Division</th>
                      <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">
                        School 
                      </th>
                    </tr>
                  </thead>

                  <tbody className="text-sm md:text-base">
                    {filteredStudents.map((stu, index) => (
                      <tr
                        key={stu._id}
                        className="border-t border-gray-300/40 hover:bg-blue-50 transition"
                      >
                        <td className="px-4 py-3 font-semibold">{index + 1}</td>
                        <td className="px-4 py-3">{stu.name}</td>
                        <td className="px-4 py-3">{stu.phone}</td>
                        <td className="px-4 py-3">{stu.ticket}</td>
                        <td className="px-4 py-3">{stu?.unitName}</td>
                        <td className="px-4 py-3">{stu?.sector}</td>
                        <td className="px-4 py-3">{stu?.divisionName}</td>
                        <td className="px-4 py-3 hidden md:table-cell">{stu.school}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
