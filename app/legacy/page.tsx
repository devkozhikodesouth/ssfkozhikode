"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Ticket } from "lucide-react";

import CountDown from "./CountDown";
import RegistrationForm from "./RegistrationForm";

const containerAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LegacyPage() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen text-white selection:bg-[#E415A3] selection:text-white relative font-legacy-body">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#3A0A7A]">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-legacy-radial-1 animate-bgGlow" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-legacy-radial-2 animate-bgGlow animate-colorFade" />
      </div>

      {/* ================= HERO SECTION ================= */}
      <div className="relative z-10 pt-16 sm:pt-24 pb-6 sm:pb-8 px-3.5 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center relative">

          {/* LEFT CONTENT */}
          <motion.div
            variants={containerAnim}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left order-1 lg:order-1"
          >
            {/* Organization Badge */}
            <motion.div variants={itemAnim} className="mt-10">
              <span className="text-sm font-semibold uppercase tracking-widest text-fuchsia-100 mb-2">
                <span className="font-cooper">SSF</span> Kozhikode South
              </span>
            </motion.div>

            {/* Typography Heading Image */}
            <motion.div variants={itemAnim} className="mt-4 mb-2 sm:mb-4 flex justify-center lg:justify-start">
              <img
                src="/legacytitle.png"
                alt="It’s our Legacy — Izza code Gather"
                className="h-32 sm:h-52 lg:h-60 w-auto max-w-full object-contain drop-shadow-[0_6px_24px_rgba(58,10,122,0.45)]"
              />
            </motion.div>

            <motion.p
              variants={itemAnim}
              className="text-xs sm:text-base hidden sm:block lg:text-lg text-white/90 max-w-xl font-normal leading-snug sm:leading-relaxed mt-3 mb-3 sm:mb-4 px-1 sm:px-0"
            >
              Samastha Centenary — Izza Code gathering of <span className="font-cooper">SSF</span> Kozhikode South, towards the Jilla Rally.
            </motion.p>

            {/* Date & Venue Image */}
            <motion.div variants={itemAnim} className="w-full max-w-xl my-4 sm:my-6 flex justify-center lg:justify-start">
              <img
                src="/legacydatetime.png"
                alt="2026 Sep 27, Sunday 12.00 PM — Cheenadath, Puthiyangadi"
                className="h-auto w-[78%] sm:w-full max-w-[520px] object-contain"
              />
            </motion.div>

            {/* Countdown Component */}
            <motion.div variants={itemAnim} className="w-full my-2 sm:my-3">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-fuchsia-200 mb-2">
                Event Starts In
              </p>
              <CountDown />
            </motion.div>

            {/* Register CTA Button */}
            <motion.div variants={itemAnim} className="w-full mt-4 sm:mt-6">
              <button
                onClick={scrollToForm}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl text-white font-semibold text-base sm:text-lg shadow-xl shadow-[#3A0A7A]/40 bg-gradient-to-r from-[#A712AA] via-[#D6229F] to-[#E415A3] hover:from-[#D6229F] hover:to-[#E415A3] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Ticket className="w-5 h-5" />
                <span>Register Now</span>
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* Scroll Prompt */}
        <div className="flex justify-center pt-6 sm:pt-10">
          <button
            onClick={scrollToForm}
            className="flex flex-col items-center gap-1.5 text-fuchsia-100 hover:text-white transition text-xs font-medium uppercase tracking-wider cursor-pointer"
          >
            <span>Fill Registration Form</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </div>

      {/* ================= FORM SECTION ================= */}
      <section
        ref={formRef}
        className="relative z-10 max-w-4xl mx-auto pb-12 px-4 sm:px-6 md:px-12"
      >
        <RegistrationForm />
      </section>
    </div>
  );
}
