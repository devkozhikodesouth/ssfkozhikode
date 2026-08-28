"use client";

import React from "react";

export default function AboutSSF() {
  return (
    <section className="max-w-4xl mx-auto p-4 mt-24 sm:p-6 md:p-8">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden p-6 sm:p-8 md:p-10">
        <h2 className="text-3xl sm:text-4xl font-medium leading-tight text-slate-900 mb-4 sm:mb-6 text-center sm:text-left">
          About <span className="text-indigo-600 font-medium">Sunni Students' Federation (<span className="font-cooper">SSF</span>)</span>
        </h2>

        <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 text-center sm:text-justify font-normal">
          The Sunni Students' Federation (<span className="font-cooper">SSF</span>) is a national student organization dedicated to
          nurturing and promoting the intellectual, cultural, and artistic talents of students.
          With a presence in every state, <span className="font-cooper">SSF</span> has been a driving force in shaping the minds of
          young individuals, empowering them to become leaders and change-makers. Through various
          programs and events, <span className="font-cooper">SSF</span> fosters a culture of creativity, innovation, and excellence
          among students.
        </p>

        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/60 p-5 sm:p-6">
          <h3 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 sm:mb-4 text-center sm:text-left">
            What We Do
          </h3>
          <ul className="space-y-2.5 text-slate-600 text-base sm:text-lg list-disc list-inside font-normal">
            <li>Organize cultural, educational & artistic programs</li>
            <li>Skill development and leadership training</li>
            <li>Campus-level activism and community projects</li>
            <li>State & national level competitions for students</li>
          </ul>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <span className="block text-slate-900 text-lg sm:text-xl font-medium"><span className="font-cooper">SSF</span> Kozhikode South District Committee</span>
          <p className="mt-2 text-slate-600 text-base sm:text-lg font-normal">
            We warmly invite students and supporters to be a part of our initiatives and programs.
            Your participation makes a difference.
          </p>
        </div>
      </div>
    </section>
  );
}