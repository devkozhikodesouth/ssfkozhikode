"use client";

import React, { useEffect, useRef, useState } from "react";
import { residentialSchools } from "../../utils/schoolsData";
import { groupLinks, sectors, sectorUnits } from "../../utils/hirarcyList";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Ticket } from "lucide-react";
import { sendWhatsApp } from "@/app/lib/sendmessage";
import WhatsAppCard from "@/app/components/WhatsAppCard";
import { Colors } from "@/app/constants/colors";

const StudentsGalaPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const refs = {
    name: useRef<HTMLInputElement>(null),
    mobile: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    school: useRef<HTMLInputElement>(null),
    course: useRef<HTMLSelectElement>(null),
    year: useRef<HTMLSelectElement>(null),
  };

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    school: "",
    course: "",
    year: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors: { [key: string]: string } = {};
    const { name, mobile, email, school, course, year } = formData;

    if (!name.trim()) newErrors.name = "Please enter your name.";
    if (!mobile.trim()) newErrors.mobile = "Please enter your mobile number.";
    else if (!/^[0-9]{10}$/.test(mobile))
      newErrors.mobile = "Mobile must be 10 digits.";
    if (!email.trim()) newErrors.email = "Please enter an email.";
    if (!school.trim()) newErrors.school = "Please enter school.";
    if (!course) newErrors.course = "Please select your course.";
    if (!year) newErrors.year = "Please select your year.";

    setErrors(newErrors);

    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      refs[firstErrorKey as keyof typeof refs]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/register/residential", {
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

        setFormData({
          name: "",
          mobile: "",
          email: "",
          school: "",
          course: "",
          year: "",
        });
      } else {
        Swal.fire({ icon: "error", title: "Registration Failed" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen  py-10 md:pt-24 md:px-10">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl p-5 md:p-10 border border-gray-200">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-red-600 p-3 rounded-full">
              <Ticket className="text-white w-6 h-6" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900">Get Your Ticket</h2>
          <p className="text-gray-600 mt-2">
            Let’s meet at the Gala! Register now.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* NAME */}
          <div>
            <label className="font-semibold text-gray-800 mb-1 block">
              Name
            </label>
            <input
              ref={refs.name}
              type="text"
              name="name"
              placeholder="Enter your name"
              className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm transition ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1 font-medium">
                {errors.name}
              </p>
            )}
          </div>

          {/* MOBILE + EMAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold text-gray-800 mb-1 block">
                Mobile
              </label>
              <input
                ref={refs.mobile}
                type="tel"
                name="mobile"
                placeholder="10-digit number"
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm transition ${
                  errors.mobile ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.mobile}
                onChange={handleChange}
              />
              {errors.mobile && (
                <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>
              )}
            </div>

            <div>
              <label className="font-semibold text-gray-800 mb-1 block">
                Email
              </label>
              <input
                ref={refs.email}
                type="email"
                name="email"
                placeholder="mail@site.com"
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>
               {/* Course + Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label font-medium">Course</label>
              <select
                ref={refs.course}
                name="course"
                 className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm transition ${
                errors.school ? "border-red-500" : "border-gray-300"
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
                ref={refs.year}
                name="year"
               className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm transition ${
                errors.school ? "border-red-500" : "border-gray-300"
              }`}
                value={formData.year}
                onChange={handleChange}
              >
                {" "}
                <option value="">Select Year</option>
                <option>Plus One</option>
                <option>Plus Two</option>
              </select>
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">{errors.year}</p>
              )}
            </div>
          </div>

          {/* SCHOOL */}
          <div>
            <label className="font-semibold text-gray-800 mb-1 block">
              School
            </label>
            <input
              ref={refs.school}
              list="schools"
              type="text"
              name="school"
              placeholder="Your school"
              className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm transition ${
                errors.school ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.school}
              onChange={handleChange}
            />
            <datalist id="schools">
              {residentialSchools.map((school) => (
                <option key={school} value={school} />
              ))}
            </datalist>
            {errors.school && (
              <p className="text-red-600 text-sm mt-1">{errors.school}</p>
            )}
          </div>

          {/* SUBMIT */}
          <div className="pt-4 text-center">
            <button
              type="submit"
              style={{backgroundColor:Colors.accent}}
              disabled={isSubmitting}
              className={`w-full text-white py-4 rounded-xl text-lg font-semibold hover:bg-red-900 transition-all shadow-md ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default StudentsGalaPage;
