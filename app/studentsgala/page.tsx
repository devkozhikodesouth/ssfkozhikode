import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import CountDown from "./CountDown";
import StudentsGalaInfo from "./StudentsGalaInfo";

export default function StudentGalaLanding() {
  return (
    <div className="min-h-screen  from-pink-50 via-white to-blue-50">
      {/* Header */}

      {/* Hero Section */}
  <section className="bg-linear-to-br md:pt-24    from-blue-50 via-white to-blue-100 mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-6 md:px-12">
        {/* Left Content */}
        <div className=" md:pl-24 ">
          <img
            className="-mt-40 md:mt-10"
            src="Students-Gala.png"
            width={"70%"}
            alt="Students Gala"
          />

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/studentsgala/register"
              className="bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold shadow-md hover:bg-indigo-700 transition-all"
            >
              Register Now
            </Link>
            {/* <a
              href="#intro"
              className="flex items-center gap-2 text-indigo-600 hover:underline font-medium"
            >
              ▶ Watch Intro
            </a> */}
          </div>
          <div className="mt-5 flex justify-start text-left">
  <CountDown />
</div>

          <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-700">
            {/* 🗺️ Location Card */}
            <div className="flex items-center gap-4 bg-linear-to-r from-white to-indigo-50 p-6 rounded-3xl shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 group">
              <div className="flex items-center justify-center w-14  rounded-2xl bg-indigo-100 group-hover:bg-indigo-200 transition">
                <MapPin size={26} className="text-indigo-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Kadalundi
                </h4>
                <p className="text-gray-600">AVOKI CENTRO ARENA</p>
              </div>
            </div>

            {/* 🎓 Event Info Card */}
            <div className="relative flex items-center gap-6 bg-linear-to-r from-white to-indigo-50 p-6 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 group">
              {/* Decorative Accent */}
              <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500 rounded-l-3xl group-hover:w-1.5 transition-all duration-300"></div>

              {/* Left Icon */}
              <div className="flex items-center justify-center w-14 rounded-2xl bg-indigo-100 group-hover:bg-indigo-200 transition">
                <Users size={26} className="text-indigo-600" />
              </div>

              {/* Right Content */}
              <div className="flex flex-col">
                <p className="text-xl sm:text-md text-indigo-700 font-medium flex items-start gap-1 ">
                  
                  Saturday, November 29{" "}
                     </p>
                <span className="text-gray-600">09:00 AM</span>
                <p className="text-sm text-gray-500 mt-1">
                  Organized by{" "}
                  <span className="font-medium text-gray-800">
                    SSF Kozhikode South District Committee
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (Mockup Card) */}
        <div className="order-first md:order-last mt-10 md:mt-0 flex justify-center">
          <img
            src="/galamain.png"
            alt="Event Preview"
            className="w-full max-w-md  md:max-w-lg object-cover"
          />
        </div>
      </section>

      {/* Awards Section */}
      <section
        id="awards"
        className="max-w-7xl mx-auto text-center py-20 px-6"
      >
        <StudentsGalaInfo />
      </section>
    </div>
  );
}
