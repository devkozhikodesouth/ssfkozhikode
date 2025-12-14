"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import CountDown from "./CountDown";
import TicketModal from "../components/TicketModal";
import RegistrationForm from "./RegistrationForm";
import ParticleBackground from "../components/ParticleBackground";

const containerAnim = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function StudentGalaLanding() {
  const formRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <div className="relative min-h-screen overflow-hidden">
        <ParticleBackground />

        <section className="relative mx-auto max-w-7xl px-6 md:px-12 pt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <motion.div
            variants={containerAnim}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center md:items-start md:text-left"
          >
            <motion.div variants={itemAnim} className="w-full flex justify-center md:justify-start">
              <Image
                src="/grandconclave1.png"
                alt="Students Gala"
                width={420}
                height={420}
                priority
                className="w-[70%] md:w-[60%] max-w-md"
              />
            </motion.div>

            <motion.div variants={itemAnim} className="w-full">
              <button
                onClick={scrollToForm}
                className="
    w-full md:w-2/3
    py-4 px-8 mt-8
    rounded-2xl
    text-white font-semibold
    shadow-xl
    bg-[#645eef]
    backdrop-blur-xl
    transition-all duration-300
    hover:opacity-90
    active:scale-95
  "
              >
                Register Now
              </button>

            </motion.div>

            <motion.div variants={itemAnim} className="w-full mt-6 flex justify-center md:justify-start">
              <CountDown />
            </motion.div>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center md:justify-end"
          >
            <Image
              src="/rightside.png"
              alt="Event Illustration"
              width={500}
              height={500}
              className="w-full max-w-md"
            />
          </motion.div>
        </section>
      </div>

      {/* ================= FORM SECTION ================= */}
      <section
        ref={formRef}
        className="relative max-w-6xl mx-auto mt-28 mb-24 px-6 md:px-12 scroll-mt-28"
      >
        <RegistrationForm />
      </section>

      {/* ================= MODAL ================= */}
      <TicketModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
