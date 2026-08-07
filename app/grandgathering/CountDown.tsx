"use client";

import React, { useEffect, useState } from "react";

export default function CountDown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Target date: August 13, 2026 17:30:00
    const targetDate = new Date("2026-08-13T17:30:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const items = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-4 justify-center md:justify-start my-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center justify-center w-16 sm:w-20 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-purple-500/10"
        >
          <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
            {String(item.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] sm:text-xs font-medium text-purple-200/80 uppercase tracking-widest mt-1">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
