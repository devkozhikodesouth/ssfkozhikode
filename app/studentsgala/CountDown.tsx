"use client";
import React, { useEffect, useState } from "react";
import { Colors } from "../constants/colors";

const CountDown = () => {
  const targetDate = new Date("2025-12-19T09:00:00");

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
      <div
        className="p-6 rounded-2xl text-center text-lg font-semibold shadow-lg"
        style={{
          backgroundColor: Colors.secondary,
          color: Colors.primaryDark,
        }}
      >
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
    <div
      className="flex flex-col items-center justify-center p-6 rounded-3xl shadow-md max-w-md border"
      style={{
        backgroundColor: Colors.primaryLighter,
        borderColor: Colors.accent,
      }}
    >
      <div className="grid grid-cols-4 gap-3 w-full">
        {timeBlocks.map((block, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-lg"
            style={{
              backgroundColor: Colors.primary,
              color: "white",
            }}
          >
            <span className="text-4xl md:text-5xl font-bold font-mono">
              {block.value.toString().padStart(2, "0")}
            </span>
            <span className="text-sm md:text-base font-medium opacity-90">
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountDown;
