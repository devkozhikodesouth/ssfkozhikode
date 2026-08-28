"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Ticket, Sparkles, CheckCircle2, PhoneCall, User, ShieldCheck, MapPin, Loader2 } from "lucide-react";
import WhatsAppCard from "@/app/components/WhatsAppCard";
import { sectors, divisionDesignations, sectorDesignations, DistrictDesignations } from "../utils/hirarcyList";

const defaultForm = {
  name: "",
  mobile: "",
  organizationLevel: "",
  designation: "",
  division: "",
  sector: "",
};

export default function RegistrationForm() {
  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [divisions, setDivisions] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [mobileChecked, setMobileChecked] = useState(false);
  const [isCheckingMobile, setIsCheckingMobile] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ----------------------------------------------------------
   * Fetch Divisions
   * -------------------------------------------------------- */
  useEffect(() => {
    let active = true;

    fetch("/api/register")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;

        const loaded =
          data?.success && Array.isArray(data.data)
            ? data.data.map((d: any) => d.divisionName || String(d))
            : Object.keys(sectors);

        setDivisions(loaded);
      })
      .catch(() => setDivisions(Object.keys(sectors)));

    return () => {
      active = false;
    };
  }, []);

  const getDesignationOptions = (orgLevel: string) => {
    if (orgLevel === "sector") return sectorDesignations;
    if (orgLevel === "division") return divisionDesignations;
    if (orgLevel === "district") return DistrictDesignations;
    return [];
  };

  /* ----------------------------------------------------------
   * Validation Rules
   * -------------------------------------------------------- */
  const validators: Record<string, (val: string, state: any) => string> = {
    name: (v) => (!v.trim() ? "Please enter your full name." : ""),
    mobile: (v) => (/^[0-9]{10}$/.test(v) ? "" : "Enter a valid 10-digit mobile number."),
    organizationLevel: (v) => (!v ? "Please select an organization level." : ""),
    designation: (v) => (!v ? "Please select your designation." : ""),
    division: (v, s) =>
      (s.organizationLevel === "division" || s.organizationLevel === "sector") && !v
        ? "Please select your division."
        : "",
    sector: (v, s) =>
      s.organizationLevel === "sector" && !v ? "Please select your sector." : "",
  };

  const validate = (field: string, value: string, state = formData) => {
    return validators[field] ? validators[field](value, state) : "";
  };

  const validateAll = () => {
    const newErrors: any = {};
    Object.keys(formData).forEach((key) => {
      const msg = validate(key, (formData as any)[key]);
      if (msg) newErrors[key] = msg;
    });
    setErrors(newErrors);
    return newErrors;
  };

  const updateField = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "organizationLevel") {
        updated.designation = "";
        updated.sector = "";
      }

      if (name === "division") {
        updated.sector = "";
        fetch(`/api/sectors?division=${encodeURIComponent(value)}`)
          .then((r) => r.json())
          .then((d) => {
            if (d?.success && Array.isArray(d.data)) {
              setAvailableSectors(d.data.map((s: any) => s.sectorName));
            } else {
              setAvailableSectors([]);
            }
          })
          .catch(() => setAvailableSectors([]));
      }

      return updated;
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* ----------------------------------------------------------
   * Mobile Check API
   * -------------------------------------------------------- */
  const checkMobile = async () => {
    const msg = validate("mobile", formData.mobile);
    if (msg) return setErrors({ mobile: msg });

    setIsCheckingMobile(true);
    try {
      const res = await fetch(`/api/grandconclave26?mobile=${formData.mobile}`);
      const data = await res.json();

      if (data?.success && data.user) setFoundUser(data.user);
      setMobileChecked(true);
    } catch (e) {
      setMobileChecked(true);
    } finally {
      setIsCheckingMobile(false);
    }
  };

  const resetMobileCheck = () => {
    setMobileChecked(false);
    setFoundUser(null);
    setErrors({});
    setFormData(defaultForm);
  };

  /* ----------------------------------------------------------
   * Submit
   * -------------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validation = validateAll();
    if (Object.keys(validation).length > 0) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/grandconclave26", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Registered Successfully!",
          text: `Your Ticket Code: ${data.user.ticket}`,
          timer: 2500,
          showConfirmButton: false,
        });

        setFoundUser(data.user);
        setFormData(defaultForm);
      } else {
        Swal.fire({ icon: "error", title: data.message || "Registration Failed" });
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Registration failed. Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-6">
      <div className="relative w-full max-w-3xl rounded-3xl p-8 md:p-12 bg-white/90 backdrop-blur-2xl border border-purple-200/80 shadow-2xl shadow-purple-900/10 overflow-hidden text-slate-900">
        
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-200/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-100/60 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/30 mb-3">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-medium text-slate-900">
            Delegate Registration
          </h2>
          <p className="text-purple-700 text-sm sm:text-base mt-1 font-normal">
            GRAND CONCLAVE 26 — <span className="font-cooper">SSF</span> Kozhikode South
          </p>
        </div>

        {/* Existing User Ticket View */}
        {foundUser ? (
          <div className="relative z-10 bg-slate-50 p-6 rounded-2xl border border-purple-200 shadow-inner">
            <WhatsAppCard
              name={foundUser.name}
              mobile={foundUser.mobile}
              ticket={foundUser.ticket}
              handleImage={() => {}}
            />
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={resetMobileCheck}
                className="px-6 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 transition text-sm font-medium cursor-pointer"
              >
                Register Another Number
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Mobile Number Verification */}
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium text-slate-700 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-500" />
                Mobile Number
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.mobile}
                  onChange={(e) => updateField("mobile", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!mobileChecked && !isCheckingMobile) {
                        checkMobile();
                      }
                    }
                  }}
                  disabled={mobileChecked || isCheckingMobile}
                  className={`w-full rounded-2xl px-4 py-3.5 bg-slate-50 border transition-all text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white ${
                    errors.mobile ? "border-red-500" : "border-slate-300 focus:border-purple-400"
                  }`}
                />
                {!mobileChecked ? (
                  <button
                    type="button"
                    onClick={checkMobile}
                    disabled={isCheckingMobile}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-medium shadow-lg shadow-purple-600/30 transition active:scale-95 text-sm sm:text-base whitespace-nowrap flex items-center justify-center gap-2 text-white disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isCheckingMobile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <span>Check</span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetMobileCheck}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium transition active:scale-95 text-sm sm:text-base whitespace-nowrap cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>

            {/* Form Fields after Mobile Check */}
            {mobileChecked && (
              <div className="space-y-6 animate-fadeIn">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-medium text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-500" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={`w-full rounded-2xl px-4 py-3.5 bg-slate-50 border transition-all text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white ${
                      errors.name ? "border-red-500" : "border-slate-300 focus:border-purple-400"
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>

                {/* Organization Level */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-medium text-slate-700 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    Organization Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["sector", "division", "district"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => updateField("organizationLevel", lvl)}
                        className={`py-3 px-3 rounded-2xl border text-sm sm:text-base font-medium capitalize transition-all cursor-pointer ${
                          formData.organizationLevel === lvl
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 shadow-md text-white"
                            : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                  {errors.organizationLevel && (
                    <p className="text-red-500 text-xs">{errors.organizationLevel}</p>
                  )}
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-medium text-slate-700">Designation</label>
                  <select
                    value={formData.designation}
                    disabled={!formData.organizationLevel}
                    onChange={(e) => updateField("designation", e.target.value)}
                    className={`w-full rounded-2xl px-4 py-3.5 bg-slate-50 border transition-all text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white ${
                      errors.designation ? "border-red-500" : "border-slate-300 focus:border-purple-400"
                    } ${!formData.organizationLevel ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="" className="bg-white text-gray-500">
                      Select Designation
                    </option>
                    {getDesignationOptions(formData.organizationLevel).map((d: string) => (
                      <option key={d} value={d} className="bg-white text-slate-900">
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.designation && (
                    <p className="text-red-500 text-xs">{errors.designation}</p>
                  )}
                </div>

                {/* Division Dropdown */}
                {(formData.organizationLevel === "division" ||
                  formData.organizationLevel === "sector") && (
                  <div className="space-y-2">
                    <label className="text-sm sm:text-base font-medium text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      Division
                    </label>
                    <select
                      value={formData.division}
                      onChange={(e) => updateField("division", e.target.value)}
                      className={`w-full rounded-2xl px-4 py-3.5 bg-slate-50 border transition-all text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white ${
                        errors.division ? "border-red-500" : "border-slate-300 focus:border-purple-400"
                      }`}
                    >
                      <option value="" className="bg-white text-gray-500">
                        Select Division
                      </option>
                      {divisions.map((d: string) => (
                        <option key={d} value={d} className="bg-white text-slate-900">
                          {d}
                        </option>
                      ))}
                    </select>
                    {errors.division && (
                      <p className="text-red-500 text-xs">{errors.division}</p>
                    )}
                  </div>
                )}

                {/* Sector Dropdown */}
                {formData.organizationLevel === "sector" && (
                  <div className="space-y-2">
                    <label className="text-sm sm:text-base font-medium text-slate-700">Sector</label>
                    <select
                      value={formData.sector}
                      disabled={!formData.division}
                      onChange={(e) => updateField("sector", e.target.value)}
                      className={`w-full rounded-2xl px-4 py-3.5 bg-slate-50 border transition-all text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white ${
                        errors.sector ? "border-red-500" : "border-slate-300 focus:border-purple-400"
                      } ${!formData.division ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <option value="" className="bg-white text-gray-500">
                        Select Sector
                      </option>
                      {availableSectors.map((s: string) => (
                        <option key={s} value={s} className="bg-white text-slate-900">
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.sector && (
                      <p className="text-red-500 text-xs">{errors.sector}</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-2xl font-medium text-lg text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 shadow-lg shadow-emerald-500/25 transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Generating Ticket...</span>
                    </>
                  ) : (
                    <span>Get Delegate Ticket</span>
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
