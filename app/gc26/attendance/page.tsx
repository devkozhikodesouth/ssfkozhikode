"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Share2, Search, QrCode } from "lucide-react";

function AttendanceScannerContent() {
  const searchParams = useSearchParams();

  const [showScanner, setShowScanner] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const showToast = (type: string, message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 3000);
  };

  const fetchDelegate = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      showToast("error", "Please enter a ticket code or mobile number");
      return;
    }

    setLoading(true);
    setStudent(null);

    try {
      const res = await fetch(
        `/api/gc26/attendance?query=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();

      if (!data?.success) {
        showToast("error", data?.message || "Delegate not found");
      } else {
        setStudent(data.data);

        if (data?.already) showToast("warning", "Attendance already marked!");
        else showToast("success", "Delegate found!");
      }
    } catch (err) {
      showToast("error", "Server error fetching delegate");
    }

    setLoading(false);
  };

  // Auto-search if URL query param exists
  useEffect(() => {
    const query =
      searchParams.get("code") ||
      searchParams.get("ticket") ||
      searchParams.get("mobile") ||
      searchParams.get("query");

    if (query) {
      setInputCode(query);
      fetchDelegate(query);
    }
  }, [searchParams]);

  const shareToWhatsApp = () => {
    if (!student) return;
    const divName = student?.divisionId?.divisionName || "";
    const secName = student?.sectorId?.sectorName || "";
    const text = `*Grand Conclave 26 — SSF Kozhikode South*\n\n📌 *Delegate Attendance Details*\n👤 *Name:* ${student.name}\n📱 *Mobile:* ${student.mobile}\n🏷️ *Designation:* ${student.designation || "N/A"}\n🎫 *Ticket Code:* ${student.ticket || "N/A"}\n📍 *Division / Sector:* ${divName}${secName ? ` / ${secName}` : ""}\n✅ *Status:* ${student.attendance ? "Present" : "Marked"}\n\nThank you!`;
    const cleanMobile = student.mobile ? student.mobile.replace(/\D/g, "") : "";
    const phoneParam =
      cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const url = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const onScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    if (!decodedText) return;

    let extracted = decodedText.trim();
    if (extracted.startsWith("http://") || extracted.startsWith("https://")) {
      try {
        const url = new URL(extracted);
        const codeParam =
          url.searchParams.get("code") ||
          url.searchParams.get("ticket") ||
          url.searchParams.get("mobile");
        if (codeParam) extracted = codeParam;
      } catch (e) {}
    }

    const isValidFormat =
      /^(GC26|GG|GC)\d{2,}$/i.test(extracted) || /^\d{10}$/.test(extracted);
    if (!isValidFormat) {
      showToast("error", "Invalid Grand Conclave 26 QR Code");
      return;
    }

    setInputCode(extracted);
    fetchDelegate(extracted);
  };

  const confirmAttendance = async () => {
    if (!student?._id) return;
    try {
      const res = await fetch(`/api/gc26/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: student._id }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "Attendance recorded successfully");
        setStudent({ ...student, attendance: true });
      } else {
        showToast("error", data.message || "Failed to record attendance");
      }
    } catch (err) {
      showToast("error", "Error marking attendance");
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDelegate(inputCode);
  };

  return (
    <div className="flex flex-col items-center py-8 px-4 space-y-4 max-w-xl mx-auto">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-5 px-5 py-3 z-50 rounded-lg text-white shadow-lg transition font-medium ${
            toast.type === "success" && "bg-green-600"
          } ${toast.type === "error" && "bg-red-600"} ${
            toast.type === "warning" && "bg-amber-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-purple-700">
          SSF Kozhikode South
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-800 mt-1">
          Grand Conclave 26 Attendance Scanner
        </h1>
        <p className="text-gray-600 mt-1">
          Scan GC26 Ticket QR code or enter ticket/mobile to record attendance
        </p>
      </div>

      {/* Action Buttons: QR Scan & Manual Lookup */}
      <div className="w-full max-w-[380px] space-y-3 pt-2">
        <button
          onClick={() => setShowScanner(true)}
          className="w-full py-3.5 bg-purple-700 hover:bg-purple-800 transition text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <QrCode className="w-5 h-5" />
          <span>Start QR Scan</span>
        </button>

        <form onSubmit={handleManualSearch} className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Ticket No. (e.g. GC26001) or Mobile"
            className="flex-1 bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-purple-900 hover:bg-purple-950 text-white font-semibold text-sm rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Find</span>
          </button>
        </form>
      </div>

      {/* Scanner Popup */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-5 relative">
            <button
              onClick={() => setShowScanner(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-black font-bold cursor-pointer text-lg"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-center mb-4 flex items-center justify-center gap-2 text-gray-900">
              <span>📷</span> Scan GC26 Ticket
            </h2>

            <div className="relative flex justify-center items-center">
              <div className="relative w-full aspect-square max-w-[350px] rounded-xl overflow-hidden border-2 border-dashed border-purple-400 bg-black">
                <Scanner
                  onScan={(codes) => {
                    if (codes && codes[0]?.rawValue) {
                      onScanSuccess(codes[0].rawValue);
                    }
                  }}
                  onError={() => {}}
                  constraints={{ facingMode: "environment" }}
                  styles={{
                    container: { width: "100%", height: "100%" },
                    video: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    },
                  }}
                />

                <div className="absolute bottom-4 w-full text-center pointer-events-none">
                  <span className="px-3 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur">
                    Align GC26 QR code within frame
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowScanner(false)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium cursor-pointer transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delegate Card */}
      {student && (
        <div className="mt-6 w-full max-w-[380px] rounded-2xl shadow-2xl bg-white border border-purple-200 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-purple-700 text-white py-4 px-5 text-center">
            <h3 className="text-lg font-bold">
              {student.attendance
                ? "Attendance Already Marked"
                : "Confirm Attendance"}
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
              <span className="font-semibold text-gray-900">
                {student?.designation || "N/A"}
              </span>
            </div>

            {!student.divisionId && (
              <div className="flex justify-center">
                <span className="font-semibold text-purple-600">
                  District Delegate
                </span>
              </div>
            )}

            {student.divisionId && (
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Division</span>
                <span className="font-semibold text-gray-900">
                  {student?.divisionId?.divisionName}
                </span>
              </div>
            )}

            {student.sectorId && (
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Sector</span>
                <span className="font-semibold text-gray-900">
                  {student?.sectorId?.sectorName}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Ticket No.</span>
              <span className="font-bold text-purple-700 font-mono">
                {student.ticket || "N/A"}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 space-y-3">
            {!student.attendance && (
              <button
                onClick={confirmAttendance}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md cursor-pointer"
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
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </button>

            <button
              onClick={() => setStudent(null)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicGC26AttendancePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <AttendanceScannerContent />
      </Suspense>
    </div>
  );
}
