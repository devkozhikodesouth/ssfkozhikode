"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, ChevronDown, Loader2 } from "lucide-react";
import { CATEGORIES, phoneSchema, validateRegistration, type TicketData } from "@/app/utils/mutaallim";
import Ticket from "./Ticket";

type Division = { _id: string; divisionName: string };
type Option = { _id: string; name: string };
type Step = "phone" | "form" | "ticket";

const emptyForm = { divisionId: "", campusId: "", name: "", place: "", category: "" };

const inputCls =
  "w-full min-h-12 rounded-lg border bg-white px-4 text-base text-mut-ink placeholder:text-mut-muted/80 outline-none transition " +
  "focus-visible:border-mut-plum-deep focus-visible:ring-2 focus-visible:ring-mut-plum-deep/30 disabled:cursor-not-allowed disabled:bg-mut-parchment/40 disabled:text-mut-muted";
const labelCls = "mb-1.5 block text-sm font-bold text-mut-ink";
const primaryBtn =
  "flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-mut-plum-deep px-6 text-base font-bold text-white transition " +
  "hover:bg-mut-plum active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mut-plum-deep " +
  "disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer";

function Select({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...p} className={`${p.className} appearance-none pr-11`}>
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mut-plum-deep" />
    </div>
  );
}

function Banner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-mut-red/40 bg-white px-4 py-3 text-sm font-medium text-mut-red">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}

