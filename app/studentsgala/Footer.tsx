import React from 'react'
  import { Calendar, MapPin } from "lucide-react";
  
const Footer = () => {
      const speakers = [
    { name: "Dr. Aisha Rao", title: "Keynote Speaker — Education Innovator" },
    { name: "Prof. R. Mehta", title: "Guest of Honour — Alumni Relations" },
    { name: "Jamie Ortiz", title: "Student MC & Performer" },
  ];

  const schedule = [
    { time: "6:00 PM", title: "Welcome Reception" },
    { time: "7:00 PM", title: "Opening Remarks & Dinner" },
    { time: "8:30 PM", title: "Awards & Performances" },
    { time: "10:00 PM", title: "Closing Toast" },
  ];

  return (
    <div>
        <main>
              {/* Program / Schedule */}
        <section id="program" className="mt-10">
          <h3 className="text-2xl font-semibold">Program</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="font-semibold">Evening Timeline</h4>
              <ul className="mt-4 space-y-3 text-gray-700">
                {schedule.map((s) => (
                  <li key={s.time} className="flex items-start gap-4">
                    <div className="font-mono text-sm text-indigo-600 w-20">{s.time}</div>
                    <div>{s.title}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="font-semibold">Venue & Logistics</h4>
              <p className="mt-3 text-gray-600">Grand Hall provides wheelchair access, reserved seating for VIP guests, and a cloakroom. Valet parking and nearby public transport available.</p>

              <div className="mt-4 text-sm text-gray-700 space-y-2">
                <div className="flex items-center gap-3"><MapPin size={16} /><div>123 Civic Avenue, Your City</div></div>
                <div className="flex items-center gap-3"><Calendar size={16} /><div>Friday, December 12 · 6:00 PM</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* Speakers / Guests */}
        <section id="speakers" className="mt-10">
          <h3 className="text-2xl font-semibold">Guests & Speakers</h3>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {speakers.map((sp) => (
              <div key={sp.name} className="bg-white p-5 rounded-xl shadow text-center">
                <div className="h-24 w-24 rounded-full bg-gray-200 mx-auto flex items-center justify-center text-gray-500">Photo</div>
                <div className="mt-4 font-semibold">{sp.name}</div>
                <div className="mt-1 text-sm text-gray-500">{sp.title}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Registration
        <section id="register" className="mt-12 bg-indigo-50 p-8 rounded-2xl">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold">Register to Attend</h3>
            <p className="mt-2 text-gray-700">Reserve your seat — limited capacity. Kindly RSVP with your name and email.</p>

            <form className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={(e) => e.preventDefault()}>
              <input aria-label="Full name" className="md:col-span-1 rounded-md border p-3" placeholder="Full name" />
              <input aria-label="Email" className="md:col-span-1 rounded-md border p-3" placeholder="Email address" />
              <button className="md:col-span-1 bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold">Submit RSVP</button>
            </form>

            <p className="mt-3 text-sm text-gray-500">After submitting, you will receive a confirmation email with event details.</p>
          </div>
        </section> */}

        {/* Sponsors */}
        <section className="mt-10">
          <h3 className="text-xl font-semibold">Sponsors</h3>
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <div className="h-12 w-28 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-500">Sponsor A</div>
            <div className="h-12 w-28 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-500">Sponsor B</div>
            <div className="h-12 w-28 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-500">Sponsor C</div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 py-8 text-sm text-gray-600">
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between">
            <div>© {new Date().getFullYear()} Student Gala • Student Council</div>
            <div className="mt-3 md:mt-0">Questions? <a href="mailto:events@school.edu" className="underline">events@school.edu</a></div>
          </div>
        </footer>
        </main>
    </div>
  )
}

export default Footer