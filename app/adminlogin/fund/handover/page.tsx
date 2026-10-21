"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { HandCoins, Loader2, Trash2 } from "lucide-react";
import { FUND_GROUPS, FundGroup, formatDate, formatINR, formatTime } from "@/app/utils/fund";
import MemberPicker, { PickerItem } from "@/app/fundchallenge/MemberPicker";

type Member = {
  _id: string;
  name: string;
  group: FundGroup;
  active: boolean;
  collected: number;
  paid: number;
};

type Handover = {
  _id: string;
  memberId: string;
  memberName: string;
  group: FundGroup;
  amount: number;
  createdAt: string;
};

const GROUPS: FundGroup[] = ["executive", "council"];

export default function FundHandoverPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);

  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterId, setFilterId] = useState("all");

  const load = async () => {
    try {
      const res = await fetch("/api/admin/fund/handovers", { cache: "no-store", credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setMembers(data.members);
      setHandovers(data.handovers);
    } catch (e: any) {
      Swal.fire({ icon: "error", title: e.message || "Failed to load handovers" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const byGroup = useMemo(
    () => GROUPS.map((g) => ({ group: g, members: members.filter((m) => m.group === g) })),
    [members]
  );
  const selected = members.find((m) => m._id === memberId) || null;

  // Searchable list: Executive first, then Executive Council, A–Z within each
  const pickerItems: PickerItem[] = useMemo(
    () =>
      byGroup.flatMap(({ group, members: list }) =>
        list.map((m) => ({
          _id: m._id,
          name: m.active ? m.name : `${m.name} (inactive)`,
          tag: FUND_GROUPS[group].label,
        }))
      ),
    [byGroup]
  );

  const totals = useMemo(() => {
    const collected = members.reduce((t, m) => t + m.collected, 0);
    const paid = members.reduce((t, m) => t + m.paid, 0);
    return { collected, paid, pending: Math.max(collected - paid, 0) };
  }, [members]);

  const visible = filterId === "all" ? handovers : handovers.filter((h) => h.memberId === filterId);
  const visibleTotal = visible.reduce((t, h) => t + h.amount, 0);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!selected) {
      Swal.fire({ icon: "warning", title: "Select a member" });
      return;
    }
    if (!/^\d+$/.test(amount) || Number(amount) <= 0) {
      Swal.fire({ icon: "warning", title: "Enter an amount greater than 0" });
      return;
    }

    const pending = selected.collected - selected.paid;
    if (Number(amount) > pending) {
      const ok = await Swal.fire({
        icon: "warning",
        title: "More than collected?",
        text: `${selected.name} has ${formatINR(Math.max(pending, 0))} not yet handed over. Save ${formatINR(
          Number(amount)
        )} anyway?`,
        showCancelButton: true,
        confirmButtonText: "Save anyway",
      });
      if (!ok.isConfirmed) return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/fund/handovers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ memberId, amount }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setAmount("");
      await load();
      Swal.fire({
        icon: "success",
        title: `${formatINR(Number(data.handover.amount))} received from ${selected.name}`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (e: any) {
      Swal.fire({ icon: "error", title: e.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (h: Handover) => {
    const ok = await Swal.fire({
      icon: "warning",
      title: "Delete this handover?",
      text: `${formatINR(h.amount)} from ${h.memberName} on ${formatDate(h.createdAt)}, ${formatTime(h.createdAt)}`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!ok.isConfirmed) return;
    setDeletingId(h._id);
    try {
      const res = await fetch(`/api/admin/fund/handovers/${h._id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await load();
    } catch (e: any) {
      Swal.fire({ icon: "error", title: e.message || "Failed to delete" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Fund Challenge — Handover</h1>
        <p className="text-sm text-slate-500">Record money members hand over to the admin.</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Collected", value: totals.collected, cls: "text-slate-900" },
          { label: "Paid to admin", value: totals.paid, cls: "text-emerald-700" },
          { label: "Not yet handed over", value: totals.pending, cls: "text-amber-700" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500">{c.label}</p>
            <p className={`mt-1 text-base sm:text-2xl font-black tabular-nums ${c.cls}`}>
              {loading ? "—" : formatINR(c.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Record handover */}
      <form onSubmit={save} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <HandCoins className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-extrabold text-slate-800">Record handover</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px_auto] gap-3">
          <MemberPicker
            members={pickerItems}
            value={memberId}
            onChange={setMemberId}
            loading={loading}
            placeholder="Search or select member"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="Amount (₹)"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm tabular-nums outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-70 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <HandCoins className="w-4 h-4" />}
            Save
          </button>
        </div>

        {selected && (
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
            <div>
              <p className="text-[11px] text-slate-500">Collected</p>
              <p className="text-sm font-bold tabular-nums">{formatINR(selected.collected)}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Paid</p>
              <p className="text-sm font-bold tabular-nums text-emerald-700">{formatINR(selected.paid)}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">To hand over</p>
              <p className="text-sm font-bold tabular-nums text-amber-700">
                {formatINR(Math.max(selected.collected - selected.paid, 0))}
              </p>
            </div>
          </div>
        )}
      </form>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border-b border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-800">
            Paid amounts{" "}
            <span className="font-semibold text-slate-500">
              · {visible.length} · {formatINR(visibleTotal)}
            </span>
          </h2>
          <select
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Filter by member"
          >
            <option value="all">All members</option>
            {byGroup.map(({ group, members: list }) =>
              list.length ? (
                <optgroup key={group} label={FUND_GROUPS[group].label}>
                  {list.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </optgroup>
              ) : null
            )}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Date & time</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading…</td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No handovers yet.</td>
                </tr>
              ) : (
                visible.map((h) => (
                  <tr key={h._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {formatDate(h.createdAt)}, {formatTime(h.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{h.memberName}</td>
                    <td className="px-4 py-3 text-slate-600">{FUND_GROUPS[h.group].label}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-emerald-700">
                      {formatINR(h.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => remove(h)}
                        disabled={deletingId === h._id}
                        className="inline-flex items-center px-2.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                        aria-label="Delete handover"
                      >
                        {deletingId === h._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
