"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { Ticket } from "lucide-react";
import WhatsAppCard from "@/app/components/WhatsAppCard";
import { residentialSchools } from "../../utils/schoolsData";

const StudentsGalaPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileChecked, setMobileChecked] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    school: "",
    course: "",
    year: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData({ ...formData, [name]: value });
  };

  const checkMobile = async () => {
    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setErrors({ mobile: "Enter valid 10 digit number" });
      return;
    }

    const res = await fetch(`/api/register/residential?mobile=${formData.mobile}`);
    const data = await res.json();

    if (data?.success && data?.user) {
      setFoundUser(data.user);
    }

    setMobileChecked(true);
  };

  const resetMobileCheck = () => {
    setMobileChecked(false);
    setFoundUser(null);
    setFormData({ ...formData, mobile: "" });
    setErrors({});
  };
const formatName = (name:string) => {
  return name
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors: { [key: string]: string } = {};
    const { name, mobile, school, course, year } = formData;

    if (!name.trim()) newErrors.name = "Please enter your name.";
    if (!mobile.trim()) newErrors.mobile = "Please enter your mobile number.";
    else if (!/^[0-9]{10}$/.test(mobile)) newErrors.mobile = "Mobile must be 10 digits.";
    if (!course) newErrors.course = "Please select your course.";
    if (!year) newErrors.year = "Please select your year.";
    if (!school) newErrors.school = "Please select school.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/register/residential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
            setFormData({
        name: "",
        mobile: "",
        course: "",
        year: "",
        school: "",
      });
        setFoundUser(data.user);
        Swal.fire({
          icon: "success",
          title: "Registered Successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: data.message || "Registration Failed",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen py-10 md:pt-24 md:px-6 bg-gradient-to-br from-blue-50 to-red-50 flex items-start justify-center">
      <div className="max-w-3xl w-full mx-auto rounded-3xl p-6 md:p-10 border border-white/40 shadow-xl bg-white/60 backdrop-blur-xl">

        {/* HEADER */}
<div className="text-center mb-4">
  <div className="flex justify-center mb-3">
    <div className="bg-blue-600 p-2 rounded-xl shadow-md">
      <Ticket className="text-white w-5 h-5" />
    </div>
  </div>

  <h2 className="text-xl font-bold text-gray-900">Get Your Ticket</h2>
  <p className="text-gray-500 text-sm mt-1">Let’s meet at the Gala!</p>
{foundUser && (
<div className="bg-blue-50 border border-blue-200 rounded-2xl p-6  shadow-sm">
  <div className="flex items-center justify-center gap-2 mb-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-6 h-6 text-blue-600"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>

    <h2 className="text-xl font-bold text-blue-700">Already Registered!</h2>
  </div>

<p className="text-blue-700 font-semibold text-lg">
  Hai, {formatName(foundUser.name)}
</p>


<p className=" text-sm md:text-base mb-2">
  We found your registration details. You can view your ticket below.
</p>

  <button
    type="button"
    onClick={resetMobileCheck}
    className="px-5 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 font-medium shadow-sm hover:bg-gray-50 transition"
  > 
    Register/ Check 
  </button>
</div>)}

</div>


        {foundUser ? (
          <div className="space-y-6">
            <WhatsAppCard
              name={foundUser.name}
              mobile={foundUser.mobile}
              ticket={foundUser.ticket}
              handleImage={() => {}}
            />
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* MOBILE FIELD */}
            <div>
              <label className="font-semibold text-gray-800">Mobile</label>
              <div className="flex gap-3">
                <input
                  type="tel"
                  name="mobile"
                  placeholder="10-digit number"
                  className={`w-full rounded-xl px-4 py-3 bg-white/70 text-gray-900 border ${
                    errors.mobile ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.mobile}
                  onChange={handleChange}
                  disabled={mobileChecked}
                />

                {!mobileChecked ? (
                  <button
                    type="button"
                    onClick={checkMobile}
                    className="bg-gradient-to-r from-red-500 to-blue-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg"
                  >
                    Check
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetMobileCheck}
                    className="bg-gray-700 text-white px-4 py-3 rounded-xl font-semibold"
                  >
                    Change
                  </button>
                )}
              </div>
              {errors.mobile && <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>}
            </div>

            {/* SHOW FORM ONLY IF NEW USER */}
            {!foundUser && mobileChecked && (
              <>
                {/* NAME */}
                <div>
                  <label className="font-semibold text-gray-800">Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    className={`w-full rounded-xl px-4 py-3 bg-white/70 text-gray-900 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* COURSE / YEAR */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-semibold text-gray-800">Course</label>
                    <select
                      name="course"
                      className={`w-full rounded-xl px-4 py-3 bg-white/70 text-gray-900 border ${
                        errors.course ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.course}
                      onChange={handleChange}
                    >
                      <option value="">Select Course</option>
                      <option>Science</option>
                      <option>Commerce</option>
                      <option>Humanities</option>
                    </select>
                    {errors.course && <p className="text-red-600 text-sm mt-1">{errors.course}</p>}
                  </div>

                  <div>
                    <label className="font-semibold text-gray-800">Year</label>
                    <select
                      name="year"
                      className={`w-full rounded-xl px-4 py-3 bg-white/70 text-gray-900 border ${
                        errors.year ? "border-red-500" : "border-gray-300"
                      }`}
                      value={formData.year}
                      onChange={handleChange}
                    >
                      <option value="">Select Year</option>
                      <option>Plus One</option>
                      <option>Plus Two</option>
                    </select>
                    {errors.year && <p className="text-red-600 text-sm mt-1">{errors.year}</p>}
                  </div>
                </div>

                {/* SCHOOL */}
                <div>
                  <label className="font-semibold text-gray-800">School</label>
                  <select
                    name="school"
                    className={`w-full rounded-xl px-4 py-3 bg-white/70 text-gray-900 border ${
                      errors.school ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.school}
                    onChange={handleChange}
                  >
                    <option value="">Select School</option>
                    {residentialSchools.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.school && <p className="text-red-600 text-sm mt-1">{errors.school}</p>}
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full text-white py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-red-500 to-blue-500 transition ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
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

export default StudentsGalaPage;
