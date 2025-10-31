"use client";
import React from "react";
import { motion } from "framer-motion";
import LogoSlider from "./LogoSlider";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 md:px-16 min-h-screen"
        style={{
          backgroundImage: "url('/3.jpg')", // replace with uploaded image path
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        
  <div className="absolute inset-0 bg-linear-to-br from-white-50 via-black to-white-100 opacity-70"></div>

        <motion.div
          className="relative z-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
            Energizing a <span className="text-green-400">Green Future</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-900 mb-8 leading-relaxed">
            Our commitment to green energy is paving the way for a cleaner,
            healthier planet. Join us on a journey towards a future where clean,
            renewable energy sources transform the way we power our lives.
          </p>
 <div className="flex justify-center gap-4 mt-6">
  <Link href="/studentsgala">
    <button className="px-8 py-3 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-gray-900 font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300">
      Students Gala
    </button>
  </Link>

  <Link href="https://sahityotsav.ssfkozhikodesouth.in/">
    <button className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-gray-900 font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300">
      Sahityotsav
    </button>
  </Link>
</div>

        </motion.div>
      </section>

      {/* Stats Section
      <section className="bg-white py-16 text-center">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">550+</h3>
            <p className="text-gray-500 text-sm mt-2">
              Units
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">70+</h3>
            <p className="text-gray-500 text-sm mt-2">
              Sectors
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">10</h3>
            <p className="text-gray-500 text-sm mt-2">
              Divisions
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">100000+</h3>
            <p className="text-gray-500 text-sm mt-2">
              Memberships
            </p>
          </div>
        </div>
      </section> */}

      {/* Logo Slider */}
      <LogoSlider />
    </div>
  );
};

export default LandingPage;
