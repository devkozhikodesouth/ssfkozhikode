'use client';
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { kozhikodeSchools } from "../utils/schoolsData";
import { sectors, sectorUnits } from "../utils/hirarcyList";

const StudentsGalaPage = () => {



// If the values are strings
const [selectedDivision, setSelectedDivision] = useState<string>("");
const [selectedSector, setSelectedSector] = useState<string>("");
const [selectedUnit, setSelectedUnit] = useState<string>("");

  return (
    <>
      <main className="min-h-screen bg-base-200 py-10 px-4 md:px-10">
        <div className="max-w-2xl mx-auto bg-base-100 shadow-md rounded-xl p-8">
          <h1 className="text-3xl font-bold text-center text-green-600 mb-8">
            Students Gala Registration
          </h1>

          <form className="space-y-6">
            {/* Name */}
            <div>
              <label className="label font-medium">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="input input-bordered w-full"
                required
              />
            </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mobile */}
            <div>
              <label className="label font-medium">Mobile</label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                className="input input-bordered w-full"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Must be exactly 10 digits
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="label font-medium">Email</label>
              <input
                type="email"
                placeholder="mail@site.com"
                className="input input-bordered w-full"
              />
            </div>
  </div>

{/* School */}
<div>
  <label className="label font-medium">School</label>
  <input
    type="text"
    className="input input-bordered w-full"
    placeholder="Select your school"
    list="schools"
  />
  <datalist id="schools">
    {kozhikodeSchools.map((school) => (
      <option key={school} value={school} />
    ))}
  </datalist>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Course */}
            <div>
              <label className="label font-medium">Course</label>
              <input
                type="text"
                placeholder="Enter your course"
                className="input input-bordered w-full"
              />
            </div>

            {/* Year */}
            <div>
              <label className="label font-medium">Year</label>
              <select className="select select-bordered w-full">
                <option disabled selected>Select Year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
              </select>
            </div>
</div>
           
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Division */}
  <div>
    <label className="label font-medium">Division</label>
    <select
      className="select select-bordered w-full"
      value={selectedDivision}
      onChange={(e) => {
        setSelectedDivision(e.target.value);
        setSelectedSector(""); // Reset sector when division changes
        setSelectedUnit("");   // Reset unit when division changes
      }}
    >
      <option disabled value="">
        Select Division
      </option>
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
      className="select select-bordered w-full"
      value={selectedSector}
      onChange={(e) => {
        setSelectedSector(e.target.value);
        setSelectedUnit(""); // Reset unit when sector changes
      }}
      disabled={!selectedDivision} // Disable until division selected
    >
      <option disabled value="">
        Choose your sector
      </option>
      {selectedDivision &&
        sectors[selectedDivision].map((sector:string) => (
          <option key={sector} value={sector}>
            {sector}
          </option>
        ))}
    </select>
  </div>

  {/* Unit */}
  <div>
    <label className="label font-medium">Unit</label>
    <select
      className="select select-bordered w-full"
      value={selectedUnit}
      onChange={(e) => setSelectedUnit(e.target.value)}
      disabled={!selectedSector} // Disable until sector selected
    >
      <option disabled value="">
        Choose your unit
      </option>
      {selectedSector &&
        sectorUnits[selectedSector]?.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
    </select>
  </div>
</div>


            {/* Submit */}
            <div className="pt-4 text-center">
              <button type="submit" className="btn bg-green-600 text-white hover:bg-green-700">
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default StudentsGalaPage;
