"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Check, Loader2, Pencil, Plus, X } from "lucide-react";
import { campusNameSchema } from "@/app/utils/mutaallim";
import { Loading, PageShell, useSummary } from "../shared";

type C = { _id: string; name: string; divisionId: string; isActive: boolean; sortOrder: number };

async function call(url: string, method: string, body: unknown) {
  const r = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

export default function MutaallimManagePage() {
  const { data: summary, loading: sLoading, error } = useSummary();
  const [campuses, setCampuses] = useState<C[]>([]);
  const [loading, setLoading] = useState(true);
  const [divisionId, setDivisionId] = useState("");
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () =>
    fetch("/api/admin/mutaallim/campuses", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.success && setCampuses(d.campuses))
      .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const divisions = useMemo(() => [...(summary?.divisions || [])].sort((a, b) => a.divisionName.localeCompare(b.divisionName)), [summary]);
  useEffect(() => { if (!divisionId && divisions.length) setDivisionId(divisions[0]._id); }, [divisions, divisionId]);
  const list = campuses.filter((c) => c.divisionId === divisionId);
  const regCount = useMemo(() => new Map((summary?.campuses || []).map((c) => [c._id, c.total])), [summary]);

  const fail = (m: string) => Swal.fire({ icon: "error", title: m });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adding) return;
    const ok = campusNameSchema.safeParse(name);
    if (!ok.success) return void fail(ok.error.issues[0].message);
    setAdding(true);
    const d = await call("/api/admin/mutaallim/campuses", "POST", { divisionId, name });
    setAdding(false);
    if (d.success) { setName(""); load(); } else fail(d.message || "Failed to add");
  };

  const patch = async (id: string, body: { name?: string; isActive?: boolean }) => {
    if (body.name !== undefined) {
      const ok = campusNameSchema.safeParse(body.name);
      if (!ok.success) return void fail(ok.error.issues[0].message);
    }
    setBusyId(id);
    const d = await call(`/api/admin/mutaallim/campuses/${id}`, "PATCH", body);
    setBusyId(null);
    if (d.success) { setEditing(null); load(); } else fail(d.message || "Failed to update");
  };

  const toggle = async (c: C) => {
    if (c.isActive) {
      const ok = await Swal.fire({
        icon: "warning",
        title: `Deactivate ${c.name}?`,
        text: "It will no longer appear in the registration form. Existing registrations are kept.",
        showCancelButton: true,
        confirmButtonText: "Deactivate",
      });
      if (!ok.isConfirmed) return;
    }
    patch(c._id, { isActive: !c.isActive });
  };

  if (sLoading || loading) return <PageShell title="Manage campuses"><Loading error={error} /></PageShell>;

  return (
    <PageShell title="Manage campuses">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="mdiv" className="text-sm font-semibold text-slate-700">Division</label>
        <select id="mdiv" value={divisionId} onChange={(e) => { setDivisionId(e.target.value); setEditing(null); }} className="min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm">
          {divisions.map((d) => <option key={d._id} value={d._id}>{d.divisionName}</option>)}
        </select>
        <span className="text-sm text-slate-500">{list.filter((c) => c.isActive).length} active · {list.length} total</span>
      </div>

      <form onSubmit={add} className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row">
        <input aria-label="New campus name" value={name} onChange={(e) => setName(e.target.value)} placeholder="New campus name" maxLength={100} className="min-h-10 flex-1 rounded-xl border border-slate-300 px-3 text-sm" />
        <button type="submit" disabled={adding || !name.trim()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50 cursor-pointer">
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add campus
        </button>
      </form>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {list.map((c) => (
          <li key={c._id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            {editing === c._id ? (
              <>
                <input aria-label="Campus name" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && patch(c._id, { name: draft })} maxLength={100} className="min-h-10 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm" />
                <button type="button" aria-label="Save" disabled={busyId === c._id} onClick={() => patch(c._id, { name: draft })} className="rounded-lg bg-emerald-600 p-2 text-white cursor-pointer"><Check className="h-4 w-4" /></button>
                <button type="button" aria-label="Cancel" onClick={() => setEditing(null)} className="rounded-lg bg-slate-200 p-2 text-slate-700 cursor-pointer"><X className="h-4 w-4" /></button>
              </>
            ) : (
              <>
                <span className={`min-w-0 flex-1 font-semibold ${c.isActive ? "text-slate-900" : "text-slate-400 line-through"}`}>{c.name}</span>
                <span className="text-xs text-slate-500">{regCount.get(c._id) ?? 0} registered</span>
                <button type="button" aria-label={`Edit ${c.name}`} onClick={() => { setEditing(c._id); setDraft(c.name); }} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 cursor-pointer"><Pencil className="h-4 w-4" /></button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={c.isActive}
                  aria-label={`${c.name} active`}
                  disabled={busyId === c._id}
                  onClick={() => toggle(c)}
                  className={`relative h-6 w-11 rounded-full transition cursor-pointer ${c.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${c.isActive ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </>
            )}
          </li>
        ))}
        {!list.length && <li className="px-4 py-10 text-center text-sm text-slate-500">No campuses in this division yet.</li>}
      </ul>
    </PageShell>
  );
}
