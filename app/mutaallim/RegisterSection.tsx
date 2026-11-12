"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import MutaallimForm from "./MutaallimForm";

const SECTION_ID = "register";

/* Hero button: smooth-scrolls to the registration section below (same behaviour
 * as the other event pages). Falls back to an instant jump for reduced motion. */
export function RegisterButton() {
  const go = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(SECTION_ID)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  return (
    <a
      href={`#${SECTION_ID}`}
      onClick={(e) => {
        e.preventDefault();
        go();
      }}
      className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-mut-orange to-mut-gold px-8 text-lg font-extrabold text-mut-ink shadow-lg shadow-black/30 transition hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mut-gold cursor-pointer sm:w-auto"
    >
      Register now <ArrowRight className="h-5 w-5 rotate-90" aria-hidden />
    </a>
  );
}

/* Next section: phone check → form → ticket, centred in the viewport */
export default function RegisterPanel() {
  const [ticketStep, setTicketStep] = useState(false);
  return (
    <section
      id={SECTION_ID}
      aria-label="Register for Muta'allim Sammelanam"
      className="relative z-10 flex min-h-screen scroll-mt-0 items-center justify-center px-4 py-16 sm:px-8"
    >
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-2xl shadow-black/50 sm:p-8 ${
          ticketStep ? "bg-mut-ink ring-1 ring-mut-parchment/20" : "bg-mut-cream"
        }`}
      >
        <MutaallimForm onStepChange={(s) => setTicketStep(s === "ticket")} />
      </div>
    </section>
  );
}
