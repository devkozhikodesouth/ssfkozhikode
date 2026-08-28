"use client";

import { useEffect, useState } from "react";
import { Search, Share2, CheckCircle2 } from "lucide-react";
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
  lightMode = false,
}: {
  divisionName: string;
  lightMode?: boolean;
}) {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showAttendedOnly, setShowAttendedOnly] = useState(false);

  const { attendanceMode } = useAttendanceMode();

  useEffect(() => {
    if (!divisionName) return;

    const fetchDelegates = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/gc26/divdelegates/${encodeURIComponent(divisionName)}`
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

  const filtered = delegates
    .filter((d) => (attendanceMode && showAttendedOnly ? d.attendance === true : true))
    .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  const shareSingleToWhatsApp = (d: Delegate) => {
    let text = `*Grand Conclave 26 — SSF Kozhikode South*\n\n📌 *Delegate Details*\n👤 *Name:* ${d.name}\n📱 *Mobile:* ${d.mobile}\n🏷️ *Designation:* ${d.designation || "N/A"}\n🎫 *Ticket:* ${d.ticket || "N/A"}\n📍 *Division:* ${divisionName}`;
    if (attendanceMode) {
      text += `\n✅ *Attendance:* ${d.attendance ? "Present" : "Not Marked"}`;
    }
    text += `\n\nThank you!`;

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
      .map((d, i) => {
        let line = `${i + 1}. *${d.name}* (${d.designation || "Delegate"})\n   📱 ${d.mobile} | 🎫 ${d.ticket || "N/A"}`;
        if (attendanceMode) {
          line += ` | ${d.attendance ? "✅ Present" : "❌ Not Marked"}`;
        }
        return line;
      })
      .join("\n\n");

    let text = `*Grand Conclave 26 — ${divisionName} Division Delegates*\n📊 *Total Delegates:* ${filtered.length}`;
    if (attendanceMode) {
      const attendedCount = filtered.filter((d) => d.attendance).length;
      text += `\n✅ *Total Attended:* ${attendedCount}`;
    }
    text += `\n\n${listItems}\n\n*SSF Kozhikode South*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className={
        lightMode
          ? "bg-white shadow-md rounded-2xl p-4 sm:p-6 border border-slate-200 text-slate-800"
          : "bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-3xl p-6 md:p-8 border border-purple-500/20 text-white"
      }
    >
      {/* Header */}
      <div
        className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-4 ${
          lightMode ? "border-slate-200" : "border-purple-500/20"
        }`}
      >
        <div>
          <h2
            className={
              lightMode
                ? "text-xl sm:text-2xl font-extrabold text-slate-900"
                : "text-2xl font-extrabold bg-gradient-to-r from-purple-300 to-indigo-200 bg-clip-text text-transparent"
            }
          >
            {divisionName} Division
          </h2>
          <p className={lightMode ? "text-slate-500 text-xs sm:text-sm mt-0.5" : "text-slate-400 text-sm mt-0.5"}>
            Registered Division Delegates — Grand Conclave 26
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={
              lightMode
                ? "text-left md:text-right bg-purple-50 px-4 py-2 rounded-2xl border border-purple-200"
                : "text-left md:text-right bg-purple-900/30 px-4 py-2 rounded-2xl border border-purple-500/30"
            }
          >
            <p
              className={
                lightMode
                  ? "text-xs text-purple-700 uppercase tracking-wider font-bold"
                  : "text-xs text-purple-200/70 uppercase tracking-wider font-semibold"
              }
            >
              Total Delegates
            </p>
            <p
              className={
                lightMode ? "text-2xl font-black text-purple-700" : "text-2xl font-extrabold text-amber-300"
              }
            >
              {filtered.length}
            </p>
          </div>

          <button
            onClick={shareFullListToWhatsApp}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Full List</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/2">
          <Search
            className={`absolute left-4 top-3.5 w-4 h-4 ${
              lightMode ? "text-slate-400" : "text-purple-400"
            }`}
          />
          <input
            type="text"
            placeholder="Search delegate by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={
              lightMode
                ? "w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"
                : "w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-purple-500/30 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"
            }
          />
        </div>

        {attendanceMode && (
          <button
            type="button"
            onClick={() => setShowAttendedOnly(!showAttendedOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              showAttendedOnly
                ? "bg-emerald-600 text-white border-emerald-600 shadow"
                : lightMode
                ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                : "bg-slate-800 text-purple-200 border-purple-500/30 hover:bg-slate-700"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{showAttendedOnly ? "Showing Attended Only" : "Show Attended Only"}</span>
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-center py-12 text-purple-600 animate-pulse font-medium">
          Loading delegates...
        </p>
      ) : error ? (
        <p className="text-center py-12 text-red-500 font-medium">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-slate-500 font-medium">
          No delegates found.
        </p>
      ) : (
        <div
          className={
            lightMode
              ? "overflow-x-auto rounded-2xl border border-slate-200"
              : "overflow-x-auto rounded-2xl border border-purple-500/20"
          }
        >
          <table className="min-w-full divide-y text-sm">
            <thead
              className={
                lightMode
                  ? "bg-slate-100 text-slate-700 font-bold border-b border-slate-200"
                  : "bg-slate-800/90 text-purple-200"
              }
            >
              <tr>
                <th className="px-4 py-3.5 text-left font-bold w-12">#</th>
                <th className="px-4 py-3.5 text-left font-bold">Name</th>
                <th className="px-4 py-3.5 text-left font-bold">Mobile</th>
                <th className="px-4 py-3.5 text-left font-bold">Designation</th>
                <th className="px-4 py-3.5 text-left font-bold">Ticket</th>
                <th className="px-4 py-3.5 text-left font-bold">Division</th>
                {attendanceMode && (
                  <th className="px-4 py-3.5 text-center font-bold">Attendance</th>
                )}
                <th className="px-4 py-3.5 text-center font-bold">Share</th>
              </tr>
            </thead>

            <tbody
              className={
                lightMode
                  ? "divide-y divide-slate-100 bg-white"
                  : "divide-y divide-purple-500/10 bg-slate-900/50"
              }
            >
              {filtered.map((d, index) => (
                <tr
                  key={d._id}
                  className={
                    lightMode
                      ? "hover:bg-purple-50/50 transition text-slate-800"
                      : "hover:bg-purple-900/20 transition text-white"
                  }
                >
                  <td
                    className={
                      lightMode
                        ? "px-4 py-3.5 font-semibold text-slate-500"
                        : "px-4 py-3.5 font-semibold text-slate-400"
                    }
                  >
                    {index + 1}
                  </td>
                  <td
                    className={
                      lightMode
                        ? "px-4 py-3.5 font-bold text-slate-900"
                        : "px-4 py-3.5 font-semibold text-white"
                    }
                  >
                    {d.name}
                  </td>
                  <td className={lightMode ? "px-4 py-3.5 text-slate-600 font-medium" : "px-4 py-3.5 text-slate-300"}>
                    {d.mobile}
                  </td>
                  <td className={lightMode ? "px-4 py-3.5 text-purple-700 font-semibold" : "px-4 py-3.5 text-purple-200"}>
                    {d.designation}
                  </td>
                  <td className={lightMode ? "px-4 py-3.5 font-mono text-purple-800 font-bold" : "px-4 py-3.5 font-mono text-amber-300 font-bold"}>
                    {d.ticket}
                  </td>
                  <td className={lightMode ? "px-4 py-3.5 text-slate-600 font-medium" : "px-4 py-3.5 text-slate-300"}>
                    {divisionName}
                  </td>
                  {attendanceMode && (
                    <td className="px-4 py-3.5 text-center font-bold">
                      {d.attendance ? (
                        <span className="text-emerald-600">Present</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => shareSingleToWhatsApp(d)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
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
