'use client';
import React, { useState } from "react";
import { kozhikodeSchools } from "../../utils/schoolsData";
import { sectors, sectorUnits } from "../../utils/hirarcyList";

const StudentsGalaPage = () => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Registered Successfully");
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
      alert("❌ Registration Failed");
    }
  };

  return (
    <main className="min-h-screen bg-base-200 py-10 px-4 md:px-10">
      <div className="max-w-2xl mx-auto bg-base-100 shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-8">
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
              className="input input-bordered w-full"
              value={formData.name}
              onChange={handleChange}
              required
            />
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
                className="input input-bordered w-full"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="label font-medium">Email</label>
              <input
                type="email"
                name="email"
                placeholder="mail@site.com"
                className="input input-bordered w-full"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* School */}
          <div>
            <label className="label font-medium">School</label>
            <input
              type="text"
              name="school"
              className="input input-bordered w-full"
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
          </div>

          {/* Course + Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label font-medium">Course</label>
              <input
                type="text"
                name="course"
                placeholder="Enter your course"
                className="input input-bordered w-full"
                value={formData.course}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label font-medium">Year</label>
              <select
                name="year"
                className="select select-bordered w-full"
                value={formData.year}
                onChange={handleChange}
              >
                <option value="">Select Year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
              </select>
            </div>
          </div>

          {/* Division, Sector, Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label font-medium">Division</label>
              <select
                name="division"
                className="select select-bordered w-full"
                value={formData.division}
                onChange={handleChange}
              >
                <option value="">Select Division</option>
                {Object.keys(sectors).map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>

            {/* Sector */}
            <div>
              <label className="label font-medium">Sector</label>
              <select
                name="sector"
                className="select select-bordered w-full"
                value={formData.sector}
                onChange={handleChange}
                disabled={!formData.division}
              >
                <option value="">Choose your sector</option>
                {formData.division &&
                  sectors[formData.division].map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
              </select>
            </div>
            </div>
            {/* Unit */}
            <div>
              <label className="label font-medium">Unit</label>
              <select
                name="unit"
                className="select select-bordered w-full"
                value={formData.unit}
                onChange={handleChange}
                disabled={!formData.sector}
              >
                <option value="">Choose your unit</option>
                {formData.sector &&
                  sectorUnits[formData.sector]?.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
              </select>
            </div>
         

          {/* Submit */}
          <div
           className="pt-4 text-center ">
            <button
              type="submit"
              className="btn bg-green-600 text-white  hover:bg-green-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default StudentsGalaPage;
