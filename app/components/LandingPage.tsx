"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import LogoSlider from "./LogoSlider";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white">
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-purple-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 min-h-[85vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-16 pt-24 pb-16">
        <motion.div
          className="max-w-4xl mx-auto flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-bold shadow-lg shadow-purple-950/50 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Official Student & Delegate Portal — Kozhikode South</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6">
            Empowering Youth & <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
              Transforming Leadership
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed mb-10 px-2">
            Welcome to the official portal of SSF Kozhikode South. Serving delegates across units, sectors, and divisions.
          </p>

          {/* Primary Event Card */}
          <div className="w-full max-w-2xl text-left mt-2">
            <div className="group relative rounded-3xl p-8 sm:p-10 bg-slate-900/90 border border-purple-500/30 hover:border-purple-400 transition-all duration-300 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-extrabold uppercase tracking-wider border border-purple-500/30">
                    2026 Aug 13 • 5:30 PM
                  </span>
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white group-hover:text-purple-300 transition">
                  Grand Gathering
                </h3>
                <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
                  Markaz, Karanthur. The flagship delegate conference empowering student leadership across sectors and divisions in SSF Kozhikode South.
                </p>
              </div>

              <Link href="/grandgathering" className="mt-8">
                <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white text-base font-extrabold shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition active:scale-95">
                  <span>Register Delegate Ticket</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-12 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-emerald-400">10</p>
            <p className="text-xs text-slate-400 uppercase font-semibold mt-1">Divisions</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-amber-400">50+</p>
            <p className="text-xs text-slate-400 uppercase font-semibold mt-1">Sectors</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-teal-400">100%</p>
            <p className="text-xs text-slate-400 uppercase font-semibold mt-1">Digital QR System</p>
          </div>
        </div>
      </section>

      {/* Logo Slider */}
      <div className="py-12 bg-slate-950">
        <LogoSlider />
      </div>
    </div>
  );
};

export default LandingPage;
