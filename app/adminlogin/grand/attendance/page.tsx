"use client";

import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Share2 } from "lucide-react";

export default function Page() {
  const [showScanner, setShowScanner] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const showToast = (type: string, message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 3000);
  };

  const shareToWhatsApp = () => {
    if (!student) return;
    const divName = student?.divisionId?.divisionName || "";
    const secName = student?.sectorId?.sectorName || "";
    const text = `*Grand Conclave — SSF Kozhikode South*\n\n📌 *Delegate Attendance Details*\n👤 *Name:* ${student.name}\n📱 *Mobile:* ${student.mobile}\n🏷️ *Designation:* ${student.designation || "N/A"}\n🎫 *Ticket Code:* ${student.ticket || "N/A"}\n📍 *Division / Sector:* ${divName}${secName ? ` / ${secName}` : ""}\n✅ *Status:* ${student.attendance ? "Present" : "Marked"}\n\nThank you!`;
    const cleanMobile = student.mobile ? student.mobile.replace(/\D/g, "") : "";
    const phoneParam = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const url = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const onScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    setLoading(true);
    setStudent(null);

    const isValidFormat = /^GC\d{2,}$/i.test(decodedText);
    if (!isValidFormat) {
      showToast("error", "Invalid QR Code");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/grand/attendance?code=${decodedText}`);
      const data = await res.json();

      if (!data?.success) {
        showToast("error", data?.message || "Student not found");
      } else {
        setStudent(data.data);

        if (data?.already) showToast("warning", "Attendance already marked!");
        else showToast("success", "Student found!");
      }
    } catch (err) {
      showToast("error", "Server error fetching student");
    }

    setLoading(false);
  };

  const confirmAttendance = async () => {
    const res = await fetch(`/api/admin/grand/attendance`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: student._id }),
    });

    const data = await res.json();
    showToast("success", "Attendance recorded successfully");
    setStudent({ ...student, attendance: true });
  };

  return (
    <div className="flex flex-col items-center py-4 space-y-4">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-5 px-5 py-3 z-50 rounded-lg text-white shadow-lg transition
          ${toast.type === "success" && "bg-green-600"}
          ${toast.type === "error" && "bg-red-600"}
          ${toast.type === "warning" && "bg-yellow-600"}`}
        >
          {toast.message}
        </div>
      )}

      <h1 className="text-3xl font-bold text-blue-700">Grand Conclave Attendance Scanner</h1>
      <p className="text-gray-600 mt-1 mb-4">Scan QR to verify identity</p>

      <button
        onClick={() => setShowScanner(true)}
        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg font-semibold shadow-md"
      >
        Start QR Scan
      </button>

      {/* Scanner Popup */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-5 relative">
            <button
              onClick={() => setShowScanner(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-black font-bold"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-center mb-4 flex items-center justify-center gap-2">
              <span className="text-xl">📷</span> Scan GC Ticket
            </h2>

            <div className="relative flex justify-center items-center">
              <div className="relative w-[350px] h-[350px] rounded-xl overflow-hidden border-2 border-dashed border-blue-400">
                <Scanner
                  onScan={(codes) => onScanSuccess(codes[0]?.rawValue)}
                  onError={() => {}}
                  constraints={{ facingMode: "environment" }}
                  styles={{
                    container: { width: "100%", height: "100%" },
                    video: { width: "100%", height: "100%", objectFit: "cover" },
                  }}
                />

                <div className="absolute bottom-4 w-full text-center">
                  <span className="px-3 py-1 bg-black/60 text-white text-xs rounded-md">
                    Align QR code within frame
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-green-600 font-medium text-sm flex items-center justify-center gap-2">
                <span className="block w-2 h-2 bg-green-500 rounded-full"></span>
                Ready to scan
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowScanner(false)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Card */}
      {student && (
        <div className="mt-8 w-[380px] rounded-2xl shadow-xl bg-white border border-gray-200 overflow-hidden animate-fadeIn">
          <div className="bg-blue-600 text-white py-4 px-5 text-center">
            <h3 className="text-lg font-semibold">
              {student.attendance ? "Attendance Already Marked" : "Confirm Attendance"}
            </h3>
          </div>

          <div className="px-6 py-5 space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Name</span>
              <span className="font-semibold text-gray-900">{student.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Mobile</span>
              <span className="font-semibold text-gray-900">{student.mobile}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Designation</span>
              <span className="font-semibold text-gray-900">{student?.designation}</span>
            </div>

            {!student.divisionId && (
              <div className="flex justify-center ">
                <span className="font-semibold text-blue-600">District Delegate</span>
              </div>
            )}

            {student.divisionId && (
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Division</span>
                <span className="font-semibold text-gray-900">{student?.divisionId?.divisionName}</span>
              </div>
            )}

            {student.sectorId && (
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Sector</span>
                <span className="font-semibold text-gray-900">{student?.sectorId?.sectorName}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Ticket No.</span>
              <span className="font-bold text-blue-600">{student.ticket}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 space-y-3">
            {!student.attendance && (
              <button
                onClick={confirmAttendance}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
              >
                ✓ Confirm Attendance
              </button>
            )}

            {student.attendance && (
              <button
                disabled
                className="w-full py-3 bg-gray-400 text-white font-semibold rounded-xl cursor-not-allowed"
              >
                Already Marked
              </button>
            )}

            <button
              onClick={shareToWhatsApp}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </button>

            <button
              onClick={() => setStudent(null)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
