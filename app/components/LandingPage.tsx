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
          backgroundImage: "url('/bafddsnner.jpg')", // replace with uploaded image path
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>

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
          <Link href="/studentsgala">   
          <button className="bg-green-400 hover:bg-green-500 text-gray-900 font-medium px-8 py-3 rounded-full shadow-md transition">
            Students Gala
          </button>
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
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
      </section>

      {/* Logo Slider */}
      <LogoSlider />
    </div>
  );
};

export default LandingPage;
