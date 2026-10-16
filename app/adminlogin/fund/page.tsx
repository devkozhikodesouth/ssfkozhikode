"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Plus, Save, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { formatINR } from "@/app/utils/fund";

type AdminMember = {
  _id: string;
  name: string;
  target: number;
  active: boolean;
  collected: number;
  entryCount: number;
};

export default function FundMembersAdminPage() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [adding, setAdding] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, { name: string; target: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/fund/members", { cache: "no-store", credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setMembers(data.members);
      setDrafts({});
    } catch (e: any) {
      Swal.fire({ icon: "error", title: e.message || "Failed to load members" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = members
    .filter((m) => m.active)
    .reduce((t, m) => ({ target: t.target + m.target, collected: t.collected + m.collected }), {
      target: 0,
      collected: 0,
    });

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adding) return;
    if (!name.trim() || !/^\d+$/.test(target)) {
      Swal.fire({ icon: "warning", title: "Enter a name and a target amount" });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/fund/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), target: Number(target) }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setName("");
      setTarget("");
      await load();
    } catch (e: any) {
      Swal.fire({ icon: "error", title: e.message || "Failed to add member" });
    } finally {
      setAdding(false);
    }
  };

  const patch = async (id: string, body: Record<string, any>) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/fund/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await load();
    } catch (e: any) {
      Swal.fire({ icon: "error", title: e.message || "Failed to update" });
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (m: AdminMember) => {
    const ok = await Swal.fire({
      icon: "warning",
      title: `Delete ${m.name}?`,
      text: "This cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!ok.isConfirmed) return;
    setSavingId(m._id);
    try {
      const res = await fetch(`/api/admin/fund/members/${m._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await load();
    } catch (e: any) {
      Swal.fire({ icon: "error", title: e.message || "Failed to delete" });
    } finally {
      setSavingId(null);
    }
  };

  const draftOf = (m: AdminMember) => drafts[m._id] || { name: m.name, target: String(m.target) };
  const isDirty = (m: AdminMember) => {
    const d = drafts[m._id];
    return !!d && (d.name.trim() !== m.name || d.target !== String(m.target));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Fund Challenge — Members & Targets</h1>
          <p className="text-sm text-slate-500">
            Active: {members.filter((m) => m.active).length} members · Target {formatINR(totals.target)} ·
            Collected {formatINR(totals.collected)}
          </p>
        </div>
        <a
          href="/fundchallenge"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <ExternalLink className="w-4 h-4" /> Open public page
        </a>
      </div>

      {/* Add member */}
      <form onSubmit={addMember} className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Member name"
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          placeholder="Target (₹)"
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={adding}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-70 cursor-pointer"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add member
        </button>
      </form>

      {/* Members table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 w-40">Target (₹)</th>
              <th className="px-4 py-3 text-right">Collected</th>
              <th className="px-4 py-3 text-center">Entries</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading…</td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No members yet. Add the executive members above.
                </td>
              </tr>
            ) : (
              members.map((m) => {
                const d = draftOf(m);
                const busy = savingId === m._id;
                return (
                  <tr key={m._id} className={m.active ? "" : "opacity-60"}>
                    <td className="px-4 py-2.5">
                      <input
                        value={d.name}
                        onChange={(e) => setDrafts((p) => ({ ...p, [m._id]: { ...d, name: e.target.value } }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        value={d.target}
                        inputMode="numeric"
                        onChange={(e) =>
                          setDrafts((p) => ({ ...p, [m._id]: { ...d, target: e.target.value.replace(/\D/g, "") } }))
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 tabular-nums outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{formatINR(m.collected)}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums">{m.entryCount}</td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={m.active}
                        disabled={busy}
                        onChange={(e) => patch(m._id, { active: e.target.checked })}
                        className="w-5 h-5 accent-purple-600 cursor-pointer"
                        aria-label={`${m.name} active`}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={!isDirty(m) || busy || !d.name.trim() || d.target === ""}
                          onClick={() => patch(m._id, { name: d.name.trim(), target: Number(d.target) })}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                        >
                          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save
                        </button>
                        <button
                          type="button"
                          disabled={busy || m.entryCount > 0}
                          title={m.entryCount > 0 ? "Has entries — deactivate instead" : "Delete member"}
                          onClick={() => remove(m)}
                          className="inline-flex items-center px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 disabled:opacity-40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Inactive members are hidden from the public Fund Challenge page; their entries are kept.
      </p>
    </div>
  );
}
