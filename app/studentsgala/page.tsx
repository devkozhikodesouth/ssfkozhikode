"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Ticket, MapPin, Award, BookOpen, Clock } from "lucide-react";

import CountDown from "./CountDown";
import StudentsGalaInfo from "./StudentsGalaInfo";
import ProgramTimeline from "../components/ProgramTimeline";
import TicketModal from "../components/TicketModal";

export default function StudentGalaLanding() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white selection:bg-blue-500 selection:text-white">
      
      {/* Clean Ambient Soft Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Hero Section */}
      <div className="relative z-10 pt-20 pb-12 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Half */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/50 border border-blue-400/30 text-blue-200 text-xs sm:text-sm font-semibold backdrop-blur-md mb-4 shadow-lg shadow-blue-950/40">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>SSF Kozhikode South</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-4">
              STUDENTS' <br />
              <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-amber-200 bg-clip-text text-transparent">
                GALA
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-xl font-normal leading-relaxed mb-6 px-2 sm:px-0">
              A district-level celebration of knowledge, creativity, AI technology, and innovation bringing together higher secondary students!
            </p>

            {/* Program Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mb-6">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-blue-500/20 backdrop-blur-md shadow-md">
                <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-300 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-blue-300/80 font-semibold uppercase tracking-wider">EVENT</p>
                  <p className="text-sm font-bold text-white">Students' Gala</p>
                  <p className="text-[11px] text-amber-300 font-medium">District Level</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-blue-500/20 backdrop-blur-md shadow-md">
                <div className="p-2.5 rounded-xl bg-indigo-600/30 text-indigo-300 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-indigo-300/80 font-semibold uppercase tracking-wider">SESSIONS</p>
                  <p className="text-sm font-bold text-white">AI & Career</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-blue-500/20 backdrop-blur-md shadow-md">
                <div className="p-2.5 rounded-xl bg-cyan-600/30 text-cyan-300 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] text-cyan-300/80 font-semibold uppercase tracking-wider">LOCATION</p>
                  <p className="text-sm font-bold text-white">Kozhikode</p>
                  <p className="text-[11px] text-slate-300">South</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center items-center">
              <Link
                href="/studentsgala/register"
                className="w-full sm:w-1/2 py-4 text-center rounded-2xl font-extrabold text-white shadow-xl shadow-blue-900/40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                <Ticket className="w-5 h-5" />
                <span>Register Now</span>
              </Link>

              <button
                onClick={() => setOpen(true)}
                className="w-full sm:w-1/2 py-4 text-center rounded-2xl font-extrabold text-blue-200 border border-blue-400/30 bg-slate-900/80 hover:bg-slate-800 transition-all duration-300 active:scale-95"
              >
                Get Tickets
              </button>
            </div>

            {/* Countdown */}
            <div className="mt-6 w-full">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300/80 mb-2">
                Event Starts In
              </p>
              <CountDown />
            </div>
          </motion.div>

          {/* Right Half */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 flex justify-center mt-6 lg:mt-0"
          >
            <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-blue-500/30 backdrop-blur-2xl shadow-2xl flex flex-col justify-between items-center text-center">
              <div className="w-full flex justify-between items-center text-xs text-blue-300/80 font-mono border-b border-blue-500/20 pb-3">
                <span>STUDENTS' GALA PORTAL</span>
                <span className="bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-200">HIGHER SECONDARY</span>
              </div>

              <div className="my-8">
                <img
                  src="/no-cap.png"
                  alt="Students Gala"
                  className="w-48 sm:w-56 mx-auto object-contain mb-4"
                />
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wider">
                  STUDENTS' GALA
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Inspiring sessions on higher education, AI & emerging technologies, arts competitions, and team activities.
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-xs border-t border-blue-500/20 pt-3 text-slate-300">
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-blue-500/10">
                  <span className="block text-[10px] text-blue-300 font-semibold uppercase">AUDIENCE</span>
                  <span className="font-bold text-white">Higher Secondary</span>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-blue-500/10">
                  <span className="block text-[10px] text-blue-300 font-semibold uppercase">DISTRICT</span>
                  <span className="font-bold text-white">Kozhikode South</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bottom Sections */}
        <section className="mt-16 mb-12">
          <ProgramTimeline />
        </section>

        <section className="mb-16">
          <StudentsGalaInfo />
        </section>
      </div>

      <TicketModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
