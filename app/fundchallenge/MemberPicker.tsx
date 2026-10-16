"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { FundMemberSummary } from "@/app/utils/fund";

type Props = {
  members: FundMemberSummary[]; // already in display order (A–Z)
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
};

/* Searchable member dropdown (combobox) — large tap targets for phones */
export default function MemberPicker({ members, value, onChange, loading }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = members.find((m) => m._id === value) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? members.filter((m) => m.name.toLowerCase().includes(q)) : members;
  }, [members, query]);

  // Close on outside tap
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Reset search and focus it when opening
  useEffect(() => {
    if (!open) return;
    setQuery("");
    const idx = members.findIndex((m) => m._id === value);
    setHighlight(idx >= 0 ? idx : 0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setHighlight(0), [query]);

  // Keep the highlighted option in view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  const choose = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlight]) choose(filtered[highlight]._id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id="fc-member"
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-left text-base outline-none focus:ring-2 focus:ring-[#1C75BC] disabled:opacity-60 cursor-pointer"
      >
        <span className={`truncate ${selected ? "text-slate-900 font-medium" : "text-slate-500"}`}>
          {loading ? "Loading members…" : selected ? selected.name : "Select your name"}
        </span>
        <ChevronDown className={`w-5 h-5 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="relative border-b border-slate-100 p-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search name"
              role="combobox"
              aria-controls="fc-member-list"
              aria-expanded="true"
              aria-autocomplete="list"
              className="w-full rounded-lg bg-slate-50 pl-9 pr-10 py-3 text-base outline-none focus:ring-2 focus:ring-[#1C75BC]"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 active:bg-slate-200"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <ul id="fc-member-list" ref={listRef} role="listbox" className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-4 text-sm text-slate-500 text-center">No member found</li>
            ) : (
              filtered.map((m, i) => {
                const isSelected = m._id === value;
                return (
                  <li
                    key={m._id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => choose(m._id)}
                    onMouseEnter={() => setHighlight(i)}
                    className={`flex items-center justify-between gap-2 px-4 py-3.5 text-base cursor-pointer ${
                      i === highlight ? "bg-slate-100" : ""
                    } ${isSelected ? "font-semibold text-[#15803D]" : "text-slate-800"}`}
                  >
                    <span className="truncate">{m.name}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
