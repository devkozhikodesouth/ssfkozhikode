import React from "react";

const StudentsGalaInfo = () => {
  return (
    <section className="bg-gray-50 text-gray-800 py-16 px-6 md:px-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-700">
            Students Gala
          </h1>
          <p className="text-xl text-gray-600 font-medium">No Cap, It’s Tomorrow</p>
        </div>

        {/* About SSF */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">About SSF</h2>
          <p className="mt-3 leading-relaxed">
            The <strong>Sunni Students’ Federation (SSF)</strong> is a national student
            organization committed to nurturing the intellectual, moral, and social
            development of students across India. Through its diverse educational,
            cultural, and leadership programs, SSF empowers young people to become{" "}
            <em>informed thinkers</em>, <em>responsible citizens</em>, and{" "}
            <em>compassionate leaders</em> dedicated to building a better society.
          </p>
        </div>

        {/* About the Event */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">About the Event</h2>
          <p className="mt-3 leading-relaxed">
            <strong>Students Gala</strong> is an exciting and empowering gathering designed
            exclusively for higher secondary students. Organized by{" "}
            <strong>SSF Kozhikode South District</strong>, the event will take place on{" "}
            <strong>November 29 at Kadalundi, Feroke</strong> — a vibrant celebration of
            youth, learning, and the power of tomorrow.
          </p>
          <p className="mt-3 leading-relaxed">
            More than just an event, Students Gala is a <strong>platform for growth and
            connection</strong>. It brings together young minds from across the region to{" "}
            <strong>learn, share, and explore</strong> their potential through meaningful
            dialogue, collaboration, and creativity.
          </p>
        </div>

        {/* Program Highlights */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Program Highlights</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 leading-relaxed">
            <li>
              <strong>Inspiring talks</strong> by renowned scholars focusing on education,
              values, and purposeful living.
            </li>
            <li>
              <strong>Panel discussions</strong> with industry experts offering insights
              into innovation, technology, and the future.
            </li>
            <li>
              <strong>Interactive workshops</strong> designed to boost creativity,
              confidence, and leadership skills.
            </li>
            <li>
              Sessions that <strong>bridge the gap between academics and real-world
              experience</strong>, helping students envision their role as tomorrow’s
              leaders and changemakers.
            </li>
          </ul>
        </div>

        {/* Theme Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Theme: “No Cap, It’s Tomorrow”
          </h2>
          <p className="mt-3 leading-relaxed">
            The theme <strong>“No Cap, It’s Tomorrow”</strong> reflects the fearless
            optimism and authenticity of today’s youth. It calls on students to{" "}
            <strong>be real, be bold, and believe</strong> in their ability to shape the
            future.
          </p>
          <p className="mt-3 leading-relaxed">
            Tomorrow isn’t something that simply arrives — it’s something we{" "}
            <strong>create through choices, learning, and unity</strong>. This theme reminds
            every participant that the <strong>power to define the future lies in their
            hands</strong>.
          </p>
        </div>

        {/* Spirit of the Event */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            The Spirit of Students Gala
          </h2>
          <p className="mt-3 leading-relaxed">
            Students Gala is an <strong>invitation to dream big, act boldly, and move
            forward with purpose</strong>. It celebrates youthful energy, shared ideas, and
            a collective vision for a brighter tomorrow.
          </p>
          <p className="mt-3 font-medium text-indigo-700">
            Together, we create change — <em>No Cap.</em>
          </p>
        </div>
      </div>
    </section>
  );
};

export default StudentsGalaInfo;
