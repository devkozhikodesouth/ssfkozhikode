"use client";

import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  Plus,
  Save,
  Trash2,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  Link2,
  Columns3,
  Share2,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";
import { FUND_GROUPS, FundGroup, formatDate, formatINR } from "@/app/utils/fund";
import SharePreview, { ShareRequest } from "@/app/fundchallenge/SharePreview";

/* Optional table columns (Name and Actions always show) */
type ColumnId = "target" | "collected" | "paid" | "unpaid" | "entries" | "active";
const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: "target", label: "Target" },
  { id: "collected", label: "Collected" },
  { id: "paid", label: "Paid" },
  { id: "unpaid", label: "Balance (not paid)" },
  { id: "entries", label: "Entries" },
  { id: "active", label: "Active" },
];
const DEFAULT_COLUMNS: ColumnId[] = ["target", "collected", "paid", "entries", "active"];
const COLUMNS_KEY = "fc:adminColumns";

const readColumns = (): ColumnId[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(COLUMNS_KEY) || "null");
    if (Array.isArray(saved)) return saved.filter((c) => COLUMNS.some((x) => x.id === c));
  } catch {}
  return DEFAULT_COLUMNS;
};

type AdminMember = {
  _id: string;
  name: string;
  target: number;
  active: boolean;
  collected: number;
  entryCount: number;
  paid: number; // handed over to admin
};

