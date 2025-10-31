import React from "react";

const StudentsGalaInfo = () => {
  return (
    <section className="bg-gray-50 text-gray-800 py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-700">
            Students Gala
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            No Cap, It’s Tomorrow
          </p>
        </div>

        {/* About SSF */}
        <div className="grid md:grid-cols-2 items-center gap-10">
          <div className="flex justify-center">
            <img
              src="/gala.jpeg"
              alt="About SSF"
              className="w-3/4 md:w-2/3 rounded-2xl shadow-md object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              About SSF
            </h2>
            <p className="leading-relaxed text-gray-700">
              The <strong>Sunni Students’ Federation (SSF)</strong> is a national
              student organization committed to nurturing the intellectual,
              moral, and social development of students across India. Through
              its diverse educational, cultural, and leadership programs, SSF
              empowers young people to become{" "}
              <em>informed thinkers</em>, <em>responsible citizens</em>, and{" "}
              <em>compassionate leaders</em> dedicated to building a better
              society.
            </p>
          </div>
        </div>

        {/* About the Event */}
        <div className="grid md:grid-cols-2 items-center gap-10">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              About the Event
            </h2>
            <p className="leading-relaxed text-gray-700 mb-3">
              <strong>Students Gala</strong> is an exciting and empowering
              gathering designed exclusively for higher secondary students.
              Organized by <strong>SSF Kozhikode South District</strong>, the
              event will take place on{" "}
              <strong>November 29 at Kadalundi, Feroke</strong> — a vibrant
              celebration of youth, learning, and the power of tomorrow.
            </p>
            <p className="leading-relaxed text-gray-700">
              More than just an event, Students Gala is a{" "}
              <strong>platform for growth and connection</strong>. It brings
              together young minds to <strong>learn, share, and explore</strong>{" "}
              their potential through meaningful dialogue, collaboration, and
              creativity.
            </p>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <img
              src="/sproute.jpeg"
              alt="About Event"
              className="w-3/4 md:w-2/3 rounded-2xl shadow-md object-cover"
            />
          </div>
        </div>

        {/* Program Highlights */}
        <div className="grid md:grid-cols-2 items-center gap-10">
          <div className="flex justify-center">
            <img
              src="/gala.jpeg"
              alt="Program Highlights"
              className="w-3/4 md:w-2/3 rounded-2xl shadow-md object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Program Highlights
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                <strong>Inspiring talks</strong> by renowned scholars focusing on
                education, values, and purposeful living.
              </li>
              <li>
                <strong>Panel discussions</strong> with industry experts offering
                insights into innovation, technology, and the future.
              </li>
              <li>
                <strong>Interactive workshops</strong> to boost creativity,
                confidence, and leadership skills.
              </li>
              <li>
                Sessions that <strong>bridge academics and real-world
                experience</strong>, inspiring tomorrow’s changemakers.
              </li>
            </ul>
          </div>
        </div>

        {/* Theme Section */}
        <div className="grid md:grid-cols-2 items-center gap-10">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Theme: “No Cap, It’s Tomorrow”
            </h2>
            <p className="leading-relaxed text-gray-700 mb-3">
              The theme <strong>“No Cap, It’s Tomorrow”</strong> reflects the
              fearless optimism and authenticity of today’s youth. It calls on
              students to <strong>be real, be bold, and believe</strong> in
              their ability to shape the future.
            </p>
            <p className="leading-relaxed text-gray-700">
              Tomorrow isn’t something that simply arrives — it’s something we{" "}
              <strong>create through choices, learning, and unity</strong>.
              Every participant holds the <strong>power to define the
              future</strong>.
            </p>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <img
              src="/sproute.jpeg"
              alt="Theme Illustration"
              className="w-3/4 md:w-2/3 rounded-2xl shadow-md object-cover"
            />
          </div>
        </div>

        {/* Spirit of the Event */}
        <div className="grid md:grid-cols-2 items-center gap-10">
          <div className="flex justify-center">
            <img
              src="/gala.jpeg"
              alt="Spirit of Students Gala"
              className="w-3/4 md:w-2/3 rounded-2xl shadow-md object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              The Spirit of Students Gala
            </h2>
            <p className="leading-relaxed text-gray-700 mb-3">
              Students Gala is an <strong>invitation to dream big, act boldly,
              and move forward with purpose</strong>. It celebrates youthful
              energy, shared ideas, and a collective vision for a brighter
              tomorrow.
            </p>
            <p className="font-medium text-indigo-700 text-lg">
              Together, we create change — <em>No Cap.</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentsGalaInfo;
