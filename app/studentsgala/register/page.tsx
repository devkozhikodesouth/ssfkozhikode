"use client";
import React, { useEffect, useState } from "react";
import { kozhikodeSchools } from "../../utils/schoolsData";
import { groupLinks, sectors, sectorUnits } from "../../utils/hirarcyList";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const StudentsGalaPage = () => {
  const [divisions, setDivisions] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  // fetch divisions from server on mount (route supports GET). fall back to local keys
  useEffect(() => {
    let mounted = true;
    fetch("/api/register", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.success && Array.isArray(data.data) && data.data.length) {
          // If server returns division documents with a `name` field, map accordingly
          const names = data.data.map((d: any) => d.divisionName || String(d));
          setDivisions(names);
        } else {
          setDivisions(Object.keys(sectors));
        }
      })
      .catch((err) => {
        console.error(err);
        setDivisions(Object.keys(sectors));
      });
    return () => {
      mounted = false;
    };
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    school: "",
    course: "",
    year: "",
    division: "",
    sector: "",
    unit: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    // if division changes, update available sectors and clear dependent fields
    if (name === "division") {
      const localSectors = sectors[value] || [];
      if (localSectors && localSectors.length) {
        setAvailableSectors(localSectors);
      } else {
        // try fetching sectors from server by division name
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
      setFormData({ ...formData, division: value, sector: "", unit: "" });
      return;
    }

    // if sector changes, update available units and clear dependent field
    if (name === "sector") {
      const localUnits = sectorUnits[value] || [];
      if (localUnits && localUnits.length) {
        setAvailableUnits(localUnits);
      } else {
        fetch(`/api/units?sector=${encodeURIComponent(value)}`)
          .then((r) => r.json())
          .then((d) => {
            if (d?.success && Array.isArray(d.data)) {
              setAvailableUnits(d.data.map((u: any) => u.unitName));
            } else {
              setAvailableUnits([]);
            }
          })
          .catch(() => setAvailableUnits([]));
      }
      setFormData({ ...formData, sector: value, unit: "" });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // prevent double submissions
    const newErrors: { [key: string]: string } = {};
    const {
      name,
      mobile,
      email,
      school,
      course,
      year,
      division,
      sector,
      unit,
    } = formData;

    // 🧾 Validate fields
    if (!name.trim()) newErrors.name = "Please enter your name.";
    if (!mobile.trim()) newErrors.mobile = "Please enter your mobile number.";
    else if (!/^[0-9]{10}$/.test(mobile))
      newErrors.mobile = "Mobile number must be 10 digits.";
    if (!email.trim()) newErrors.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email address.";
    if (!school.trim()) newErrors.school = "Please enter your school name.";
    if (!course) newErrors.course = "Please select your course.";
    if (!year) newErrors.year = "Please select your year.";
    if (!division) newErrors.division = "Please select your division.";
    if (!sector) newErrors.sector = "Please select your sector.";
    if (!unit) newErrors.unit = "Please select your unit.";

    setErrors(newErrors);

    // 🚫 Stop if there are any errors
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        // ✅ Success Alert
        await Swal.fire({
          icon: "success",
          title: "Registered Successfully!",
          text: "Your registration was completed successfully.",
          showConfirmButton: false,
          timer: 2000,
        });

        // ✅ Open WhatsApp group
        const groupLink = groupLinks[formData.division.toUpperCase()];

        if (groupLink) {
          console.log("Opening link:", groupLink);
          window.open(groupLink, "_blank", "noopener,noreferrer");
        } else {
          console.warn("No group link found for:", formData.division);
        }
        // ✅ Reset the form
        setFormData({
          name: "",
          mobile: "",
          email: "",
          school: "",
          course: "",
          year: "",
          division: "",
          sector: "",
          unit: "",
        });
      } else {
        // ❌ Error from server
        Swal.fire({
          icon: "error",
          title: "Registration Failed!",
          text: data.message || "Please try again later.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "There was a problem connecting to the server.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10 mt-16 px-4 md:px-10">      <div className="max-w-2xl mx-auto bg-base-100 shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Students Gala Registration
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="label font-medium">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              className={`input input-bordered w-full ${
                errors.name ? "border-red-500" : ""
              }`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mobile */}
            <div>
              <label className="label font-medium">Mobile</label>
              <input
                type="tel"
                name="mobile"
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                className={`input input-bordered w-full ${
                  errors.mobile ? "border-red-500" : ""
                }`}
                value={formData.mobile}
                onChange={handleChange}
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label font-medium">Email</label>
              <input
                type=""
                name="email"
                placeholder="mail@site.com"
                className={`input input-bordered w-full ${
                  errors.email ? "border-red-500" : ""
                }`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* School */}
          <div>
            <label className="label font-medium">School</label>
            <input
              type="text"
              name="school"
              className={`input input-bordered w-full ${
                errors.school ? "border-red-500" : ""
              }`}
              placeholder="Select your school"
              list="schools"
              value={formData.school}
              onChange={handleChange}
            />
            <datalist id="schools">
              {kozhikodeSchools.map((school) => (
                <option key={school} value={school} />
              ))}
            </datalist>
            {errors.school && (
              <p className="text-red-500 text-sm mt-1">{errors.school}</p>
            )}
          </div>

          {/* Course + Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label font-medium">Course</label>
              <select
                name="course"
                className={`select select-bordered w-full ${
                  errors.course ? "border-red-500" : ""
                }`}
                value={formData.course}
                onChange={handleChange}
              >
                <option value="">Select Course</option>
                <option>Science</option>
                <option>Commerce</option>
                <option>Humanities</option>
              </select>
              {errors.course && (
                <p className="text-red-500 text-sm mt-1">{errors.course}</p>
              )}
            </div>

            <div>
              <label className="label font-medium">Year</label>
              <select
                name="year"
                className={`select select-bordered w-full ${
                  errors.year ? "border-red-500" : ""
                }`}
                value={formData.year}
                onChange={handleChange}
              >
                <option value="">Select Year</option>
                <option>Plus One</option>
                <option>Plus Two</option>
              </select>
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">{errors.year}</p>
              )}
            </div>
          </div>

          {/* Division, Sector, Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label font-medium">Division</label>
              <select
                name="division"
                className={`select select-bordered w-full ${
                  errors.division ? "border-red-500" : ""
                }`}
                value={formData.division}
                onChange={handleChange}
              >
                <option value="">Select Division</option>
                {divisions.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
              {errors.division && (
                <p className="text-red-500 text-sm mt-1">{errors.division}</p>
              )}
            </div>

            {/* Sector */}
            <div>
              <label className="label font-medium">Sector</label>
              <select
                name="sector"
                className={`select select-bordered w-full ${
                  errors.sector ? "border-red-500" : ""
                }`}
                value={formData.sector}
                onChange={handleChange}
                disabled={!formData.division}
              >
                <option value="">Choose your sector</option>
                {formData.division &&
                  (availableSectors.length > 0
                    ? availableSectors
                    : sectors[formData.division] || []
                  ).map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
              </select>
              {errors.sector && (
                <p className="text-red-500 text-sm mt-1">{errors.sector}</p>
              )}
            </div>
          </div>
          {/* Unit */}
          <div>
            <label className="label font-medium">Unit</label>
            <select
              name="unit"
              className={`select select-bordered w-full ${
                errors.unit ? "border-red-500" : ""
              }`}
              value={formData.unit}
              onChange={handleChange}
              disabled={!formData.sector}
            >
              <option value="">Choose your unit</option>
              {formData.sector &&
                (availableUnits.length > 0
                  ? availableUnits
                  : sectorUnits[formData.sector] || []
                ).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
            </select>
            {errors.unit && (
              <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
            )}
          </div>

          {/* Submit */}
  <div className="pt-4 text-center">
  <button
    type="submit"
    disabled={isSubmitting}
    className={` w-full btn bg-blue-900 text-white hover:bg-blue-700 text-lg px-8 py-3 rounded-xl transition-all ${
      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    {isSubmitting ? (
      <>
        <span className="loading loading-spinner loading-md"></span>
        Submitting...
      </>
    ) : (
      "Submit"
    )}
  </button>
</div>
        </form>
      </div>
    </main>
  );
};

export default StudentsGalaPage;
