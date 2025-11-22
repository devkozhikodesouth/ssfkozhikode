"use client";
import React, { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Page() {
  const [showScanner, setShowScanner] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const showToast = (type: string, message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 3000);
  };

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );
    scanner.render(onScanSuccess, onScanError);
  };
const onScanSuccess = async (decodedText: string) => {
  setScannedCode(decodedText);
  setShowScanner(false);
  setLoading(true);
  setStudent(null);

  // Validate QR format example: KS001, KS123 etc.
  const isValidFormat = /^KS\d{2,}$/i.test(decodedText);

  if (!isValidFormat) {
    showToast("error", "Invalid QR Code");
    setLoading(false);
    return;
  }

  try {
    const res = await fetch(`/api/admin/attendance?code=${decodedText}`);
    const data = await res.json();

    if (!data?.success) {
      showToast("error", data?.message || "Student not found");
    } else {
      setStudent(data.data);

      if (data?.already) {
        showToast("warning", "Attendance already marked!");
      } else {
        showToast("success", "Student found!");
      }
    }
  } catch (err) {
    showToast("error", "Server error fetching student");
  }

  setLoading(false);
};


  const onScanError = (err: any) => {};

  const confirmAttendance = async () => {
    const res = await fetch(`/api/admin/attendance`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: student._id }),
    });

    const data = await res.json();
    showToast("success", "Attendance recorded successfully");

    setStudent(null);
    setScannedCode("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center  justify-center bg-gray-100">

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

      <h1 className="text-3xl font-bold text-blue-700">Attendance Scanner</h1>
      <p className="text-gray-600 mt-1 mb-4">Scan QR to verify identity</p>

      <button
        onClick={() => {
          setShowScanner(true);
          setTimeout(startScanner, 500);
        }}
        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg"
      >
        Start QR Scan
      </button>

      {/* Scanner popup */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[350px] text-center">
            <h2 className="text-lg font-semibold mb-3">Scan QR Code</h2>
            <div id="reader" style={{ width: "300px" }} />
            <button
              onClick={() => setShowScanner(false)}
              className="mt-4 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Student card */}
      {student && (
        <div className="mt-6 bg-white shadow-lg rounded-xl p-5 w-[350px] border text-center">

          <h3 className="text-xl font-bold mb-2 text-green-700">
            {student.attendance ? "Attendance Already Marked" : "Confirm Attendance"}
          </h3>

          <p className="text-gray-700"><b>Name:</b> {student.name}</p>
          <p className="text-gray-700"><b>Mobile:</b> {student.mobile}</p>
          <p className="text-gray-700"><b>School:</b> {student.school}</p>
          <p className="text-gray-700"><b>Ticket:</b> <span className="text-blue-600">{student.ticket}</span></p>

          {!student.attendance && (
            <button
              onClick={confirmAttendance}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
            >
              Confirm Attendance
            </button>
          )}

          {student.attendance && (
            <button
              className="mt-4 w-full bg-gray-500 text-white py-2 rounded-md cursor-not-allowed"
            >
              Already Marked
            </button>
          )}

          <button
            onClick={() => { setStudent(null); setScannedCode(""); }}
            className="mt-2 w-full bg-gray-300 hover:bg-gray-400 text-black py-2 rounded-md transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
