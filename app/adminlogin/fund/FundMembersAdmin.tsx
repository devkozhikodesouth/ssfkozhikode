"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Plus, Save, Trash2, ExternalLink, Loader2, Copy, Check, Link2 } from "lucide-react";
import { FUND_GROUPS, FundGroup, formatINR } from "@/app/utils/fund";

type AdminMember = {
  _id: string;
  name: string;
  target: number;
  active: boolean;
  collected: number;
  entryCount: number;
};

export default function FundMembersAdmin({ group }: { group: FundGroup }) {
  const cfg = FUND_GROUPS[group];
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const [publicPath, setPublicPath] = useState("");
  const [copied, setCopied] = useState(false);

  const publicUrl = publicPath && typeof window !== "undefined" ? `${window.location.origin}${publicPath}` : "";

  const load = async () => {
    try {
      const res = await fetch(`/api/admin/fund/members?group=${group}`, { cache: "no-store", credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setMembers(data.members);
      setPublicPath(data.publicPath || "");
      setDrafts({});
    } catch (e: any) {
      Swal.fire({ icon: "error", title: e.message || "Failed to load members" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [group]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeMembers = members.filter((m) => m.active);
  const totalTarget = activeMembers.length * cfg.target;
  const totalCollected = activeMembers.reduce((t, m) => t + m.collected, 0);

  const copyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = publicUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adding) return;
    if (!name.trim()) {
      Swal.fire({ icon: "warning", title: "Enter the member's name" });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/fund/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), group }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setName("");
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

  const draftOf = (m: AdminMember) => drafts[m._id] ?? m.name;
  const isDirty = (m: AdminMember) => drafts[m._id] !== undefined && drafts[m._id].trim() !== m.name;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Fund Challenge — {cfg.label}</h1>
        <p className="text-sm text-slate-500">
          Target {formatINR(cfg.target)} per member · {activeMembers.length} active · Total target{" "}
          {formatINR(totalTarget)} · Collected {formatINR(totalCollected)}
        </p>
      </div>

      {/* Secret public link */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-extrabold text-slate-800">Public link — {cfg.label}</h2>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Only people with this link can open the {cfg.label} page. Share it with {cfg.label.toLowerCase()} members only.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            value={loading && !publicUrl ? "Loading…" : publicUrl}
            onFocus={(e) => e.target.select()}
            className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono text-slate-700"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyLink}
              disabled={!publicUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={publicPath || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 ${
                publicPath ? "" : "pointer-events-none opacity-50"
              }`}
            >
              <ExternalLink className="w-4 h-4" /> Open
            </a>
          </div>
        </div>
      </div>

      {/* Add member */}
      <form
        onSubmit={addMember}
        className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`${cfg.memberLabel} name`}
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={adding}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-70 cursor-pointer"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add member · target {formatINR(cfg.target)}
        </button>
      </form>

      {/* Members table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 text-right">Target</th>
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
                  No members yet. Add the {cfg.label.toLowerCase()} members above.
                </td>
              </tr>
            ) : (
              members.map((m) => {
                const busy = savingId === m._id;
                return (
                  <tr key={m._id} className={m.active ? "" : "opacity-60"}>
                    <td className="px-4 py-2.5">
                      <input
                        value={draftOf(m)}
                        onChange={(e) => setDrafts((p) => ({ ...p, [m._id]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{formatINR(cfg.target)}</td>
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
                          disabled={!isDirty(m) || busy || !draftOf(m).trim()}
                          onClick={() => patch(m._id, { name: draftOf(m).trim() })}
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
        Inactive members are hidden from the public page; their entries are kept.
      </p>
    </div>
  );
}
