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
      color: "from-purple-600 to-indigo-600",
      bg: "bg-purple-50/90 border-purple-200",
      badge: "text-purple-700",
    },
    {
      label: "Hours",
      value: timeLeft.hours,
      color: "from-indigo-600 to-blue-600",
      bg: "bg-indigo-50/90 border-indigo-200",
      badge: "text-indigo-700",
    },
    {
      label: "Minutes",
      value: timeLeft.minutes,
      color: "from-teal-600 to-emerald-600",
      bg: "bg-teal-50/90 border-teal-200",
      badge: "text-teal-700",
    },
    {
      label: "Seconds",
      value: timeLeft.seconds,
      color: "from-amber-600 to-rose-600",
      bg: "bg-amber-50/90 border-amber-200",
      badge: "text-amber-700",
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
