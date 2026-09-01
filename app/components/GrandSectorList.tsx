"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, Share2, CheckCircle2 } from "lucide-react";

interface Registration {
  name: string;
  mobile: string;
  designation: string;
  organizationLevel: string;
  attendance: boolean;
  ticket?: string;
}

interface Sector {
  sectorName: string;
  registrations: Registration[];
}

interface DivisionData {
  divisionName: string;
  totalStudents: number;
  sectors: Sector[];
}

interface ApiError {
  error: string;
}

export default function GrandSectorList({
  divisionName,
}: {
  divisionName: string;
}) {
  const [data, setData] = useState<DivisionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAttendedOnly, setShowAttendedOnly] = useState(false);
  const [includeAttendanceInShare, setIncludeAttendanceInShare] = useState(false);

  useEffect(() => {
    if (!divisionName) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/admin/grand/sectorwise/${encodeURIComponent(divisionName)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }
        );

        const result = await res.json();

        if (!res.ok) {
          setError(
            (result as ApiError)?.error ||
              `HTTP error! status: ${res.status}`
          );
          setData(null);
          return;
        }

        setData(result as DivisionData);
        setError(null);
      } catch (err) {
        console.error("Error fetching division data:", err);
        setError("Failed to fetch division data. Please try again later.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [divisionName]);

  const shareSingleToWhatsApp = (user: Registration, sectorName: string) => {
    let text = `*Grand Conclave — SSF Kozhikode South*\n\n📌 *Delegate Details*\n👤 *Name:* ${user.name}\n📱 *Mobile:* ${user.mobile}\n🏷️ *Designation:* ${user.designation || "N/A"}\n🎫 *Ticket:* ${user.ticket || "N/A"}\n📍 *Division / Sector:* ${divisionName} / ${sectorName}`;
    if (includeAttendanceInShare) {
      text += `\n✅ *Attendance:* ${user.attendance ? "Present" : "Not Marked"}`;
    }
    text += `\n\nThank you!`;

    const cleanMobile = user.mobile ? user.mobile.replace(/\D/g, "") : "";
    const phoneParam = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const url = phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareFullDivisionListToWhatsApp = () => {
    if (!data || data.sectors.length === 0) return;

    const sortedSectors = [...data.sectors].sort(
      (a, b) => b.registrations.length - a.registrations.length
    );

    const textBlocks = sortedSectors.map((sec) => {
      const regs = showAttendedOnly
        ? sec.registrations.filter((r) => r.attendance)
        : sec.registrations;

      const delegatesList = regs.length > 0
        ? regs
            .map((r, i) => {
              let line = `   ${i + 1}. *${r.name}* (${r.designation || "Delegate"})\n      📱 ${r.mobile} | 🎫 ${r.ticket || "N/A"}`;
              if (includeAttendanceInShare) {
                line += ` | ${r.attendance ? "✅ Present" : "❌ Not Marked"}`;
              }
              return line;
            })
            .join("\n")
        : "   _No registrations_";

      return `📍 *${sec.sectorName} Sector* (Reg: ${regs.length})\n${delegatesList}`;
    });

    let text = `*Grand Conclave — ${data.divisionName} Division Sector Data*\n📊 *Total Delegates:* ${data.totalStudents}`;
    if (includeAttendanceInShare) {
      const totalAtt = data.sectors.reduce(
        (sum, sec) => sum + sec.registrations.filter((r) => r.attendance).length,
        0
      );
      text += `\n✅ *Total Attended:* ${totalAtt}`;
    }
    text += `\n\n${textBlocks.join("\n\n")}\n\n*SSF Kozhikode South*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareSectorListToWhatsApp = (sectorName: string, registrations: Registration[]) => {
    const regs = showAttendedOnly
      ? registrations.filter((r) => r.attendance)
      : registrations;

    if (regs.length === 0) return;

    const listItems = regs
      .map((r, i) => {
        let line = `${i + 1}. *${r.name}* (${r.designation || "Delegate"})\n   📱 ${r.mobile} | 🎫 ${r.ticket || "N/A"}`;
        if (includeAttendanceInShare) {
          line += ` | ${r.attendance ? "✅ Present" : "❌ Not Marked"}`;
        }
        return line;
      })
      .join("\n\n");

    let text = `*Grand Conclave — ${divisionName} / ${sectorName} Sector Delegates*\n📊 *Total Delegates:* ${regs.length}`;
    if (includeAttendanceInShare) {
      const att = regs.filter((r) => r.attendance).length;
      text += `\n✅ *Total Attended:* ${att}`;
    }
    text += `\n\n${listItems}\n\n*SSF Kozhikode South*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (loading)
    return (
      <p className="text-center py-10 text-gray-500">
        Loading division data...
      </p>
    );

  if (error)
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (!data)
    return (
      <p className="text-center py-10 text-red-500">
        No data found.
      </p>
    );

  const handleSort = () => {
    const sorted = [...data.sectors].sort((a, b) =>
      sortOrder === "asc"
        ? a.registrations.length - b.registrations.length
        : b.registrations.length - a.registrations.length
    );

    setData({ ...data, sectors: sorted });
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-200 mt-10 transition-all">
      <div className="text-center mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Grand Conclave
        </h1>

        <p className="text-gray-600 font-semibold text-lg mb-2">
          Sector Wise Registration & Attendance
        </p>

        <h2 className="text-4xl font-extrabold text-blue-700 mt-4">
          {data.divisionName}
        </h2>

        <p className="text-gray-700 mt-3 text-lg">
          Total Delegates:{" "}
          <span className="font-bold text-blue-600">
            {data.totalStudents}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAttendedOnly(!showAttendedOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              showAttendedOnly
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{showAttendedOnly ? "Showing Attended Only" : "Show Attended Only"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIncludeAttendanceInShare(!includeAttendanceInShare)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              includeAttendanceInShare
                ? "bg-emerald-600 text-white border-emerald-600 shadow"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
          >
            <span>{includeAttendanceInShare ? "✓ Share Att: ON" : "+ Add Att in Share"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={shareFullDivisionListToWhatsApp}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow transition text-sm active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Full Division List</span>
          </button>

          <button
            onClick={handleSort}
            className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition text-sm"
          >
            Sort by Count <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="join join-vertical w-full space-y-2">
        {data.sectors.map((sector, index) => {
          const attendedCount =
            sector.registrations?.filter(
              (r) => r.attendance === true
            ).length ?? 0;

          const visibleRegistrations = showAttendedOnly
            ? sector.registrations.filter((r) => r.attendance)
            : sector.registrations;

          return (
            <div
              key={index}
              className="collapse join-item border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <input type="radio" name="accordion-sectors" />

              <div className="collapse-title bg-gray-50 group-open:bg-blue-50 px-5 py-4">
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-lg font-semibold">
                  <span>{sector.sectorName}</span>

                  <div className="flex items-center gap-4 text-sm font-bold">
                    <span className="text-blue-600">
                      Reg: {sector.registrations.length}
                    </span>
                    <span className="text-green-600">
                      Att: {attendedCount}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareSectorListToWhatsApp(sector.sectorName, sector.registrations);
                      }}
                      disabled={visibleRegistrations.length === 0}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Sector</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="collapse-content px-5 pb-4 pt-2 bg-white">
                {visibleRegistrations.length ? (
                  <table className="w-full text-sm sm:text-base mt-3 border-collapse">
                    <thead className="bg-gray-100 text-gray-700 font-bold">
                      <tr>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Mobile</th>
                        <th className="px-3 py-2 text-left">Designation</th>
                        <th className="px-3 py-2 text-left">Level</th>
                        <th className="px-3 py-2 text-center">Attendance</th>
                        <th className="px-3 py-2 text-center">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {visibleRegistrations.map((user, i) => (
                        <tr
                          key={i}
                          className="hover:bg-blue-50 transition"
                        >
                          <td className="px-3 py-2 font-medium">
                            {user.name}
                          </td>
                          <td className="px-3 py-2">{user.mobile}</td>
                          <td className="px-3 py-2">{user.designation}</td>
                          <td className="px-3 py-2 capitalize">
                            {user.organizationLevel}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {user.attendance ? (
                              <span className="text-green-600 font-bold">
                                Present
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => shareSingleToWhatsApp(user, sector.sectorName)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500 py-2">
                    No registrations found.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