export default function FundMembersAdmin({ group }: { group: FundGroup }) {
  const cfg = FUND_GROUPS[group];
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const [cols, setCols] = useState<ColumnId[]>(DEFAULT_COLUMNS);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState<ShareRequest | null>(null);
  // Paid column sort: off (A–Z) → highest first → lowest first
  const [paidSort, setPaidSort] = useState<"off" | "desc" | "asc">("off");

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
  const totalTarget = cfg.totalTarget; // fixed group total
  const totalCollected = activeMembers.reduce((t, m) => t + m.collected, 0);
  const totalPaid = members.reduce((t, m) => t + m.paid, 0);

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

  // Remember chosen columns on this browser
  useEffect(() => setCols(readColumns()), []);
  const toggleCol = (id: ColumnId) =>
    setCols((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      try {
        localStorage.setItem(COLUMNS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  const show = (id: ColumnId) => cols.includes(id);

  useEffect(() => {
    if (!colMenuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!colMenuRef.current?.contains(e.target as Node)) setColMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [colMenuOpen]);

  const unpaidOf = (m: AdminMember) => Math.max(m.collected - m.paid, 0);

  const rows =
    paidSort === "off"
      ? members
      : [...members].sort((a, b) =>
          paidSort === "desc" ? b.paid - a.paid || a.name.localeCompare(b.name) : a.paid - b.paid || a.name.localeCompare(b.name)
        );
  const cyclePaidSort = () => setPaidSort((s) => (s === "off" ? "desc" : s === "desc" ? "asc" : "off"));

  /* WhatsApp message from the table: same rows, only the visible columns */
  const tableMessage = () => {
    const cell = (m: AdminMember, id: ColumnId) => {
      switch (id) {
        case "target":
          return `Target ${formatINR(cfg.target)}`;
        case "collected":
          return `Collected ${formatINR(m.collected)}`;
        case "paid":
          return `Paid ${formatINR(m.paid)}`;
        case "unpaid":
          return `Balance ${formatINR(unpaidOf(m))}`;
        case "entries":
          return `${m.entryCount} ${m.entryCount === 1 ? "entry" : "entries"}`;
        default:
          return "";
      }
    };
    const shown = COLUMNS.map((c) => c.id).filter((id) => show(id) && id !== "active");
    return [
      `💰 *Fund Challenge — ${cfg.label}*`,
      "SSF Kozhikode South District Committee",
      `📅 ${formatDate(new Date())}`,
      "",
      `🎯 *Total target:* ${formatINR(totalTarget)}`,
      `✅ *Collected:* ${formatINR(totalCollected)}`,
      `💵 *Paid:* ${formatINR(totalPaid)}`,
      "",
      ...rows.map((m, i) => {
        const parts = shown.map((id) => cell(m, id)).filter(Boolean);
        const inactive = show("active") && !m.active ? " _(inactive)_" : "";
        return `${i + 1}. *${m.name}*${inactive}${parts.length ? " — " + parts.join(" · ") : ""}`;
      }),
    ].join("\n");
  };

  const draftOf = (m: AdminMember) => drafts[m._id] ?? m.name;
  const isDirty = (m: AdminMember) => drafts[m._id] !== undefined && drafts[m._id].trim() !== m.name;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Fund Challenge — {cfg.label}</h1>
        <p className="text-sm text-slate-500">
          Target {formatINR(cfg.target)} per member · {activeMembers.length} active · Total target{" "}
          {formatINR(totalTarget)} · Collected {formatINR(totalCollected)} · Paid {formatINR(totalPaid)}
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

      {/* Table toolbar: column control + WhatsApp share */}
      <div className="flex items-center justify-end gap-2">
        <div ref={colMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setColMenuOpen((o) => !o)}
            aria-expanded={colMenuOpen}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Columns3 className="w-4 h-4" /> Columns
          </button>
          {colMenuOpen && (
            <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
              {COLUMNS.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={show(c.id)}
                    onChange={() => toggleCol(c.id)}
                    className="w-4 h-4 accent-purple-600"
                  />
                  {c.label}
                </label>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCols(DEFAULT_COLUMNS);
                  try {
                    localStorage.removeItem(COLUMNS_KEY);
                  } catch {}
                }}
                className="mt-1 w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-50 text-left cursor-pointer"
              >
                Reset to default
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSharing({ title: `${cfg.label} table`, message: tableMessage() })}
          disabled={loading || members.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#25D366] text-[#0B3B1E] text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          <Share2 className="w-4 h-4" /> WhatsApp
        </button>
      </div>

      {/* Members table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 360 + cols.length * 110 }}>
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              {show("target") && <th className="px-4 py-3 text-right">Target</th>}
              {show("collected") && <th className="px-4 py-3 text-right">Collected</th>}
              {show("paid") && (
                <th className="px-4 py-3 text-right" aria-sort={paidSort === "off" ? "none" : paidSort === "desc" ? "descending" : "ascending"}>
                  <button
                    type="button"
                    onClick={cyclePaidSort}
                    title="Sort by paid"
                    className={`inline-flex items-center gap-1 uppercase cursor-pointer hover:text-slate-800 ${
                      paidSort !== "off" ? "text-purple-700" : ""
                    }`}
                  >
                    Paid
                    {paidSort === "desc" ? (
                      <ArrowDown className="w-3.5 h-3.5" />
                    ) : paidSort === "asc" ? (
                      <ArrowUp className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </button>
                </th>
              )}
              {show("unpaid") && <th className="px-4 py-3 text-right">Balance (not paid)</th>}
              {show("entries") && <th className="px-4 py-3 text-center">Entries</th>}
              {show("active") && <th className="px-4 py-3 text-center">Active</th>}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={2 + cols.length} className="px-4 py-8 text-center text-slate-500">Loading…</td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={2 + cols.length} className="px-4 py-8 text-center text-slate-500">
                  No members yet. Add the {cfg.label.toLowerCase()} members above.
                </td>
              </tr>
            ) : (
              rows.map((m) => {
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
                    {show("target") && (
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{formatINR(cfg.target)}</td>
                    )}
                    {show("collected") && (
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{formatINR(m.collected)}</td>
                    )}
                    {show("paid") && (
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-700">
                        {formatINR(m.paid)}
                      </td>
                    )}
                    {show("unpaid") && (
                      <td
                        className={`px-4 py-2.5 text-right tabular-nums font-semibold ${
                          unpaidOf(m) > 0 ? "text-amber-700" : "text-slate-400"
                        }`}
                      >
                        {formatINR(unpaidOf(m))}
                      </td>
                    )}
                    {show("entries") && <td className="px-4 py-2.5 text-center tabular-nums">{m.entryCount}</td>}
                    {show("active") && (
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
                    )}
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
      {sharing && <SharePreview request={sharing} onClose={() => setSharing(null)} />}
    </div>
  );
}
