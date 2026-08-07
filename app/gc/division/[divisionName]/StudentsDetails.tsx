"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Share2 } from "lucide-react";

interface Sector {
  _id: string;
  name: string;
}

interface GrandConclaveUser {
  _id: string;
  name: string;
  phone: string;
  ticket: string;
  divisionName: string;
  sectorName: string;
  designation: string;
}

interface StudentsDetailsProps {
  divisionName: string;
}

export default function StudentsDetails({ divisionName }: StudentsDetailsProps) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [students, setStudents] = useState<GrandConclaveUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentsError, setStudentsError] = useState("");

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shareFullListToWhatsApp = () => {
    if (filteredStudents.length === 0) return;
    const listItems = filteredStudents
      .map(
        (d, i) =>
          `${i + 1}. *${d.name}* (${d.designation || "Delegate"})\n   📱 ${d.phone} | 🎫 ${d.ticket || "N/A"}`
      )
      .join("\n\n");

    const text = `*Grand Conclave — ${divisionName} / ${selectedSector} Sector Delegates*\n📊 *Total Delegates:* ${filteredStudents.length}\n\n${listItems}\n\n*SSF Kozhikode South*`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareSingleToWhatsApp = (d: GrandConclaveUser) => {
    const text = `*Grand Conclave — SSF Kozhikode South*\n\n📌 *Delegate Details*\n👤 *Name:* ${d.name}\n📱 *Mobile:* ${d.phone}\n🏷️ *Designation:* ${d.designation || "N/A"}\n🎫 *Ticket:* ${d.ticket || "N/A"}\n📍 *Division / Sector:* ${divisionName} / ${selectedSector}\n\nThank you!`;
    const cleanMobile = d.phone ? d.phone.replace(/\D/g, "") : "";
    const phoneParam = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const url = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

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
      head: [["#", "Name", "Phone", "designation", "Ticket", "Division"]],
      body: filteredStudents.map((stu, index) => [
        index + 1,
        stu.name,
        stu.phone,
        stu.designation,
        stu.ticket,
        stu.divisionName,
      ]),
      theme: "grid",
      styles: { fontSize: 9 },
    });

    doc.save(`${selectedSector}-students.pdf`);
  };

  // ===== Export CSV =====
  const exportCSV = () => {
    const rows = [
      ["#", "Name", "Phone", "designation", "Ticket", "Division"],
      ...filteredStudents.map((stu, i) => [
        i + 1,
        stu.name,
        stu.phone,
        stu.designation,
        stu.ticket,
        stu.divisionName,
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
      const res = await fetch(`/api/gc/sector/${encodeURIComponent(divisionName)}`);
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
        `/api/gc/sector/studentsdata/${encodeURIComponent(selectedSectorId)}`
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
        Delegates Grand Conclave <br />Registration
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

            <div className="flex flex-wrap gap-3">
              <button
                onClick={shareFullListToWhatsApp}
                disabled={filteredStudents.length === 0}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Full List</span>
              </button>

              <button
                onClick={exportPDF}
                className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition"
              >
                PDF
              </button>

              <button
                onClick={exportCSV}
                className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition"
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
                <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-100 font-bold text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold w-12">#</th>
                      <th className="px-4 py-3 text-left font-bold">Name</th>
                      <th className="px-4 py-3 text-left font-bold">Phone</th>
                      <th className="px-4 py-3 text-left font-bold">Designation</th>
                      <th className="px-4 py-3 text-left font-bold">Ticket</th>
                      <th className="px-4 py-3 text-left font-bold">Sector</th>
                      <th className="px-4 py-3 text-center font-bold">Share</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredStudents.map((stu, index) => (
                      <tr
                        key={stu._id}
                        className="border-t border-gray-300/40 hover:bg-blue-50 transition"
                      >
                        <td className="px-4 py-3 font-semibold text-gray-800">{index + 1}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">{stu.name}</td>
                        <td className="px-4 py-3 text-gray-700">{stu.phone}</td>
                        <td className="px-4 py-3 text-gray-700">{stu.designation}</td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-700">{stu.ticket}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {selectedSector}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => shareSingleToWhatsApp(stu)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
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
        </div>
      )}
    </div>
  );
}
