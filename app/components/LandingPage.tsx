"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import LogoSlider from "./LogoSlider";

const LandingPage = () => {
  return (
    <div className="min-h-screen text-slate-900 selection:bg-purple-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative z-10 min-h-[85vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-16 pt-24 pb-16">
        <motion.div
          className="max-w-4xl mx-auto flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs sm:text-sm font-medium shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Official Student & Delegate Portal — Kozhikode South</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.12] mb-6 text-slate-900">
            Empowering Youth & <br className="hidden sm:block" />
            <span className="font-medium bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
              Transforming Leadership
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed mb-10 px-2">
            Welcome to the official portal of SSF Kozhikode South. Serving delegates across units, sectors, and divisions.
          </p>

          {/* Primary Event Card */}
          <div className="w-full max-w-2xl text-left mt-2">
            <div className="group relative rounded-3xl p-8 sm:p-10 bg-white/90 border border-purple-200/80 hover:border-purple-400 transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col justify-between backdrop-blur-sm">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium uppercase tracking-wider border border-purple-200">
                    2026 Sep 10 • 5:30 PM
                  </span>
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-medium text-slate-900 group-hover:text-purple-600 transition">
                  Grand Conclave 26
                </h3>
                <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed font-normal">
                  Jamia Markaz, Karanthur. The flagship delegate conference empowering student leadership across sectors and divisions in SSF Kozhikode South.
                </p>
              </div>

              <Link href="/grandconclave26" className="mt-8">
                <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white text-base sm:text-lg font-medium shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer">
                  <span>Register Delegate Ticket</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-12 bg-white/60 backdrop-blur-sm border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-4xl sm:text-5xl font-medium text-emerald-600">10</p>
            <p className="text-xs sm:text-sm text-slate-500 uppercase font-medium mt-1">Divisions</p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-medium text-amber-600">50+</p>
            <p className="text-xs sm:text-sm text-slate-500 uppercase font-medium mt-1">Sectors</p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-medium text-teal-600">100%</p>
            <p className="text-xs sm:text-sm text-slate-500 uppercase font-medium mt-1">Digital QR System</p>
          </div>
        </div>
      </section>

      {/* Logo Slider */}
      <div className="py-12 bg-transparent">
        <LogoSlider />
      </div>
    </div>
  );
};

export default LandingPage;
