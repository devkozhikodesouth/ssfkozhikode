"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Sparkles, ChevronDown, Ticket, ShieldCheck } from "lucide-react";

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

export default function GrandConclaveLanding() {
  const formRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 text-white selection:bg-emerald-500 selection:text-white">
      {/* Clean Ambient Soft Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-emerald-600/15 via-teal-600/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px]" />
      </div>

      {/* ================= HERO SECTION ================= */}
      <div className="relative z-10 pt-20 pb-12 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT CONTENT */}
          <motion.div
            variants={containerAnim}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <motion.div variants={itemAnim} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/50 border border-emerald-400/30 text-emerald-200 text-xs sm:text-sm font-semibold backdrop-blur-md mb-4 shadow-lg shadow-emerald-950/40">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span><span className="font-cooper">SSF</span> Kozhikode South</span>
            </motion.div>

            <motion.h1
              variants={itemAnim}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-4"
            >
              GRAND <br />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                CONCLAVE
              </span>
            </motion.h1>

            <motion.p
              variants={itemAnim}
              className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-xl font-normal leading-relaxed mb-6 px-2 sm:px-0"
            >
              The premier leadership assembly gathering organization leaders and delegates across Kozhikode South district.
            </motion.p>

            {/* Event Info Grid Cards */}
            <motion.div
              variants={itemAnim}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mb-6"
            >
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md shadow-md">
                <div className="p-2.5 rounded-xl bg-emerald-600/30 text-emerald-300 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-emerald-300/80 font-semibold uppercase tracking-wider">Date</p>
                  <p className="text-sm font-bold text-white">Delegates Meet</p>
                  <p className="text-[11px] text-amber-300 font-medium">2026 Edition</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md shadow-md">
                <div className="p-2.5 rounded-xl bg-teal-600/30 text-teal-300 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-teal-300/80 font-semibold uppercase tracking-wider">Time</p>
                  <p className="text-sm font-bold text-white">Official Session</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md shadow-md">
                <div className="p-2.5 rounded-xl bg-amber-600/30 text-amber-300 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-amber-300/80 font-semibold uppercase tracking-wider">Venue</p>
                  <p className="text-sm font-bold text-white">Kozhikode</p>
                  <p className="text-[11px] text-slate-300">South District</p>
                </div>
              </div>
            </motion.div>

            {/* Countdown Component */}
            <motion.div variants={itemAnim} className="w-full">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-300/80 mb-2">
                Conclave Assembly Countdown
              </p>
              <CountDown />
            </motion.div>

            {/* Register CTA Button */}
            <motion.div variants={itemAnim} className="w-full mt-6">
              <button
                onClick={scrollToForm}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl text-white font-extrabold text-lg shadow-xl shadow-emerald-950/50 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                <Ticket className="w-5 h-5" />
                <span>Register Delegate</span>
              </button>
            </motion.div>
          </motion.div>

          {/* RIGHT EMBLEM CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 flex justify-center mt-6 lg:mt-0"
          >
            <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl flex flex-col justify-between items-center text-center">
              <div className="w-full flex justify-between items-center text-xs text-emerald-300/80 font-mono border-b border-emerald-500/20 pb-3">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  GRAND CONCLAVE
                </span>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-200">LEADERSHIP PORTAL</span>
              </div>

              <div className="my-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-emerald-600 to-amber-400 p-[2px] mb-4 shadow-xl shadow-emerald-500/20 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-amber-300" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wider">
                  <span className="font-cooper">SSF</span> KOZHIKODE SOUTH
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
                  Grand Conclave Leadership Conference
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-xs border-t border-emerald-500/20 pt-3 text-slate-300">
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-emerald-500/10">
                  <span className="block text-[10px] text-emerald-300 font-semibold uppercase">LOCATION</span>
                  <span className="font-bold text-white">Kozhikode South</span>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-emerald-500/10">
                  <span className="block text-[10px] text-emerald-300 font-semibold uppercase">PORTAL STATUS</span>
                  <span className="font-bold text-emerald-400">ACTIVE DELEGATES</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Scroll Prompt */}
        <div className="flex justify-center pt-10">
          <button
            onClick={scrollToForm}
            className="flex flex-col items-center gap-1.5 text-emerald-300/60 hover:text-emerald-300 transition text-xs font-bold uppercase tracking-wider"
          >
            <span>Fill Registration Form</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </div>

      {/* ================= FORM SECTION ================= */}
      <section
        ref={formRef}
        className="relative z-10 max-w-4xl mx-auto py-12 px-4 sm:px-6 md:px-12 scroll-mt-16"
      >
        <RegistrationForm />
      </section>

      <TicketModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
