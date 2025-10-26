import React from "react";
import { Calendar, MapPin, Users, Mail, Award } from "lucide-react";
import Link from "next/link";
import Footer from "./Footer";

// Student Gala Landing Page - React + Tailwind
// Usage: Paste this component into a React app (Create React App, Vite, Next.js).
// Make sure Tailwind CSS is configured in your project.

export default function StudentGalaLanding() {

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header / Hero */}
      

      <main className="max-w-6xl mx-auto px-6 py-12">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm text-indigo-600 font-medium flex items-center gap-2"><Calendar size={16} /> Saturday, November 29 · 09:00 AM</p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight">Student Gala — An Evening of Achievement</h2>
            <p className="mt-4 text-gray-600">Join students, alumni, and faculty for a formal celebration featuring keynote addresses, performances, awards, and a fundraising auction. Dress: Black Tie Optional.</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/studentsgala/register" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold">Regesiter Now</Link>
              {/* <a href="#program" className="inline-block border border-gray-300 px-6 py-3 rounded-md text-sm">View Program</a> */}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <MapPin size={20} />
                <div>
                  <div className="font-semibold">Kadalundi</div>
                  <div className="text-gray-500">123 Civic Avenue, Your City</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users size={20} />
                <div>
                  <div className="font-semibold">Hosted by Student Council</div>
                  <div className="text-gray-500">Open to students, alumni, and invited guests</div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-first md:order-last">
            {/* Elegant card with event image placeholder */}
            <div className="rounded-2xl shadow-lg overflow-hidden bg-gradient-to-br from-white to-gray-100">
              <div className="p-6">
                <div className="h-full w-full bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                    <img src="/gala.jpeg" alt="" />
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="mt-16 bg-white rounded-2xl p-8 shadow">
          <h3 className="text-2xl font-semibold">About the Gala</h3>
          <p className="mt-4 text-gray-600">The Student Gala is an annual celebration recognizing outstanding student achievements across academics, leadership, and community service. This formal evening brings together the broader campus community to celebrate successes and raise funds for student scholarships.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3"><Award size={20} /><div className="font-semibold">Awards</div></div>
              <p className="mt-2 text-sm text-gray-600">Honouring students across multiple categories.</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3"><Users size={20} /><div className="font-semibold">Community</div></div>
              <p className="mt-2 text-sm text-gray-600">A night to reconnect with alumni and faculty.</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3"><Mail size={20} /><div className="font-semibold">Scholarships</div></div>
              <p className="mt-2 text-sm text-gray-600">Funds raised support student scholarships and initiatives.</p>
            </div>
          </div>
        </section>

      {/* <Footer/> */}
      </main>
    </div>
  );
}
