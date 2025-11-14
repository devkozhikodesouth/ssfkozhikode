"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const StudentsGalaInfo = () => {
  const slides = [
    {
      title: "About SSF",
      image: "/swipe1.jpeg",
      content: (
        <>
          <p className="leading-relaxed text-gray-700">
            The <strong>Sunni Students’ Federation (SSF)</strong> is a national
            student organization committed to nurturing the intellectual,
            moral, and social development of students across India.
          </p>
          <p className="leading-relaxed text-gray-700 mt-3">
            Through its diverse educational, cultural, and leadership programs,
            SSF empowers young people to become <em>informed thinkers</em>,
            <em> responsible citizens</em>, and
            <em> compassionate leaders</em>.
          </p>
        </>
      ),
    },
    {
      title: "About the Event",
      image: "/gala.jpeg",
      content: (
        <>
          <p className="leading-relaxed text-gray-700 mb-3">
            <strong>Students Gala</strong> is an exciting gathering for higher
            secondary students, organized by
            <strong> SSF Kozhikode South District</strong>. The event takes
            place on <strong>November 29 at Kadalundi, Feroke</strong>.
          </p>
          <p className="leading-relaxed text-gray-700">
            It’s more than an event — it’s a <strong>platform for growth</strong>,
            enabling young minds to learn, share, collaborate, and explore.
          </p>
        </>
      ),
    },
    {
      title: "Program Highlights",
      image: "/swipe2.jpeg",
      content: (
        <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-1">
          <li><strong>Inspiring talks</strong> from scholars and experts.</li>
          <li><strong>Panel discussions</strong> on innovation & technology.</li>
          <li><strong>Interactive workshops</strong> for creativity & skills.</li>
          <li>Sessions linking <strong>academics & real-world experience</strong>.</li>
        </ul>
      ),
    },
    {
      title: "Theme — “No Cap, It’s Tomorrow”",
      image: "/sproute.jpeg",
      content: (
        <>
          <p className="leading-relaxed text-gray-700 mb-3">
            The theme represents fearless optimism and authentic youth voices —
            calling students to <strong>be real, be bold, and believe</strong>
            in shaping the future.
          </p>
          <p className="leading-relaxed text-gray-700">
            Tomorrow isn’t something that arrives by itself —
            <strong> it is built through unity, knowledge, and action.</strong>
          </p>
        </>
      ),
    },
    {
      title: "The Spirit of Students Gala",
      image: "/swipe3.jpeg",
      content: (
        <>
          <p className="leading-relaxed text-gray-700 mb-3">
            Students Gala inspires youth to <strong>dream big, act boldly,
            and move forward with purpose</strong>.
          </p>
          <p className="font-semibold text-indigo-700 text-lg">
            Together we create change — <em>No Cap.</em>
          </p>
        </>
      ),
    },
  ];

  return (
    <section className="bg-gray-50 text-gray-800 py-14 px-4 md:px-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-indigo-700 mb-12">
        Students Gala Info
      </h1>

      <div className="relative max-w-4xl mx-auto">
        <Swiper
          modules={[Pagination, Navigation]}
          pagination={{ clickable: true }}
          navigation
          spaceBetween={25}
          slidesPerView={1}
          className="gala-swiper"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12 flex flex-col md:flex-row items-center gap-6 transition-all duration-300 hover:shadow-2xl">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full md:w-1/2 rounded-2xl object-cover shadow-sm"
                />
                <div className="md:w-1/2 space-y-3">
                  <h2 className="text-2xl md:text-3xl font-semibold">
                    {slide.title}
                  </h2>
                  {slide.content}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default StudentsGalaInfo;
