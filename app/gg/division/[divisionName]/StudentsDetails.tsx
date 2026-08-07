"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface Sector {
  _id: string;
  name: string;
}

interface Delegate {
  _id: string;
  name: string;
  phone: string;
  ticket: string;
  designation: string;
  divisionName: string;
  sectorName: string;
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

  // Fetch Sectors for Division
  useEffect(() => {
    if (!divisionName) return;

    const fetchSectors = async () => {
      setLoadingSectors(true);
      try {
        const res = await fetch(
          `/api/gg/sector/${encodeURIComponent(divisionName)}`
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
          `/api/gg/sector/studentsdata/${encodeURIComponent(selectedSectorId)}`
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

  const filtered = delegates.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          Grand Gathering Sector Delegates
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
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                selectedSectorId === sec._id
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                  : lightMode
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "bg-slate-800 text-purple-200 hover:bg-slate-700"
              }`}
            >
              {sec.name}
            </button>
          ))}
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
          <div className={lightMode ? "text-sm font-semibold text-slate-700" : "text-sm font-semibold text-purple-200"}>
            Total Delegates: <span className={lightMode ? "text-purple-700 font-extrabold" : "text-amber-300 font-extrabold"}>{filtered.length}</span>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
