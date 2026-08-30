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
    // Target date: September 10, 2026 17:30:00
    const targetDate = new Date("2026-09-10T17:30:00").getTime();

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
    {
      label: "Days",
      value: timeLeft.days,
      color: "from-rose-400 to-pink-400",
      bg: "bg-rose-950/40 border-rose-500/30",
      badge: "text-rose-200",
    },
    {
      label: "Hours",
      value: timeLeft.hours,
      color: "from-pink-400 to-orange-400",
      bg: "bg-pink-950/40 border-pink-500/30",
      badge: "text-pink-200",
    },
    {
      label: "Minutes",
      value: timeLeft.minutes,
      color: "from-orange-400 to-amber-400",
      bg: "bg-orange-950/40 border-orange-500/30",
      badge: "text-orange-200",
    },
    {
      label: "Seconds",
      value: timeLeft.seconds,
      color: "from-amber-400 to-red-400",
      bg: "bg-amber-950/40 border-amber-500/30",
      badge: "text-amber-200",
    },
  ];

  return (
    <div className="flex gap-2.5 sm:gap-4 justify-center md:justify-start my-3 sm:my-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`flex flex-col items-center justify-center w-16 sm:w-20 py-2.5 sm:py-3.5 rounded-2xl ${item.bg} border shadow-sm backdrop-blur-sm transition-transform hover:scale-105`}
        >
          <span className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent leading-none`}>
            {String(item.value).padStart(2, "0")}
          </span>
          <span className={`text-[10px] sm:text-xs font-semibold ${item.badge} uppercase tracking-wider sm:tracking-widest mt-1.5`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
