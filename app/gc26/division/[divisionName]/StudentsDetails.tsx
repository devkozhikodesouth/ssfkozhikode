"use client";

import { useEffect, useState } from "react";
import { Search, Share2, CheckCircle2, BarChart3 } from "lucide-react";
import { useAttendanceMode } from "@/app/utils/useAttendanceMode";

interface Sector {
  _id: string;
  name: string;
  count?: number;
}

interface Delegate {
  _id: string;
  name: string;
  phone: string;
  ticket: string;
  designation: string;
  divisionName: string;
  sectorName: string;
  attendance?: boolean;
}

export default function StudentsDetails({
  divisionName,
  lightMode = false,
}: {
  divisionName: string;
  lightMode?: boolean;
}) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string>("");
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [loadingDelegates, setLoadingDelegates] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [showAttendedOnly, setShowAttendedOnly] = useState(false);
  const [showSectorWiseSummary, setShowSectorWiseSummary] = useState(false);

  const { attendanceMode } = useAttendanceMode();

  // Fetch Sectors for Division
  useEffect(() => {
    if (!divisionName) return;

    const fetchSectors = async () => {
      setLoadingSectors(true);
      try {
        const res = await fetch(
          `/api/gc26/sector/${encodeURIComponent(divisionName)}`
        );
        const data = await res.json();

        if (res.ok && Array.isArray(data.sectors)) {
          setSectors(data.sectors);
          if (data.sectors.length > 0) {
            setSelectedSectorId(data.sectors[0]._id);
          }
        } else {
          setSectors([]);
        }
      } catch (err) {
        console.error("Error fetching sectors:", err);
      } finally {
        setLoadingSectors(false);
      }
    };

    fetchSectors();
  }, [divisionName]);

  // Fetch Sector Delegates
  useEffect(() => {
    if (!selectedSectorId) {
      setDelegates([]);
      return;
    }

    const fetchDelegates = async () => {
      setLoadingDelegates(true);
      setError("");
      try {
        const res = await fetch(
          `/api/gc26/sector/studentsdata/${encodeURIComponent(selectedSectorId)}`
        );
        const data = await res.json();

        if (res.ok && Array.isArray(data.students)) {
          setDelegates(data.students);
        } else {
          setError(data.error || "Failed to load sector delegates");
          setDelegates([]);
        }
      } catch (err) {
        console.error("Error fetching sector delegates:", err);
        setError("Error loading sector delegates");
      } finally {
        setLoadingDelegates(false);
      }
    };

    fetchDelegates();
  }, [selectedSectorId]);

  const filtered = delegates
    .filter((d) => (attendanceMode && showAttendedOnly ? d.attendance === true : true))
    .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const shareSingleToWhatsApp = (d: Delegate) => {
    const text = `*Grand Conclave 26 — SSF Kozhikode South*\n\n📌 *Delegate Details*\n👤 *Name:* ${d.name}\n🏷️ *Position:* ${d.designation || "Delegate"}\n\nThank you!`;

    const cleanMobile = d.phone ? d.phone.replace(/\D/g, "") : "";
    const phoneParam = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const url = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareFullListToWhatsApp = () => {
    if (filtered.length === 0) return;
    const currentSector = sectors.find((s) => s._id === selectedSectorId)?.name || "";
    const listItems = filtered
      .map((d, i) => `${i + 1}. *${d.name}* (${d.designation || "Delegate"})`)
      .join("\n");

    const text = `*Grand Conclave 26 — ${divisionName} / ${currentSector} Sector Delegates*\n📊 *Total Delegates:* ${filtered.length}\n\n${listItems}\n\n*SSF Kozhikode South*`;

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
      <div className="text-center mb-6">
        <h2
          className={
            lightMode
              ? "text-xl sm:text-2xl font-extrabold text-slate-900"
              : "text-2xl font-extrabold bg-gradient-to-r from-purple-300 to-indigo-200 bg-clip-text text-transparent"
          }
        >
          Grand Conclave 26 Sector Delegates
        </h2>
        <p className={lightMode ? "text-slate-500 text-xs sm:text-sm mt-1" : "text-slate-400 text-sm mt-1"}>
          Select a sector to view registered sector-level delegates
        </p>
      </div>

      {/* Sector Pills */}
      {loadingSectors ? (
        <p className="text-center py-4 text-purple-600 animate-pulse">Loading sectors...</p>
      ) : sectors.length === 0 ? (
        <p className="text-center py-4 text-slate-500">No sectors found for this division.</p>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {sectors.map((sec) => (
            <button
              key={sec._id}
              onClick={() => setSelectedSectorId(sec._id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                selectedSectorId === sec._id
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                  : lightMode
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-slate-800 text-purple-200 hover:bg-slate-700"
              }`}
            >
              {sec.name} {sec.count !== undefined ? `(${sec.count})` : ""}
            </button>
          ))}
        </div>
      )}

      {/* Sector Wise Summary & Action Button */}
      {!loadingSectors && sectors.length > 0 && (
        <div className="flex flex-col items-center mb-6">
          <button
            type="button"
            onClick={() => setShowSectorWiseSummary(!showSectorWiseSummary)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer border ${
              showSectorWiseSummary
                ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                : lightMode
                ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                : "bg-slate-800 text-purple-200 border-purple-500/30 hover:bg-slate-700"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{showSectorWiseSummary ? "Hide Sector-wise Count" : "Show Sector-wise Count"}</span>
          </button>
          
          {showSectorWiseSummary && (
            <div className={`w-full mt-4 p-4 rounded-2xl border transition-all animate-fadeIn ${
              lightMode
                ? "bg-slate-50 border-slate-200 text-slate-800"
                : "bg-slate-800/40 border-purple-500/20 text-white"
            }`}>
              <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${lightMode ? "text-slate-900" : "text-purple-200"}`}>
                <BarChart3 className="w-4 h-4 text-purple-500" />
                Sector Wise Registration Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {sectors.map((sec) => (
                  <div
                    key={sec._id}
                    className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                      lightMode
                        ? "bg-white border-slate-200 shadow-sm"
                        : "bg-slate-900/60 border-purple-500/10"
                    }`}
                  >
                    <span className="font-semibold text-xs truncate max-w-[100px] sm:max-w-none">{sec.name}</span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black shrink-0 ${
                      lightMode ? "bg-purple-100 text-purple-700" : "bg-purple-900/40 text-amber-300"
                    }`}>
                      {sec.count ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search & Delegate Count */}
      {selectedSectorId && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <Search className={`absolute left-3.5 top-3 w-4 h-4 ${lightMode ? "text-slate-400" : "text-purple-400"}`} />
            <input
              type="text"
              placeholder="Search delegate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={
                lightMode
                  ? "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                  : "w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-purple-500/30 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-purple-500"
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {attendanceMode && (
              <button
                type="button"
                onClick={() => setShowAttendedOnly(!showAttendedOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border cursor-pointer ${
                  showAttendedOnly
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : lightMode
                    ? "bg-slate-100 text-slate-700 border-slate-300"
                    : "bg-slate-800 text-purple-200 border-purple-500/30"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{showAttendedOnly ? "Showing Attended" : "Show Attended"}</span>
              </button>
            )}

            <div className={lightMode ? "text-sm font-semibold text-slate-700" : "text-sm font-semibold text-purple-200"}>
              Total: <span className={lightMode ? "text-purple-700 font-extrabold" : "text-amber-300 font-extrabold"}>{filtered.length}</span>
            </div>

            <button
              onClick={shareFullListToWhatsApp}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Full List</span>
            </button>
          </div>
        </div>
      )}

      {/* Delegates Table */}
      {loadingDelegates ? (
        <p className="text-center py-10 text-purple-600 animate-pulse">Loading sector delegates...</p>
      ) : error ? (
        <p className="text-center py-10 text-red-500">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-10 text-slate-500">No delegates registered in this sector.</p>
      ) : (
        <div className={lightMode ? "overflow-x-auto rounded-2xl border border-slate-200" : "overflow-x-auto rounded-2xl border border-purple-500/20"}>
          <table className="min-w-full divide-y text-sm">
            <thead className={lightMode ? "bg-slate-100 text-slate-700 font-bold border-b border-slate-200" : "bg-slate-800 text-purple-200"}>
              <tr>
                <th className="px-4 py-3 text-left font-bold w-12">#</th>
                <th className="px-4 py-3 text-left font-bold">Name</th>
                <th className="px-4 py-3 text-left font-bold">Phone</th>
                <th className="px-4 py-3 text-left font-bold">Designation</th>
                <th className="px-4 py-3 text-left font-bold">Ticket</th>
                <th className="px-4 py-3 text-left font-bold">Sector</th>
                {attendanceMode && (
                  <th className="px-4 py-3 text-center font-bold">Attendance</th>
                )}
                <th className="px-4 py-3 text-center font-bold">Share</th>
              </tr>
            </thead>
            <tbody className={lightMode ? "divide-y divide-slate-100 bg-white" : "divide-y divide-purple-500/10 bg-slate-900/50"}>
              {filtered.map((d, i) => (
                <tr key={d._id} className={lightMode ? "hover:bg-purple-50/50 transition text-slate-800" : "hover:bg-purple-900/20 transition text-white"}>
                  <td className={lightMode ? "px-4 py-3 font-semibold text-slate-500" : "px-4 py-3 font-semibold text-slate-400"}>{i + 1}</td>
                  <td className={lightMode ? "px-4 py-3 font-bold text-slate-900" : "px-4 py-3 font-semibold text-white"}>{d.name}</td>
                  <td className={lightMode ? "px-4 py-3 text-slate-600 font-medium" : "px-4 py-3 text-slate-300"}>{d.phone}</td>
                  <td className={lightMode ? "px-4 py-3 text-purple-700 font-semibold" : "px-4 py-3 text-purple-200"}>{d.designation}</td>
                  <td className={lightMode ? "px-4 py-3 font-mono text-purple-800 font-bold" : "px-4 py-3 font-mono text-amber-300 font-bold"}>{d.ticket}</td>
                  <td className={lightMode ? "px-4 py-3 text-slate-600 font-medium" : "px-4 py-3 text-slate-300"}>{d.sectorName}</td>
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
