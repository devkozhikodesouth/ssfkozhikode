"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Student {
  _id: string;
  name: string;
  phone: string;
  unitName: string;
  email?: string;
  school?: string;
}

export default function PDFExportPage() {
  const searchParams = useSearchParams();
  const sectorId = searchParams.get("sectorId");
  const sectorName = searchParams.get("sector");

  const [students, setStudents] = useState<Student[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectorId) return;

    const fetchStudents = async () => {
      const res = await fetch(`/api/gala/sector/studentsdata/${sectorId}`);
      const data = await res.json();
      setStudents(data.students ?? []);
    };

    fetchStudents();
  }, [sectorId]);

  const exportPDF = async () => {
    if (!tableRef.current) return;

    const canvas = await html2canvas(tableRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${sectorName}-students.pdf`);
  };

  return (
    <div style={{ width: "100%", padding: "20px", marginTop: "50px" }}>
      <button
        onClick={exportPDF}
        style={{
          backgroundColor: "#0f8b3d",
          padding: "10px 22px",
          color: "white",
          borderRadius: "8px",
          marginBottom: "20px",
          display: "block",
          marginLeft: "auto",
        }}
      >
        Download PDF
      </button>

      <div
        ref={tableRef}
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          border: "1px solid #d1d1d1",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header */}
        <h1
          style={{
            textAlign: "center",
            fontSize: "32px",
            fontWeight: 800,
            marginBottom: "6px",
            color: "#111",
            textTransform: "capitalize",
          }}
        >
          {sectorName}
        </h1>

        <h3
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: 700,
            marginTop: "4px",
            marginBottom: "16px",
            color: "#444",
          }}
        >
          Registered Students List
        </h3>

        <p
          style={{
            textAlign: "center",
            fontSize: "18px",
            marginBottom: "20px",
            fontWeight: 700,
          }}
        >
          Total Students: <span style={{ color: "#0f6ad1" }}>{students.length}</span>
        </p>

        {/* Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "16px",
            textAlign: "left",
            border: "1px solid #ccc",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0", fontWeight: 700 }}>
              <th style={{ padding: "12px", border: "1px solid #ccc" }}>#</th>
              <th style={{ padding: "12px", border: "1px solid #ccc" }}>Name</th>
              <th style={{ padding: "12px", border: "1px solid #ccc" }}>Phone</th>
              <th style={{ padding: "12px", border: "1px solid #ccc" }}>Unit</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s, i) => (
              <tr key={s._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{i + 1}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{s.name}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{s.phone}</td>
                <td style={{ padding: "10px", border: "1px solid #ccc" }}>{s.unitName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
