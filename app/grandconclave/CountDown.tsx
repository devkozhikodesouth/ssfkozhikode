"use client";
import React, { useEffect, useState } from "react";

const CountDown = () => {
  const targetDate = new Date("2025-12-19T09:00:00");

  const calculateTimeLeft = () => {
    const now = new Date();
    const diff = +targetDate - +now;

    if (diff <= 0) return null;

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(
      () => setTimeLeft(calculateTimeLeft()),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  /* Poster-based theme */
  const theme = {
    containerBg: "#F8FCFB",
    border: "#3E70F8",
    blockBg: "#2D3055",
    numberText: "#FFFFFF",
    labelText: "#DD82D3",
    eventBg: "#81F54C",
    eventText: "#2D3055",
  };

  if (!timeLeft) {
    return (
      <div
        className="p-6 rounded-2xl text-center text-lg font-semibold shadow-lg"
        style={{
          backgroundColor: theme.eventBg,
          color: theme.eventText,
        }}
      >
        Event Day! It’s happening today!
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
        backgroundColor: theme.containerBg,
        borderColor: theme.border,
      }}
    >
      <div className="grid grid-cols-4 gap-3 w-full">
        {timeBlocks.map((block, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded-2xl p-4 shadow-sm transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: theme.blockBg }}
          >
            <span
              className="text-4xl md:text-5xl font-bold font-mono"
              style={{ color: theme.numberText }}
            >
              {block.value.toString().padStart(2, "0")}
            </span>
            <span
              className="text-sm md:text-base font-medium"
              style={{ color: theme.labelText }}
            >
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountDown;
