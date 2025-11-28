"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { residentialSchools } from "@/app/utils/schoolsData";

interface Student {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  school?: string;
  attendanceStatus?: string;
  ticket: string;
  divisionName: string;
}

export default function StudentsDetails() {
  const [selectedSchool, setSelectedSchool] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [completedAttendance, setCompletedAttendance] = useState(0);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===== Fetch students for selected School =====
  useEffect(() => {
    if (!selectedSchool) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/admin/residential?school=${selectedSchool}`);
        const data = await res.json();

        if (res.ok && data?.success && Array.isArray(data.data)) {
          setStudents(data.data);
          setTotalCount(data.totalCount);
          setCompletedAttendance(data.completedAttendance); // NEW
        } else {
          setError(data?.message || "Failed to fetch students");
          setStudents([]);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSchool]);

  // ===== PDF Export =====
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

    const schoolShort = selectedSchool.split(",")[0].trim();
    doc.text(`School: ${schoolShort}`, 80, 15);

    doc.setTextColor(0, 0, 0);
    doc.text(`Total Students: ${filteredStudents.length}`, 80, 25);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Name", "Phone", "Ticket", "School", "Attendance"]],
      body: filteredStudents.map((stu, i) => [
        i + 1,
        stu.name,
        stu.mobile,
        stu.ticket,
        stu.school || "",
        stu.attendanceStatus === "completed" ? "Completed" : "Pending",
      ]),
      theme: "grid",
      headStyles: { fillColor: [33, 150, 243] },
      styles: { fontSize: 10 },
      didDrawPage: () => {
        doc.text(`Page ${doc.getNumberOfPages()}`, 190, 290, { align: "right" });
      },
    });

    doc.save(`${selectedSchool}-students.pdf`);
  };

  // ===== CSV Export =====
  const exportCSV = () => {
    const rows = [
      ["#", "Name", "Phone", "Ticket", "School", "Attendance"],
      ...filteredStudents.map((stu, i) => [
        i + 1,
        stu.name,
        stu.mobile,
        stu.ticket,
        stu.school || "",
        stu.attendanceStatus === "completed" ? "Completed" : "Pending",
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedSchool}-students.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 overflow-scroll">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6">
        
        <h1 className="text-center text-2xl md:text-3xl font-bold text-blue-700 mb-2">
          Residential Students Registration
        </h1>

        <h2 className="text-center text-lg font-semibold text-gray-800 mb-1">
          Total Residential Students: {totalCount}
        </h2>

        <h3 className="text-center text-md font-semibold text-green-600">
          Attendance Completed: {completedAttendance}
        </h3>

        <h3 className="text-center text-md font-semibold text-red-600 mb-6">
          Pending: {filteredStudents.length - completedAttendance}
        </h3>

        {/* School Selector */}
        <div className="flex justify-center mb-8 w-full">
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a School</option>
            {residentialSchools.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </div>

        {selectedSchool && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border px-4 py-2 rounded-lg w-full sm:w-64"
              />

              <div className="flex items-center gap-4 flex-wrap">
                <div className="font-bold text-gray-800">
                  Total: {filteredStudents.length}
                </div>
                <button onClick={exportPDF} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                  PDF
                </button>
                <button onClick={exportCSV} className="bg-green-600 text-white px-6 py-2 rounded-lg">
                  CSV
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-gray-600 animate-pulse">Loading students...</p>
            ) : error ? (
              <p className="text-center text-red-600">{error}</p>
            ) : filteredStudents.length === 0 ? (
              <p className="text-center text-gray-600">No students found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100 text-sm md:text-base">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">#</th>
                      <th className="px-4 py-3 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 text-left font-semibold">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold">Ticket</th>
                      <th className="px-4 py-3 text-left font-semibold">School</th>
                      <th className="px-4 py-3 text-left font-semibold">Attendance</th>
                    </tr>
                  </thead>

                  <tbody className="text-sm md:text-base">
                    {filteredStudents.map((stu, index) => (
                      <tr key={stu._id} className="border-t border-gray-300/40 hover:bg-blue-50">
                        <td className="px-4 py-3 font-semibold">{index + 1}</td>
                        <td className="px-4 py-3">{stu.name}</td>
                        <td className="px-4 py-3">{stu.mobile}</td>
                        <td className="px-4 py-3">{stu.ticket}</td>
                        <td className="px-4 py-3">{stu.school}</td>
                        <td className="px-4 py-3 font-semibold">
                          {stu.attendanceStatus === "completed" ? (
                            <span className="text-green-600">Completed</span>
                          ) : (
                            <span className="text-red-600">Pending</span>
                          )}
                        </td>
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
