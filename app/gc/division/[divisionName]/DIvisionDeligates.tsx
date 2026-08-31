"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { useAttendanceMode } from "@/app/utils/useAttendanceMode";

interface Delegate {
  _id: string;
  name: string;
  mobile: string;
  designation: string;
  ticket: string;
  attendance: boolean;
}

export default function DivisionDelegatesTable({
  divisionName,
}: {
  divisionName: string;
}) {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const { attendanceMode } = useAttendanceMode();

  useEffect(() => {
    if (!divisionName) return;

    const fetchDelegates = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/gc/divdelegates/${encodeURIComponent(divisionName)}`
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to fetch delegates");
          setDelegates([]);
        } else {
          setDelegates(data.delegates || []);
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDelegates();
  }, [divisionName]);

  const shareSingleToWhatsApp = (d: Delegate) => {
    const text = `*Grand Conclave — SSF Kozhikode South*\n\n📌 *Delegate Details*\n👤 *Name:* ${d.name}\n🏷️ *Position:* ${d.designation || "Delegate"}\n\nThank you!`;

    const cleanMobile = d.mobile ? d.mobile.replace(/\D/g, "") : "";
    const phoneParam = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const url = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareFullListToWhatsApp = () => {
    if (filtered.length === 0) return;
    const listItems = filtered
      .map((d, i) => `${i + 1}. *${d.name}* (${d.designation || "Delegate"})`)
      .join("\n");

    const text = `*Grand Conclave — ${divisionName} Division Delegates*\n📊 *Total Delegates:* ${filtered.length}\n\n${listItems}\n\n*SSF Kozhikode South*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const filtered = delegates.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-blue-700">
            {divisionName}
          </h2>
          <p className="text-gray-600 font-medium">
            Registered Division Delegates — Grand Conclave
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center md:text-right bg-blue-50 px-4 py-2 rounded-2xl border border-blue-200">
            <p className="text-xs text-blue-700 font-bold uppercase tracking-wider">Total Delegates</p>
            <p className="text-2xl font-black text-blue-700">
              {filtered.length}
            </p>
          </div>

          <button
            onClick={shareFullListToWhatsApp}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Full List</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
      />

      {/* Content */}
      {loading ? (
        <p className="text-center py-10 text-gray-600 animate-pulse font-medium">
          Loading delegates...
        </p>
      ) : error ? (
        <p className="text-center py-10 text-red-600 font-medium">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-10 text-gray-500 font-medium">
          No delegates found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 text-left font-bold w-12">#</th>
                <th className="px-4 py-3 text-left font-bold">Name</th>
                <th className="px-4 py-3 text-left font-bold">Mobile</th>
                <th className="px-4 py-3 text-left font-bold">Designation</th>
                <th className="px-4 py-3 text-left font-bold">Ticket</th>
                <th className="px-4 py-3 text-left font-bold">Division</th>
                {attendanceMode && (
                  <th className="px-4 py-3 text-center font-bold">Attendance</th>
                )}
                <th className="px-4 py-3 text-center font-bold">Share</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((d, index) => (
                <tr
                  key={d._id}
                  className="hover:bg-blue-50/60 transition text-gray-800"
                >
                  <td className="px-4 py-3 font-semibold text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    {d.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{d.mobile}</td>
                  <td className="px-4 py-3 text-blue-700 font-semibold">
                    {d.designation}
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-700 font-bold">
                    {d.ticket}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {divisionName}
                  </td>
                  {attendanceMode && (
                    <td className="px-4 py-3 text-center font-bold">
                      {d.attendance ? (
                        <span className="text-emerald-600">Present</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => shareSingleToWhatsApp(d)}
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
  );
}
