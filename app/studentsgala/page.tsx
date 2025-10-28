import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";

export default function StudentGalaLanding() {
  return (
    <div className="min-h-screen  from-pink-50 via-white to-blue-50">
      {/* Header */}
      

      {/* Hero Section */}
      <section className="bg-gradient-to-br    from-blue-50 via-white to-blue-100 mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-6 md:px-12">
        {/* Left Content */}
        <div className="pl-7 md:pl-24"> 
          <p className="-mt-44 md:mt-0  text-sm text-indigo-600 font-medium flex items-center gap-2">
            <Calendar size={16} /> Saturday, November 29 · 09:00 AM
          </p>
          <img
          className="mt-5"
          src="Students-Gala.png" width={"70%"} alt="Students Gala" />

          {/* <h1 className="mt-4 text-5xl font-extrabold text-gray-900 leading-tight">
            Student Gala <br /> Celebration of Excellence
          </h1>

          <p className="mt-6 text-gray-600 text-lg leading-relaxed">
            Join students, alumni, and faculty for an evening of celebration,
            recognition, and connection. Experience inspiring speeches,
            performances, and awards — all in one elegant night.
          </p> */}

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

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-indigo-500" />
              <div>
                <div className="font-semibold text-gray-900">Kadalundi</div>
                <div className="text-gray-500">123 Civic Avenue, City</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users size={20} className="text-indigo-500" />
              <div>
                <div className="font-semibold text-gray-900">
                  Hosted by Student Council
                </div>
                <div className="text-gray-500">
                  Open to students, alumni, and guests
                </div>
              </div>
            </div>
          </div>
        </div>

{/* Right Side (Mockup Card) */}
<div className="order-first md:order-last flex justify-center">
  <img
    src="/galamain.png"
    alt="Event Preview"
    className="w-full max-w-md md:max-w-lg object-cover"
  />
</div>
      </section>

     {/* Awards Section */}
<section id="awards" className="max-w-7xl mx-auto text-center py-20 px-6">
  <h2 className="text-3xl font-extrabold text-gray-900">Our Recent Awards</h2>
  <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
    There are many variations of passages of Lorem Ipsum available
    but the majority have suffered alteration in some form.
  </p>

  <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
    {/* Card 1 */}
    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.05)] transition hover:shadow-[0_8px_50px_rgba(99,102,241,0.15)]">
      <div className="flex flex-col items-start text-left space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white rounded-full p-2">
            ⭐
          </div>
          <h3 className="font-bold text-lg text-gray-900">4.9 Rating</h3>
        </div>

        <div className="flex items-center mt-2">
          <img
            src="https://randomuser.me/api/portraits/men/1.jpg"
            alt=""
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <img
            src="https://randomuser.me/api/portraits/women/2.jpg"
            alt=""
            className="w-8 h-8 rounded-full border-2 border-white -ml-2"
          />
          <img
            src="https://randomuser.me/api/portraits/men/3.jpg"
            alt=""
            className="w-8 h-8 rounded-full border-2 border-white -ml-2"
          />
          <span className="ml-3 text-sm font-medium text-gray-600">
            +195K raters
          </span>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed mt-2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          In vulputate vitae massa eu dapibus ligula.
        </p>

        <a
          href="#"
          className="mt-3 inline-flex items-center text-indigo-600 font-semibold text-sm hover:underline"
        >
          Rate Our Application →
        </a>
      </div>
    </div>

    {/* Card 2 */}
    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.05)] transition hover:shadow-[0_8px_50px_rgba(99,102,241,0.15)]">
      <div className="flex flex-col items-start text-left space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white rounded-full p-2">
            🏆
          </div>
          <h3 className="font-bold text-lg text-gray-900">Awwwards</h3>
        </div>

        <h4 className="text-gray-900 font-semibold">
          Best of trendy design in{" "}
          <span className="text-indigo-600 font-bold">2024</span> on Awwwards
        </h4>

        <p className="text-gray-500 text-sm leading-relaxed mt-1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          In vulputate vitae massa eu dapibus ligula.
        </p>

        <a
          href="#"
          className="mt-3 inline-flex items-center text-indigo-600 font-semibold text-sm hover:underline"
        >
          Go to Awards →
        </a>
      </div>
    </div>

    {/* Card 3 */}
    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.05)] transition hover:shadow-[0_8px_50px_rgba(99,102,241,0.15)]">
      <div className="flex flex-col items-start text-left space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white rounded-full p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM8 10h2v6H8v-6zm6 0h2v6h-2v-6z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-gray-900">Appwind.</h3>
        </div>

        <h4 className="text-gray-900 font-semibold">
          Appwind is the best app for online payments.
        </h4>

        <p className="text-gray-500 text-sm leading-relaxed mt-1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          In vulputate vitae massa eu dapibus ligula.
        </p>

        <a
          href="#"
          className="mt-3 inline-flex items-center text-indigo-600 font-semibold text-sm hover:underline"
        >
          Know More →
        </a>
      </div>
    </div>
  </div>
</section>

    </div>
  );
}