export default function MutaallimForm({ onStepChange }: { onStepChange?: (s: Step) => void }) {
  const [step, setStep] = useState<Step>("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState(""); // normalised, once checked
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [returning, setReturning] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [campuses, setCampuses] = useState<Option[]>([]);
  const [loadingDivs, setLoadingDivs] = useState(false);
  const [loadingCampuses, setLoadingCampuses] = useState(false);
  const [banner, setBanner] = useState("");
  const [busy, setBusy] = useState(false);

  const lock = useRef(false); // blocks double submit before state re-renders
  const campusReq = useRef(0); // ignores stale campus responses
  const heading = useRef<HTMLHeadingElement>(null);

  // Move focus to the step heading when the step changes (keyboard + screen reader)
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) heading.current?.focus({ preventScroll: true }); // not on first load
    mounted.current = true;
    onStepChange?.(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Load divisions only once the form is actually needed
  useEffect(() => {
    if (step !== "form" || divisions.length) return;
    setLoadingDivs(true);
    fetch("/api/register", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.data)) {
          setDivisions([...d.data].sort((a: Division, b: Division) => a.divisionName.localeCompare(b.divisionName)));
        } else setBanner("Could not load divisions. Please refresh.");
      })
      .catch(() => setBanner("Could not load divisions. Please refresh."))
      .finally(() => setLoadingDivs(false));
  }, [step, divisions.length]);

  const backToPhone = () => {
    setStep("phone");
    setTicket(null);
    setPhone("");
    setPhoneInput("");
    setForm(emptyForm);
    setCampuses([]);
    setErrors({});
    setBanner("");
  };

  /* ───── Step A: check phone ───── */
  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lock.current) return;
    const parsed = phoneSchema.safeParse(phoneInput);
    if (!parsed.success) {
      setErrors({ phone: parsed.error.issues[0].message });
      document.getElementById("f-phone")?.focus();
      return;
    }
    const n = parsed.data;
    lock.current = true;
    setBusy(true);
    setErrors({});
    setBanner("");
    try {
      const res = await fetch("/api/mutaallim/registration/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: n }),
      });
      const data = await res.json();
      if (!data.success) {
        setBanner(data.message || "Something went wrong. Please try again.");
      } else if (data.registered) {
        setPhone(n);
        setTicket(data.ticket);
        setReturning(true);
        setStep("ticket");
      } else {
        setPhone(n);
        setStep("form");
      }
    } catch {
      setBanner("Network error. Please check your connection and try again.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  /* ───── Step C: register ───── */
  const set = (name: keyof typeof emptyForm, value: string) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setBanner("");
  };

  const onDivision = (divisionId: string) => {
    setForm((p) => ({ ...p, divisionId, campusId: "" })); // reset campus
    setErrors((p) => ({ ...p, divisionId: "", campusId: "" }));
    setCampuses([]);
    setBanner("");
    if (!divisionId) return;
    const req = ++campusReq.current;
    setLoadingCampuses(true);
    fetch(`/api/mutaallim/campuses?divisionId=${divisionId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => req === campusReq.current && setCampuses(d?.success ? d.data : []))
      .catch(() => req === campusReq.current && setCampuses([]))
      .finally(() => req === campusReq.current && setLoadingCampuses(false));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lock.current) return;
    const errs = validateRegistration({ ...form, phone });
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    lock.current = true;
    setBusy(true);
    setBanner("");
    try {
      const res = await fetch("/api/mutaallim/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setTicket(data.ticket);
        setReturning(!!data.existing);
        setStep("ticket");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        if (data.errors) setErrors(data.errors);
        setBanner(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setBanner("Network error. Please check your connection and try again.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  const err = (k: string) =>
    errors[k] ? (
      <p id={`e-${k}`} role="alert" className="mt-1.5 text-sm font-medium text-mut-red">
        {errors[k]}
      </p>
    ) : null;
  const cls = (k: string) => `${inputCls} ${errors[k] ? "border-mut-red" : "border-mut-ink/20"}`;
  const aria = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `e-${k}` : undefined });
  const h2 = "pr-10 font-mut-display text-3xl font-extrabold leading-tight tracking-tight outline-none";

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {/* ───────── A · phone check ───────── */}
          {step === "phone" && (
            <form onSubmit={check} noValidate className="text-mut-ink">
              <h2 ref={heading} tabIndex={-1} className={`${h2} text-mut-plum-deep`}>
                Get your pass
              </h2>
              <p className="mt-2 text-base leading-relaxed text-mut-muted">
                Enter your mobile number. If you are already registered we will show your pass; otherwise you can register in a minute.
              </p>
              <Banner message={banner} />
              <div className="mt-6">
                <label htmlFor="f-phone" className={labelCls}>Mobile number</label>
                <input
                  id="f-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="98765 43210 or +91 98765 43210"
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value);
                    setErrors({});
                    setBanner("");
                  }}
                  maxLength={18}
                  className={cls("phone")}
                  {...aria("phone")}
                />
                {err("phone")}
              </div>
              <button type="submit" disabled={busy} className={`${primaryBtn} mt-6`}>
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Checking…
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-5 w-5" aria-hidden />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ───────── C · register ───────── */}
          {step === "form" && (
            <form onSubmit={submit} noValidate className="text-mut-ink">
              <h2 ref={heading} tabIndex={-1} className={`${h2} text-mut-plum-deep`}>
                Complete your registration
              </h2>
              <p className="mt-2 text-base text-mut-muted">This number is not registered yet. All fields are required.</p>

              <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-mut-ink/15 bg-white px-4 py-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-mut-muted">Mobile number</p>
                  <p className="text-base font-bold tabular-nums">{phone}</p>
                </div>
                <button type="button" onClick={backToPhone} className="min-h-11 rounded-md px-3 text-sm font-bold text-mut-plum-deep underline underline-offset-4 hover:text-mut-plum focus-visible:outline-2 focus-visible:outline-mut-plum-deep cursor-pointer">
                  Change
                </button>
              </div>

              <div className="mt-5">
                <Banner message={banner} />
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="f-divisionId" className={labelCls}>Division</label>
                  <Select id="f-divisionId" value={form.divisionId} onChange={(e) => onDivision(e.target.value)} disabled={loadingDivs} className={cls("divisionId")} {...aria("divisionId")}>
                    <option value="">{loadingDivs ? "Loading divisions…" : "Select division"}</option>
                    {divisions.map((d) => (
                      <option key={d._id} value={d._id}>{d.divisionName}</option>
                    ))}
                  </Select>
                  {err("divisionId")}
                </div>

                <div>
                  <label htmlFor="f-campusId" className={labelCls}>Campus</label>
                  <Select id="f-campusId" value={form.campusId} onChange={(e) => set("campusId", e.target.value)} disabled={!form.divisionId || loadingCampuses} className={cls("campusId")} {...aria("campusId")}>
                    <option value="">{!form.divisionId ? "Select a division first" : loadingCampuses ? "Loading campuses…" : "Select campus"}</option>
                    {campuses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </Select>
                  {err("campusId")}
                </div>

                <div>
                  <label htmlFor="f-name" className={labelCls}>Name</label>
                  <input id="f-name" type="text" autoComplete="name" placeholder="Your full name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={100} className={cls("name")} {...aria("name")} />
                  {err("name")}
                </div>

                <div>
                  <label htmlFor="f-place" className={labelCls}>Place</label>
                  <input id="f-place" type="text" autoComplete="address-level2" placeholder="Your place" value={form.place} onChange={(e) => set("place", e.target.value)} maxLength={100} className={cls("place")} {...aria("place")} />
                  {err("place")}
                </div>

                <div>
                  <label htmlFor="f-category" className={labelCls}>Category</label>
                  <Select id="f-category" value={form.category} onChange={(e) => set("category", e.target.value)} className={cls("category")} {...aria("category")}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                  {err("category")}
                </div>
              </div>

              <button type="submit" disabled={busy || loadingDivs} className={`${primaryBtn} mt-7`}>
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Submitting…
                  </>
                ) : (
                  "Register & get pass"
                )}
              </button>
            </form>
          )}

          {/* ───────── B · ticket ───────── */}
          {step === "ticket" && ticket && (
            <div>
              <h2 ref={heading} tabIndex={-1} className={`${h2} text-mut-gold`}>
                {returning ? "Welcome back" : "You are registered"}
              </h2>
              <p className="mb-6 mt-2 text-base leading-relaxed text-mut-parchment">
                {returning ? "Here is your pass. Show the QR code at the venue." : "Save your pass now. Show the QR code at the venue."}
              </p>
              <Ticket ticket={ticket} />
              <p className="mt-6 text-center text-sm text-mut-parchment">
                Not you?{" "}
                <button type="button" onClick={backToPhone} className="min-h-11 font-bold text-mut-gold underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-mut-gold cursor-pointer">
                  Use a different number
                </button>
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
