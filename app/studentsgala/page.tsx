import React from "react";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import CountDown from "./CountDown";
import StudentsGalaInfo from "./StudentsGalaInfo";
import { Colors } from "../constants/colors";
import ProgramTimeline from "../components/ProgramTimeline";

export default function StudentGalaLanding() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#FDE047] via-[#FACC15] to-[#EAB308] bg-[url('/bg-texture.png')] bg-cover bg-center bg-no-repeat overflow-hidden">
      {/* Decorative Left Top Corner PNG */}
      <img
        src="/left-decor.png"
        alt="decor-left"
        className="absolute bottom-72 -z-50 -left-40 md:left-0 min-w-44 md:w-80 pointer-events-none select-none opacity-80"
      />

      {/* Decorative Right Top Corner PNG */}
      <img
        src="/right-decor.png"
        alt="decor-right"
        className="absolute top-0 -right-40 md:right-0 min-w-44 md:w-80 pointer-events-none select-none opacity-80"
      />

      <section className="md:pt-24 mx-auto grid grid-cols-1 justify-center text-c md:grid-cols-2 gap-10 items-center px-6 md:px-12">
 {/* Left Content */}
<div className="md:pl-24 flex flex-col items-center justify-center text-center">
  <img
    className="md:mt-10 mx-auto"
    src="/Students-Gala.png"
    width={"70%"}
    alt="Students Gala"
  />

  <div className="mt-8 flex flex-wrap justify-center items-center gap-4 w-full">
    <Link
      href="/studentsgala/register"
      style={{ backgroundColor: Colors.accent }}
      className="w-full sm:w-3/4 text-white px-6 text-center py-3 rounded-md font-semibold shadow-md hover:brightness-90 transition-all"
    >
      Register Now
    </Link>
  </div>

  <div className="mt-8 flex justify-center w-full">
    <CountDown />
  </div>
</div>

        {/* Right Section */}
        <div className="order-first md:order-last relative mt-32 md:mt-0 flex flex-col items-center text-center px-4 md:px-0 max-w-xl mx-auto">
          {/* Top-left icon */}
          <img
            src="/left-top-icon.png"
            alt=""
            className="absolute -top-14 -left-10 w-20 md:w-28"
          />

          {/* Heading Image */}
          <img
            src="/no-cap.png"
            alt="Students Gala"
            className="w-64 md:w-80 object-contain mb-6"
          />

          {/* Body text */}
          <p className="text-base md:text-lg leading-relaxed font-medium text-gray-700">
            Students' Gala, a district-level celebration of knowledge,
            creativity, and innovation! Bringing together thousands of higher
            secondary students, Students Gala 2025 features inspiring sessions
            on higher education, entrepreneurship, AI, and emerging
            technologies, along with vibrant arts competitions and team
            activities.
          </p>

          {/* Bottom-right icon */}
          <img
            src="/bottom-right-icon.png"
            alt=""
            className="absolute -bottom-14 md:-bottom-30 -right-10 w-20 md:w-28"
          />
        </div>
      </section>
      <section className="mt-20 mb-16 px-6 md:px-12">
        <ProgramTimeline />
      </section>
    </div>
  );
}
