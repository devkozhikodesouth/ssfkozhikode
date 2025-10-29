"use client";

import React from "react";

export default function AboutSSF() {
  return (
    <section className="max-w-4xl mx-auto p-4 mt-24 sm:p-6 md:p-8">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden p-6 sm:p-8 md:p-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-slate-900 mb-4 sm:mb-6 text-center sm:text-left">
          About <span className="text-indigo-600">Sunni Students' Federation (SSF)</span>
        </h2>

        <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 text-center sm:text-justify">
          The Sunni Students' Federation (SSF) is a national student organization dedicated to
          nurturing and promoting the intellectual, cultural, and artistic talents of students.
          With a presence in every state, SSF has been a driving force in shaping the minds of
          young individuals, empowering them to become leaders and change-makers. Through various
          programs and events, SSF fosters a culture of creativity, innovation, and excellence
          among students.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 text-center sm:text-left">
            What We Do
          </h3>
          <ul className="space-y-2 text-slate-700 text-sm sm:text-base list-disc list-inside">
            <li>Organize cultural, educational & artistic programs</li>
            <li>Skill development and leadership training</li>
            <li>Campus-level activism and community projects</li>
            <li>State & national level competitions for students</li>
          </ul>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <strong className="block text-slate-900 text-base sm:text-lg">SSF Kozhikode South District Committee</strong>
          <p className="mt-2 text-slate-700 text-sm sm:text-base">
            We warmly invite students and supporters to be a part of our initiatives and programs.
            Your participation makes a difference.
          </p>
        </div>
      </div>
    </section>
  );
}