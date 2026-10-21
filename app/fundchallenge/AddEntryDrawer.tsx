"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { FundEntryRow, FundMemberSummary } from "@/app/utils/fund";

/* Today's date in IST as YYYY-MM-DD for <input type="date"> */
const todayIST = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const newRequestId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const DRAWER_MS = 250;

type Props = {
  member: FundMemberSummary;
  fundKey: string;
  onClose: () => void;
  onSaved: (entry: FundEntryRow) => void;
};

export default function AddEntryDrawer({ member, fundKey, onClose, onSaved }: Props) {
  const [contributorName, setContributorName] = useState("");
  const [amount, setAmount] = useState("");
  const [mobile, setMobile] = useState("");
  const [date, setDate] = useState(todayIST());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const [shown, setShown] = useState(false);

  // One id per drawer session: retries/double taps resolve to the same entry
  const requestId = useRef(newRequestId());
  const savingRef = useRef(false);

  // Slide out first, then unmount. Locked while a save is in flight.
  const requestClose = useCallback(() => {
    if (savingRef.current) return;
    setShown(false);
    window.setTimeout(onClose, DRAWER_MS);
  }, [onClose]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && requestClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [requestClose]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!contributorName.trim()) e.contributorName = "Enter the contributor's name.";
    if (!/^\d+$/.test(amount) || Number(amount) <= 0) e.amount = "Enter an amount greater than 0.";
    if (mobile && !/^[0-9]{10}$/.test(mobile)) e.mobile = "Mobile number must be 10 digits.";
    if (!date) e.date = "Select a date.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (savingRef.current) return;
    if (!validate()) return;

    savingRef.current = true;
    setSaving(true);
    setServerError("");

    try {
      const res = await fetch("/api/fund/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member._id,
          contributorName: contributorName.trim(),
          amount,
          mobile,
          date,
          requestId: requestId.current,
          key: fundKey,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not save. Try again.");
      onSaved(data.entry);
    } catch (err: any) {
      setServerError(err.message || "Could not save. Check your connection and try again.");
      savingRef.current = false;
      setSaving(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full rounded-xl border px-4 py-3.5 text-base text-slate-900 bg-white outline-none focus:ring-2 focus:ring-[#1C75BC] ${
      errors[field] ? "border-red-600" : "border-slate-300"
    }`;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={requestClose}
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-[250ms] ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer: bottom sheet on phones, right-side panel on wider screens */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-entry-title"
        className={`absolute bg-white shadow-xl overflow-y-auto transition-transform duration-[250ms] ease-out
          inset-x-0 bottom-0 max-h-[92vh] rounded-t-3xl
          sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-0 sm:max-h-none sm:w-[420px] sm:rounded-none sm:rounded-l-3xl
          ${shown ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"}`}
      >
        {/* Grab handle (phones) */}
        <div className="sm:hidden sticky top-0 z-10 bg-white pt-2.5 flex justify-center">
          <span className="w-10 h-1.5 rounded-full bg-slate-300" />
        </div>

        <div className="sticky top-4 sm:top-0 z-10 bg-white flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 id="add-entry-title" className="text-lg font-semibold text-slate-900">
            Add New Entry
          </h2>
          <button
            type="button"
            onClick={requestClose}
            className="p-2.5 -mr-2 rounded-xl text-slate-500 active:bg-slate-100 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="px-5 py-5 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Executive member</label>
            <input
              value={member.name}
              readOnly
              aria-readonly="true"
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-base text-slate-700"
            />
          </div>

          <div>
            <label htmlFor="fc-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Contributor name <span className="text-red-600">*</span>
            </label>
            <input
              id="fc-name"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              autoComplete="off"
              className={inputCls("contributorName")}
            />
            {errors.contributorName && <p className="mt-1 text-sm text-red-600">{errors.contributorName}</p>}
          </div>

          <div>
            <label htmlFor="fc-amount" className="block text-sm font-medium text-slate-700 mb-1.5">
              Amount (₹) <span className="text-red-600">*</span>
            </label>
            <input
              id="fc-amount"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              className={inputCls("amount")}
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          <div>
            <label htmlFor="fc-mobile" className="block text-sm font-medium text-slate-700 mb-1.5">
              Contributor mobile <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="fc-mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit number"
              className={inputCls("mobile")}
            />
            {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
          </div>

          <div>
            <label htmlFor="fc-date" className="block text-sm font-medium text-slate-700 mb-1.5">
              Date
            </label>
            <input
              id="fc-date"
              type="date"
              value={date}
              max={todayIST()}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls("date")}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>

          {serverError && (
            <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-xl bg-[#15803D] text-white text-base font-semibold flex items-center justify-center gap-2 active:bg-[#166534] disabled:opacity-70 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
