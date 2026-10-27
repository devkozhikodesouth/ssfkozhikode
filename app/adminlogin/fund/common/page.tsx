"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import { HandHeart, Loader2, ReceiptText, Search, Trash2 } from "lucide-react";
import { FundEntryRow, formatDate, formatINR, formatTime } from "@/app/utils/fund";
import ReceiptView from "@/app/fundchallenge/ReceiptView";

/* Today's date in IST as YYYY-MM-DD for <input type="date"> */
const todayIST = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const newRequestId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function CommonCollectionPage() {
  const [entries, setEntries] = useState<FundEntryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [contributorName, setContributorName] = useState("");
  const [amount, setAmount] = useState("");
  const [mobile, setMobile] = useState("");
  const [date, setDate] = useState(todayIST());
  const [saving, setSaving] = useState(false);
  const requestId = useRef(newRequestId());

  const [receipt, setReceipt] = useState<FundEntryRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/fund/common", { cache: "no-store", credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setEntries(data.entries);
      setTotal(data.total);
    } catch (e: any) {
      Swal.fire({ icon: "error", title: e.message || "Failed to load entries" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.contributorName.toLowerCase().includes(q) ||
        e.receiptNo.toLowerCase().includes(q) ||
        (e.mobile || "").includes(q)
    );
  }, [entries, search]);

  const save = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (saving) return;
    if (!contributorName.trim()) {
      Swal.fire({ icon: "warning", title: "Enter the contributor's name" });
      return;
    }
    if (!/^\d+$/.test(amount) || Number(amount) <= 0) {
      Swal.fire({ icon: "warning", title: "Enter an amount greater than 0" });
      return;
    }
    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      Swal.fire({ icon: "warning", title: "Mobile number must be 10 digits" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/fund/common", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          contributorName: contributorName.trim(),
          amount,
          mobile,
          date,
          requestId: requestId.current,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Fresh form + new request id for the next entry
      setContributorName("");
      setAmount("");
      setMobile("");
      setDate(todayIST());
      requestId.current = newRequestId();

      setReceipt(data.entry);
      load();
    } catch (e: any) {
      Swal.fire({ icon: "error", title: e.message || "Could not save. Try again." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (e: FundEntryRow) => {
    const ok = await Swal.fire({
      icon: "warning",
      title: `Delete ${e.receiptNo}?`,
      text: `${formatINR(e.amount)} from ${e.contributorName}. The receipt number will not be reused.`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!ok.isConfirmed) return;
    setDeletingId(e._id);
    try {
      const res = await fetch(`/api/admin/fund/common/${e._id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await load();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: err.message || "Failed to delete" });
    } finally {
      setDeletingId(null);
    }
  };

  const inputCls =
    "rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500";

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Fund Challenge — Common Collection</h1>
        <p className="text-sm text-slate-500">
          Contributions not linked to any member or target. Each entry gets a CC- receipt.
        </p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Total collected</p>
          <p className="mt-1 text-xl sm:text-2xl font-black tabular-nums text-emerald-700">
            {loading ? "—" : formatINR(total)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500">Entries</p>
          <p className="mt-1 text-xl sm:text-2xl font-black tabular-nums text-slate-900">
            {loading ? "—" : entries.length}
          </p>
        </div>
      </div>

      {/* New entry */}
      <form onSubmit={save} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3" noValidate>
        <div className="flex items-center gap-2">
          <HandHeart className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-extrabold text-slate-800">New entry</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
            placeholder="Contributor name *"
            autoComplete="off"
            className={inputCls}
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="Amount (₹) *"
            className={`${inputCls} tabular-nums`}
          />
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            inputMode="numeric"
            maxLength={10}
            placeholder="Mobile (optional, 10 digits)"
            className={inputCls}
          />
          <input
            type="date"
            value={date}
            max={todayIST()}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
            aria-label="Date"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-70 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ReceiptText className="w-4 h-4" />}
          Save &amp; get receipt
        </button>
      </form>

      {/* Entries */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border-b border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-800">
            Entries{" "}
            {search.trim() && (
              <span className="font-semibold text-slate-500">
                · {visible.length} of {entries.length}
              </span>
            )}
          </h2>
          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, receipt, mobile"
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Contributor</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading…</td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {entries.length === 0 ? "No entries yet." : "No entry matches your search."}
                  </td>
                </tr>
              ) : (
                visible.map((e) => (
                  <tr key={e._id}>
                    <td className="px-4 py-3 font-mono font-semibold text-[#2A3F9E]">{e.receiptNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {formatDate(e.date)}, {formatTime(e.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{e.contributorName}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">{e.mobile || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-emerald-700">
                      {formatINR(e.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReceipt(e)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-[#15803D] text-xs font-bold hover:bg-green-100 cursor-pointer"
                        >
                          <ReceiptText className="w-3.5 h-3.5" /> Receipt
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(e)}
                          disabled={deletingId === e._id}
                          className="inline-flex items-center px-2.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                          aria-label={`Delete ${e.receiptNo}`}
                        >
                          {deletingId === e._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {receipt && <ReceiptView entry={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
