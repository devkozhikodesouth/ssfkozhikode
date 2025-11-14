"use client";

import React from "react";
import localFont from "next/font/local";

const rigidSquare = localFont({
  src: "../../public/fonts/RigidSquare.otf",
});

const items = [
  {
    top1: "Inter-School",
    top2: "Competitions",
    bottom1: "Games",
    bottom2: "Activities",
  },
  {
    top1: "Career",
    top2: "Clinics",
    bottom1: "Invaluable",
    bottom2: "Sessions",
  },
  {
    top1: "Cultural",
    top2: "Programs",
    bottom1: "Experts'",
    bottom2: "Interactions",
  },
];

export default function ProgramDivider() {
  return (
    <div
      className={`${rigidSquare.className} relative w-full flex flex-col md:flex-row items-center justify-center gap-10 md:gap-28 py-16`}
    >
      {/* Horizontal line on desktop */}
      <div className="hidden md:block absolute top-[50%] left-1/2 -translate-x-1/2 w-[85%] h-[3px] bg-black"></div>

      {items.map((item, index) => {
        const isEven = index % 2 === 1;

        return (
          <div key={index} className="relative flex flex-col items-center text-center">
            {/* Top 2-line Text */}
            <p
              className={`text-[26px] md:text-[36px] font-black leading-tight mb-6 ${
                isEven ? "text-black" : "text-[#E81B41]"
              }`}
            >
              {item.top1} <br /> {item.top2}
            </p>

            {/* Dot */}
            <div className="w-6 h-6 rounded-full bg-black z-10 mb-6"></div>

            {/* Bottom 2-line Text */}
            <p
              className={`text-[22px] md:text-[30px] font-black leading-tight mt-1 ${
                isEven ? "text-[#E81B41]" : "text-black"
              }`}
            >
              {item.bottom1} <br /> {item.bottom2}
            </p>

            {/* Mobile line */}
            {index !== items.length - 1 && (
              <div className="md:hidden w-[3px] h-16 bg-black mt-6"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
