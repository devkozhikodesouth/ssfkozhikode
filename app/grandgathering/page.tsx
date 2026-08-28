"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
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

export default function GrandGatheringPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen text-slate-900 selection:bg-purple-500 selection:text-white">
      {/* ================= HERO SECTION ================= */}
      <div className="relative z-10 pt-28 sm:pt-24 pb-6 sm:pb-8 px-3.5 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* LEFT CONTENT */}
          <motion.div
            variants={containerAnim}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* Organization Badge */}
            <motion.div variants={itemAnim} className="w-fit">
                <span className="text-xs sm:text-sm font-medium uppercase  -ms-15 sm:ms-0 tracking-widest text-purple-700 mb-2">SSF Kozhikode South</span>
            </motion.div>

            {/* Typography Heading Image */}
            <motion.div variants={itemAnim} className="mb-2 sm:mb-4 flex justify-center lg:justify-start">
              <img
                src="/typoconclave26.webp"
                alt="Grand Conclave 26"
                className="h-75 sm:h-75 md:h-80 w-auto max-w-full object-contain drop-shadow-sm"
              />
            </motion.div>

            <motion.p
              variants={itemAnim}
              className="text-xs sm:text-base lg:text-lg text-slate-600 max-w-xl font-normal leading-snug sm:leading-relaxed mb-3 sm:mb-4 px-1 sm:px-0"
            >
              The grand delegate conference empowering student leadership across sectors & divisions in Kozhikode South.
            </motion.p>

            {/* Event Info (Date & Time on row 1, Venue on row 2) */}
            <motion.div
              variants={itemAnim}
              className="w-full max-w-xl my-4 sm:my-5 space-y-2.5 sm:space-y-3"
            >
              {/* Row 1: Date & Time */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                {/* Date */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 p-2.5 sm:p-3.5 rounded-2xl bg-white/90 border border-purple-200/90 backdrop-blur-md shadow-sm">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] sm:text-xs text-purple-700 font-medium uppercase tracking-wider">Date</p>
                    <p className="text-sm sm:text-base font-medium text-slate-900 truncate">Sep 10, 2026</p>
                    <p className="text-[10px] sm:text-xs text-amber-600 font-normal hidden sm:block">Thursday</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 p-2.5 sm:p-3.5 rounded-2xl bg-white/90 border border-purple-200/90 backdrop-blur-md shadow-sm">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] sm:text-xs text-indigo-700 font-medium uppercase tracking-wider">Time</p>
                    <p className="text-sm sm:text-base font-medium text-slate-900 truncate">5:30 PM</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-normal hidden sm:block">Evening</p>
                  </div>
                </div>
              </div>

              {/* Row 2: Venue */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 p-2.5 sm:p-3.5 rounded-2xl bg-white/90 border border-purple-200/90 backdrop-blur-md shadow-sm">
                <div className="p-2 sm:p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[10px] sm:text-xs text-amber-700 font-medium uppercase tracking-wider">Venue</p>
                  <p className="text-sm sm:text-base font-medium text-slate-900 truncate">Jamia Markaz, Karanthur</p>
                </div>
              </div>
            </motion.div>

            {/* Countdown Component */}
            <motion.div variants={itemAnim} className="w-full my-2 sm:my-3">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-widest text-purple-700 mb-2">
                Event Starts In
              </p>
              <CountDown />
            </motion.div>

            {/* Register CTA Button */}
            <motion.div variants={itemAnim} className="w-full mt-4 sm:mt-6">
              <button
                onClick={scrollToForm}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl text-white font-medium text-base sm:text-lg shadow-xl shadow-purple-900/25 bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Ticket className="w-5 h-5" />
                <span>Register Now</span>
              </button>
            </motion.div>
          </motion.div>

          {/* RIGHT EVENT EMBLEM CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden sm:flex lg:col-span-5 justify-center mt-6 lg:mt-0"
          >
            <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-white/90 border border-purple-200 backdrop-blur-2xl shadow-xl flex flex-col justify-between items-center text-center">
              <div className="w-full flex justify-between items-center text-xs text-purple-700 font-mono border-b border-purple-100 pb-3">
                <span className="flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  OFFICIAL DELEGATE PORTAL
                </span>
                <span className="bg-purple-100 px-2 py-0.5 rounded-full text-purple-800 font-medium">DELEGATE PORTAL</span>
              </div>

              <div className="my-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-[2px] mb-4 shadow-xl shadow-purple-500/20 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-purple-50 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-amber-500" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-wide">
                  SSF KOZHIKODE SOUTH
                </h3>
                <p className="text-sm sm:text-base text-purple-700 mt-1 font-normal">
                  Grand Conclave 26 Delegate Conference
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-xs border-t border-purple-100 pt-3 text-slate-700">
                <div className="bg-purple-50/70 rounded-xl p-2.5 border border-purple-200/60">
                  <span className="block text-[10px] text-purple-700 font-medium uppercase">LOCATION</span>
                  <span className="text-sm font-medium text-slate-900">Jamia Markaz, Karanthur</span>
                </div>
                <div className="bg-purple-50/70 rounded-xl p-2.5 border border-purple-200/60">
                  <span className="block text-[10px] text-purple-700 font-medium uppercase">DATE & TIME</span>
                  <span className="text-sm font-medium text-slate-900">Sep 10, 5:30 PM</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Scroll Prompt */}
        <div className="flex justify-center pt-6 sm:pt-10">
          <button
            onClick={scrollToForm}
            className="flex flex-col items-center gap-1.5 text-purple-600 hover:text-purple-800 transition text-xs font-medium uppercase tracking-wider cursor-pointer"
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
