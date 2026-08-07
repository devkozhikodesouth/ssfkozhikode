"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Share2 } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  phone: string;
  unitName: string;
  sector: string;
  email?: string;
  school?: string;
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

  const shareFullListToWhatsApp = () => {
    if (filteredStudents.length === 0) return;
    const listItems = filteredStudents
      .map(
        (s, i) =>
          `${i + 1}. *${s.name}*\n   📱 ${s.phone} | 🎫 ${s.ticket || "N/A"} | 📍 Unit: ${s.unitName} (${s.sector})`
      )
      .join("\n\n");

    const text = `*Students Gala — ${divisionName} Division Students*\n📊 *Total Students:* ${filteredStudents.length}\n\n${listItems}\n\n*SSF Kozhikode South*`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareSingleToWhatsApp = (stu: Student) => {
    const text = `*Students Gala — SSF Kozhikode South*\n\n📌 *Student Details*\n👤 *Name:* ${stu.name}\n📱 *Mobile:* ${stu.phone}\n🎫 *Ticket:* ${stu.ticket || "N/A"}\n📍 *Division / Sector / Unit:* ${divisionName} / ${stu.sector} / ${stu.unitName}\n\nThank you!`;
    const cleanMobile = stu.phone ? stu.phone.replace(/\D/g, "") : "";
    const phoneParam = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const url = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // ===== Fetch Divisions =====
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const res = await fetch("/api/register");
        const data = await res.json();

        if (res.ok && data?.success && Array.isArray(data.data)) {
          const names = data.data.map((d: any) => d.divisionName).filter(Boolean);
          setDivisions(names);
        } else {
          console.warn("No valid divisions found:", data);
        }
      } catch (err) {
        console.error("Error fetching divisions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDivisions();
  }, []);

  // ===== Fetch Students by Division =====
  useEffect(() => {
    if (!divisionName) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const res = await fetch(`/api/admin/studentsdata?division=${divisionName}`);
        const data = await res.json();

        if (res.ok && data?.success && Array.isArray(data.data)) {
          setStudents(data.data);
        } else {
          setStudentsError(data?.message || "Failed to fetch students");
          setStudents([]);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [divisionName]);

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
      head: [["#", "Name", "Phone", "Ticket", "Unit", "Sector"]],
      body: filteredStudents.map((stu, index) => [
        index + 1,
        stu.name,
        stu.phone,
        stu.ticket,
        stu.unitName,
        stu.sector,
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

  // ===== Export CSV =====
  const exportCSV = () => {
    const rows = [
      ["#", "Name", "Phone", "Ticket", "Unit", "Sector"],
      ...filteredStudents.map((stu, i) => [
        i + 1,
        stu.name,
        stu.phone,
        stu.ticket,
        stu.unitName,
        stu.sector,
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

        {/* Division Selector */}
        <div className="flex justify-center mb-8 w-full">
          {loading ? (
            <p>Loading divisions...</p>
          ) : (
            <select
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a Division</option>
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Table Container */}
        {divisionName && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-200 w-full">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border px-4 py-2 rounded-lg w-full sm:w-64"
              />

              <div className="flex flex-wrap items-center gap-3">
                <div className="font-bold text-gray-800">
                  Total Count: {filteredStudents.length}
                </div>

                <button
                  onClick={shareFullListToWhatsApp}
                  disabled={filteredStudents.length === 0}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Full List</span>
                </button>

                <button onClick={exportPDF} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-xs font-semibold">PDF</button>
                <button onClick={exportCSV} className="bg-green-600 text-white px-5 py-2 rounded-lg text-xs font-semibold">CSV</button>
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
                <table className="w-full border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-100 font-bold text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold w-12">#</th>
                      <th className="px-4 py-3 text-left font-bold">Name</th>
                      <th className="px-4 py-3 text-left font-bold">Phone</th>
                      <th className="px-4 py-3 text-left font-bold">Ticket</th>
                      <th className="px-4 py-3 text-left font-bold">Unit</th>
                      <th className="px-4 py-3 text-left font-bold">Sector</th>
                      <th className="px-4 py-3 text-center font-bold">Share</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((stu, index) => (
                      <tr
                        key={stu._id}
                        className="border-t border-gray-300/40 hover:bg-blue-50 transition"
                      >
                        <td className="px-4 py-3 font-semibold">{index + 1}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">{stu.name}</td>
                        <td className="px-4 py-3">{stu.phone}</td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-700">{stu.ticket}</td>
                        <td className="px-4 py-3">{stu.unitName}</td>
                        <td className="px-4 py-3">{stu.sector}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => shareSingleToWhatsApp(stu)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
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
