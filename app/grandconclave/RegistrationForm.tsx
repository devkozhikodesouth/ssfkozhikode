"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Ticket } from "lucide-react";
import WhatsAppCard from "@/app/components/WhatsAppCard";
import { sectors, divisionDesignations, sectorDesignations } from "../utils/hirarcyList";

const defaultForm = {
  name: "",
  mobile: "",
  organizationLevel: "",
  designation: "",
  division: "",
  sector: "",
};

const StudentsGalaPage = () => {
  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [divisions, setDivisions] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [mobileChecked, setMobileChecked] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ----------------------------------------------------------
   * Fetch Divisions (Auto fallback to static sectors)
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

  /* ----------------------------------------------------------
   * Validation Rules — Clean & Central
   * -------------------------------------------------------- */
  const validators: Record<string, (val: string, state: any) => string> = {
    name: (v) => (!v.trim() ? "Please enter your full name." : ""),
    mobile: (v) => (/^[0-9]{10}$/.test(v) ? "" : "Enter a valid 10-digit mobile number."),

    year: (v) => (!v ? "Please select your year." : ""),
    organizationLevel: (v) => (!v ? "Please select an organization level." : ""),
    designation: (v) => (!v ? "Please select your designation." : ""),
    division: (v) => (!v ? "Please select your division." : ""),
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

  /* ----------------------------------------------------------
   * Generic Field Updater
   * -------------------------------------------------------- */
  const updateField = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "organizationLevel") {
        updated.designation = "";
        updated.sector = "";
      }

      if (name === "division") {
        updated.sector = "";

        const localSectors = sectors[value] || [];
        if (localSectors.length) {
          setAvailableSectors(localSectors);
        } else {
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
      }

      return updated;
    });

    // ✅ ALWAYS clear the field error on change
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

    const res = await fetch(`/api/grandconclave?mobile=${formData.mobile}`);
    const data = await res.json();

    if (data?.success && data.user) setFoundUser(data.user);

    setMobileChecked(true);
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
      const res = await fetch("/api/grandconclave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Registered Successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

        setFoundUser(data.user);
        setFormData(defaultForm);
      } else {
        Swal.fire({ icon: "error", title: data.message || "Registration Failed" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ----------------------------------------------------------
   * UI
   * -------------------------------------------------------- */
  return (
    <main className="py-10 md:pt-24 md:px-6 flex justify-center">
      <div className="max-w-3xl w-full rounded-3xl p-8 md:p-10 shadow-xl bg-white/70 backdrop-blur-xl border border-white/40">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-md">
              <Ticket className="text-white w-5 h-5" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Get Your Ticket</h2>
          <p className="text-gray-600 text-sm mt-1">Let’s meet at the Gala!</p>
        </div>

        {/* Existing User */}
        {foundUser ? (
          <WhatsAppCard
            name={foundUser.name}
            mobile={foundUser.mobile}
            ticket={foundUser.ticket}
            handleImage={() => { }}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Mobile Field */}
            <div>
              <label className="font-semibold text-gray-800">Mobile</label>
              <div className="flex gap-3">
                <input
                  type="tel"
                  name="mobile"
                  className={`w-full rounded-xl px-4 py-3 bg-white border ${errors.mobile ? "border-red-500" : "border-gray-300"
                    }`}
                  value={formData.mobile}
                  onChange={(e) => updateField("mobile", e.target.value)}
                  disabled={mobileChecked}
                />

                {!mobileChecked ? (
                  <button
                    type="button"
                    onClick={checkMobile}
                    className="px-4 py-3     bg-[#645eef] text-white rounded-xl"
                  >
                    Check
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetMobileCheck}
                    className="px-4 py-3     bg-[#645eef] text-white rounded-xl"
                  >
                    Change
                  </button>
                )}
              </div>
              {errors.mobile && <p className="text-red-600 text-sm">{errors.mobile}</p>}
            </div>

            {/* After mobile confirmed */}
            {mobileChecked && (
              <>
                {/* Name */}
                <Input
                  label="Name"
                  name="name"
                  value={formData.name}
                  error={errors.name}
                  onChange={updateField}
                />

                {/* Org Level */}
                <div>
                  <label className="font-semibold text-gray-800">Organization Level</label>
                  <div className="flex gap-6 mt-2">
                    {["sector", "division"].map((lvl) => (
                      <label key={lvl} className="flex gap-2">
                        <input
                          type="radio"
                          name="organizationLevel"
                          value={lvl}
                          checked={formData.organizationLevel === lvl}
                          onChange={(e) => updateField("organizationLevel", e.target.value)}
                        />
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </label>
                    ))}
                  </div>
                  {errors.organizationLevel && (
                    <p className="text-red-600 text-sm">{errors.organizationLevel}</p>
                  )}
                </div>

                <Select
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  options={
                    formData.organizationLevel === "sector"
                      ? sectorDesignations
                      : formData.organizationLevel === "division"
                        ? divisionDesignations
                        : []
                  }
                  disabled={!formData.organizationLevel}
                  error={errors.designation}
                  onClick={() => {
                    if (!formData.organizationLevel) {
                      setErrors((prev) => ({
                        ...prev,
                        designation: "Please select organization level first",
                      }));
                    }
                  }}
                  onChange={updateField}
                />


                {/* Division */}
                <Select
                  label="Division"
                  name="division"
                  value={formData.division}
                  options={divisions}
                  error={errors.division}
                  onChange={updateField}
                />

                {/* Sector (only for sector org) */}
                {formData.organizationLevel === "sector" && (
                  <Select
                    label="Sector"
                    name="sector"
                    value={formData.sector}
                    options={availableSectors}
                    disabled={!formData.division}
                    error={errors.sector}
                    onChange={updateField}
                  />
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl text-white font-semibold bg-[#0c8960] ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                    }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </main>
  );
};

/* ----------------------------------------------------------
 * Reusable Input Components
 * -------------------------------------------------------- */
const Input = ({ label, name, value, onChange, error }: any) => (
  <div>
    <label className="font-semibold text-gray-800">{label}</label>
    <input
      type="text"
      name={name}
      className={`w-full rounded-xl px-4 py-3 bg-white border ${error ? "border-red-500" : "border-gray-300"
        }`}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
    />
    {error && <p className="text-red-600 text-sm">{error}</p>}
  </div>
);

const Select = ({ label, name, value, options, disabled, error, onChange }: any) => (
  <div>
    <label className="font-semibold text-gray-800">{label}</label>
    <select
      className={`w-full rounded-xl px-4 py-3 bg-white border ${error ? "border-red-500" : "border-gray-300"
        }`}
      name={name}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(name, e.target.value)}
    >
      <option value="">Select {label}</option>
      {options.map((o: string) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    {error && <p className="text-red-600 text-sm">{error}</p>}
  </div>
);

export default StudentsGalaPage;
