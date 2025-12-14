"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Colors } from "../../constants/colors";

import CountDown from "../CountDown";
import TicketModal from "../../components/TicketModal";

import { motion } from "framer-motion";
import RegistrationForm from "./RegistrationForm";

export default function StudentGalaLanding() {
  const formRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Hero Background Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-[#FDE047] via-[#FACC15] to-[#EAB308] bg-[url('/bg-texture.png')] bg-cover bg-center bg-no-repeat overflow-hidden">

        {/* Decorative Images */}
        <img
          src="/left-decor.png"
          alt="decor-left"
          className="absolute top-[540px] -z-50 -left-40 md:left-0 min-w-44 md:w-80 opacity-80 pointer-events-none select-none"
        />
        <img
          src="/right-decor.png"
          alt="decor-right"
          className="absolute top-0 -right-40 md:right-0 min-w-44 md:w-80 opacity-80 pointer-events-none select-none"
        />

        {/* HERO SECTION */}
        <section className="md:pt-24 mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-6 md:px-12">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="md:pl-24 flex flex-col items-center justify-center text-center"
          >
            <motion.img
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.6, 1.1, 1], opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="md:mt-10 mx-auto"
              src="/galaHeading.png"
              width={"70%"}
              alt="Students Gala"
            />

            {/* REGISTER BUTTON */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="mt-6 md:mt-8 w-full flex justify-center"
            >
              <button
                onClick={scrollToForm}
                className="w-full md:w-2/3 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl 
                bg-gradient-to-r from-red-500 to-blue-500 backdrop-blur-xl
                hover:opacity-90 active:scale-95 transition-all duration-300"
              >
                Register Now
              </button>
            </motion.div>

            {/* COUNTDOWN TIMER */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-4 md:mt-8 flex justify-center w-full"
            >
              <CountDown />
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-first md:order-last relative mt-20 md:mt-0 flex flex-col items-center text-center px-4 md:px-0 max-w-xl mx-auto"
          >
            <img
              src="/left-top-icon.png"
              alt=""
              className="absolute top-6 md:-top-14 -left-14 w-20 md:w-28"
            />

            <img
              src="/no-cap.png"
              alt="Students Gala"
              className="w-64 md:w-80 object-contain mb-6"
            />

            <p className="text-base md:text-lg leading-relaxed font-medium text-gray-700">
              Students' Gala, a district-level celebration of knowledge,
              creativity, and innovation! Bringing together thousands of higher
              secondary students, Students Gala 2025 features inspiring sessions
              on higher education, entrepreneurship, AI, and emerging
              technologies, along with vibrant arts competitions and team
              activities.
            </p>

            <img
              src="/bottom-right-icon.png"
              alt=""
              className="absolute -bottom-14 md:-bottom-30 -right-14 w-20 md:w-28"
            />
          </motion.div>
        </section>
      </div>

      {/* FORM SECTION */}
      <section ref={formRef} className="mt-24 mb-20 px-6 md:px-12 scroll-mt-24">
        <RegistrationForm />
      </section>

      {/* MODAL */}
      <TicketModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
