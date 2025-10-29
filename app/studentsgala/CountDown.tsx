"use client";
import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

const CountDown = () => {
  const targetDate = new Date("2025-11-29T09:00:00");

  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = +targetDate - +now;

    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) {
    return (
      <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-md text-center text-lg font-semibold text-green-600 shadow-lg">
        🎉 Event Day! It’s happening today!
      </div>
    );
  }

  const timeBlocks = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/30 backdrop-blur-lg rounded-3xl shadow-md border border-white/20 max-w-md ">
    

      <div className="grid grid-cols-4 gap-3 w-full">
        {timeBlocks.map((block, i) => (
          <div
            key={i}
className="flex flex-col items-center justify-center bg-gray-100 text-indigo-700 rounded-2xl p-4 shadow-sm transition-all duration-300 hover:bg-indigo-50 hover:shadow-md"
          >
            <span className="text-4xl md:text-5xl font-bold font-mono">
              {block.value.toString().padStart(2, "0")}
            </span>
            <span className="text-sm md:text-base font-medium opacity-75">
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountDown;
