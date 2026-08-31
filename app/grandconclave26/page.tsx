"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Calendar, Clock, MapPin, Sparkles, ChevronDown, Users, ShieldCheck, Ticket } from "lucide-react";

import CountDown from "./CountDown";
import TicketModal from "../components/TicketModal";
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

export default function GrandConclave26Page() {
  const formRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const { scrollYProgress } = useScroll();

  // Scroll animations for flight.png (Right -> Top -> Left -> Bottom)
  const yRaw = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6], [0, -120, -60, 380]);
  const xRaw = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6], [0, 80, -150, -240]);
  const rotateRaw = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6], [350, 260, 170, 80]);
  const scaleRaw = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6], [1, 0.9, 0.8, 0.7]);

  // Spring physics for ultra-smooth scroll lag
  const springConfig = { damping: 20, stiffness: 90, mass: 0.4 };
  const yVal = useSpring(yRaw, springConfig);
  const xVal = useSpring(xRaw, springConfig);
  const rotateVal = useSpring(rotateRaw, springConfig);
  const scaleVal = useSpring(scaleRaw, springConfig);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen text-white selection:bg-rose-500 selection:text-white relative">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#ffab96]">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-conclave26-radial-1 animate-bgGlow" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-conclave26-radial-2 animate-bgGlow animate-colorFade" />
      </div>

      {/* ================= HERO SECTION ================= */}
      <div className="relative z-10 pt-16 sm:pt-24 pb-6 sm:pb-8 px-3.5 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            variants={containerAnim}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* Organization Badge */}
            <motion.div variants={itemAnim} className="">
              <span className="text-xs sm:text-sm font-semibold uppercase -ms-42 sm:ms-0 tracking-widest text-rose-200 mb-2">
                <span className="font-cooper">SSF</span> Kozhikode South
              </span>
            </motion.div>

            {/* Typography Heading Image */}
            <motion.div variants={itemAnim} className="mb-2 sm:mb-4 flex justify-center lg:justify-start">
              <img
                src="/typoconclave26.webp"
                alt="Grand Conclave 26"
                className="h-45 sm:h-75 md:h-80 w-auto max-w-full object-contain drop-shadow-sm brightness-110"
              />
            </motion.div>

            <motion.p
              variants={itemAnim}
              className="text-xs sm:text-base hidden md:block lg:text-lg text-white/90 max-w-xl font-normal leading-snug sm:leading-relaxed mb-3 sm:mb-4 px-1 sm:px-0"
            >
              The grand delegate conference empowering student leadership across sectors & divisions in Kozhikode South.
            </motion.p>

            {/* Event Info (All in ONE Box) */}
            <motion.div
              variants={itemAnim}
              className="w-full max-w-xl my-4 sm:my-6 p-4 sm:p-5 rounded-3xl bg-rose-950/40 border border-rose-500/30 backdrop-blur-md shadow-lg divide-y divide-rose-800/50 space-y-3.5"
            >
              {/* Date & Time Row */}
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-rose-500/20 text-rose-200 shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-rose-200 font-medium uppercase tracking-wider">Date & Time</p>
                  <p className="text-base sm:text-lg font-medium text-white truncate">
                    Sep 10, 2026 • 5:30 PM
                  </p>
                  <p className="text-xs text-amber-300 font-normal">Thursday Evening</p>
                </div>
              </div>

              {/* Venue Row */}
              <div className="flex items-center gap-3.5 sm:gap-4 pt-3.5">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/20 text-amber-300 shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-amber-300 font-medium uppercase tracking-wider">Venue</p>
                  <p className="text-base sm:text-lg font-medium text-white truncate">
                    Jamia Markaz, Karanthur
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Countdown Component */}
            <motion.div variants={itemAnim} className="w-full my-2 sm:my-3">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-rose-200 mb-2">
                Event Starts In
              </p>
              <CountDown />
            </motion.div>

            {/* Register CTA Button */}
            <motion.div variants={itemAnim} className="w-full mt-4 sm:mt-6">
              <button
                onClick={scrollToForm}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl text-white font-medium text-base sm:text-lg shadow-xl shadow-rose-900/25 bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Ticket className="w-5 h-5" />
                <span>Register Now</span>
              </button>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE FLIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden sm:flex lg:col-span-5 justify-center items-center mt-6 lg:mt-0"
          >
            <div className="relative w-full max-w-md flex justify-center items-center px-4 sm:px-0">
              {/* Subtle backglow behind the image */}
              <div className="absolute w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
              <motion.div
                style={{ y: yVal, x: xVal, rotate: rotateVal, scale: scaleVal }}
                className="relative z-10 w-full flex justify-center"
              >
                <img
                  src="/flight.png"
                  alt="Flight to Grand Conclave 26"
                  onClick={scrollToForm}
                  className="w-full h-auto max-h-[420px] object-contain drop-shadow-[0_20px_50px_rgba(255,15,71,0.25)] hover:scale-105 transition-all duration-500 active:scale-95 cursor-pointer"
                />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Scroll Prompt */}
        <div className="flex justify-center pt-6 sm:pt-10">
          <button
            onClick={scrollToForm}
            className="flex flex-col items-center gap-1.5 text-rose-200 hover:text-white transition text-xs font-medium uppercase tracking-wider cursor-pointer"
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

      <TicketModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

