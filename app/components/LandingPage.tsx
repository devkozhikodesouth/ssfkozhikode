"use client";
import React from "react";
import { motion } from "framer-motion";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Navbar */}

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-8 py-20">
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Empowering the Next Generation
          </h1>
          <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
            Join us in building a better future through education, innovation, and community service.
          </p>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
            Join Us
          </button>
        </motion.div>

        <motion.div
          className="md:w-1/2 flex justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img 
            src="/logo.png"
            alt="Organization"
            className="w-60 md:w-[300px]"
          />
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="px-8 py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6">About Us</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our organization is dedicated to empowering individuals and communities through
            innovative programs, leadership development, and social initiatives.
          </p>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="px-8 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-10">Our Programs</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Education", desc: "Workshops, seminars, and training." },
              { title: "Community", desc: "Volunteer-driven outreach initiatives." },
              { title: "Innovation", desc: "Encouraging creativity and technology." },
            ].map((program, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md"
              >
                <h3 className="text-xl font-semibold mb-3 text-green-600">{program.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{program.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-green-600 text-white py-16 px-8 text-center">
        <h2 className="text-3xl font-semibold mb-4">Get in Touch</h2>
        <p className="mb-6">Have questions or want to join us? Reach out today.</p>
        <button className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
          Contact Us
        </button>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        © {new Date().getFullYear()} Your Organization. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
