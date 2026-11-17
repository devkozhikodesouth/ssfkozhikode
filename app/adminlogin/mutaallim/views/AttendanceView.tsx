"use client";

import { useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle2, Loader2, QrCode, Search, X } from "lucide-react";
import { apiUrl, pct, useSource, useSummary } from "../shared";

type Attendee = {
  _id: string;
  registrationCode: string;
  name: string;
  place: string;
  phone: string;
  category: string;
  division: string;
  campus: string;
  attended: boolean;
  attendedAt: string | null;
};

const time = (d: string) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

/* Accept a QR / typed code (MUT-0012, mut 12, 12) or a 10-digit phone */
function normalizeQuery(raw: string): string | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const code = s.toUpperCase().replace(/\s+/g, "");
  const m = code.match(/^(?:MUT-?)?(\d{1,6})$/);
  if (m && !/^\d{10}$/.test(code)) return `MUT-${m[1].padStart(4, "0")}`;
  const digits = s.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return null;
}

export default function AttendanceView() {
  const src = useSource();
  const { data: summary, reload } = useSummary();

  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [autoMark, setAutoMark] = useState(false); // off: confirm each person before marking
  const [busy, setBusy] = useState<"find" | "mark" | null>(null);
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "warn" | "error"; text: string } | null>(null);
  const [recent, setRecent] = useState<Attendee[]>([]);
  const lastScan = useRef({ value: "", at: 0 });

  useEffect(() => {
    if (!scanning) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setScanning(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scanning]);

  const mark = async (a: Attendee) => {
    setBusy("mark");
    try {
      const res = await fetch(apiUrl(src, "attendance"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: a._id }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      const updated: Attendee = d.attendee;
      setAttendee(updated);
      setNotice({ tone: "ok", text: `${updated.name} marked present at ${time(updated.attendedAt!)}` });
      setRecent((r) => [updated, ...r.filter((x) => x._id !== updated._id)].slice(0, 15));
      reload();
    } catch (e: any) {
      setNotice({ tone: "error", text: e.message || "Could not mark attendance" });
    } finally {
      setBusy(null);
    }
  };

  const find = async (raw: string, fromScan = false) => {
    const q = normalizeQuery(raw);
    if (!q) {
      setNotice({ tone: "error", text: fromScan ? "Not a Muta'allim pass QR" : "Enter a registration code or 10-digit phone" });
      return;
    }
    setBusy("find");
    setNotice(null);
    setAttendee(null);
    try {
      const res = await fetch(apiUrl(src, "attendance", `q=${encodeURIComponent(q)}`), {
        credentials: "include",
        cache: "no-store",
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      const a: Attendee = d.attendee;
      setAttendee(a);
      setBusy(null);
      if (a.attended) {
        setNotice({ tone: "warn", text: `Already marked present at ${time(a.attendedAt!)}` });
      } else if (fromScan && autoMark) {
        await mark(a);
      }
    } catch (e: any) {
      setNotice({ tone: "error", text: e.message || "Lookup failed" });
      setBusy(null);
    }
  };

  const onScan = (value: string | undefined) => {
    if (!value) return;
    // Cameras fire the same code repeatedly: ignore repeats within 3s
    const now = Date.now();
    if (lastScan.current.value === value && now - lastScan.current.at < 3000) return;
    lastScan.current = { value, at: now };
    setScanning(false);
    find(value, true);
  };

  const toneCls = {
    ok: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    warn: "bg-amber-50 text-amber-800 ring-amber-200",
    error: "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Live count */}
      {summary && (
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attended</p>
            <p className="text-2xl font-extrabold text-emerald-700">
              {summary.attended} <span className="text-base font-semibold text-slate-400">/ {summary.total}</span>
            </p>
          </div>
          <p className="text-3xl font-black tabular-nums text-slate-900">{pct(summary.attended, summary.total)}%</p>
        </div>
      )}

      {/* Scan + manual */}
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <button
          type="button"
          onClick={() => {
            setNotice(null);
            setScanning(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 py-4 text-base font-bold text-white hover:bg-purple-800 cursor-pointer"
        >
          <QrCode className="h-5 w-5" /> Scan QR pass
        </button>
        <label className="flex min-h-11 items-center gap-3 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" checked={autoMark} onChange={(e) => setAutoMark(e.target.checked)} className="h-5 w-5 accent-purple-700" />
          Mark automatically after scan
        </label>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            find(query);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Code (MUT-0012) or phone"
              aria-label="Registration code or phone"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-base"
            />
          </div>
          <button
            type="submit"
            disabled={busy !== null}
            className="min-h-11 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white disabled:opacity-60 cursor-pointer"
          >
            {busy === "find" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
          </button>
        </form>
      </div>

      {notice && (
        <p role="status" className={`rounded-xl px-4 py-3 text-sm font-semibold ring-1 ${toneCls[notice.tone]}`}>
          {notice.text}
        </p>
      )}

      {/* Person card */}
      {attendee && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className={`px-4 py-3 text-white ${attendee.attended ? "bg-emerald-600" : "bg-purple-700"}`}>
            <p className="font-mono text-sm font-semibold opacity-90">{attendee.registrationCode}</p>
            <p className="text-xl font-bold">{attendee.name}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 text-sm">
            <dt className="text-slate-500">Category</dt>
            <dd className="font-semibold text-slate-900">{attendee.category}</dd>
            <dt className="text-slate-500">Campus</dt>
            <dd className="font-semibold text-slate-900">{attendee.campus}</dd>
            <dt className="text-slate-500">Division</dt>
            <dd className="font-semibold text-slate-900">{attendee.division}</dd>
            <dt className="text-slate-500">Place</dt>
            <dd className="font-semibold text-slate-900">{attendee.place}</dd>
            <dt className="text-slate-500">Phone</dt>
            <dd className="font-semibold tabular-nums text-slate-900">{attendee.phone}</dd>
          </dl>
          <div className="border-t border-slate-100 p-4">
            {attendee.attended ? (
              <p className="flex items-center justify-center gap-2 text-base font-bold text-emerald-700">
                <CheckCircle2 className="h-5 w-5" /> Present · {time(attendee.attendedAt!)}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => mark(attendee)}
                disabled={busy !== null}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-base font-bold text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
              >
                {busy === "mark" ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                Mark present
              </button>
            )}
          </div>
        </div>
      )}

      {/* This device's recent marks */}
      {recent.length > 0 && (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <p className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Marked on this device ({recent.length})
          </p>
          <ul className="divide-y divide-slate-100">
            {recent.map((r) => (
              <li key={r._id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="min-w-0 truncate">
                  <span className="font-semibold text-slate-900">{r.name}</span>{" "}
                  <span className="font-mono text-xs text-slate-500">{r.registrationCode}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-emerald-700">{time(r.attendedAt!)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scanner modal */}
      {scanning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
          onClick={() => setScanning(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="scan-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p id="scan-title" className="font-bold text-slate-900">Scan Muta&apos;allim pass</p>
              <button
                type="button"
                onClick={() => setScanning(false)}
                aria-label="Close scanner"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black">
                <Scanner
                  onScan={(codes) => onScan(codes[0]?.rawValue)}
                  onError={() => setNotice({ tone: "error", text: "Camera not available. Allow camera access or type the code." })}
                  constraints={{ facingMode: "environment" }}
                  styles={{
                    container: { width: "100%", height: "100%" },
                    video: { width: "100%", height: "100%", objectFit: "cover" },
                  }}
                />
              </div>
              <p className="mt-3 text-center text-sm text-slate-500">Point the camera at the QR code on the pass</p>
              {autoMark && (
                <p className="mt-1 text-center text-xs font-semibold text-emerald-700">Will mark present automatically</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
