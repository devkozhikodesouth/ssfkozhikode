"use client";

import { useEffect, useState } from "react";
import { EVENT_DATE } from "@/app/utils/mutaallim";

const target = new Date(EVENT_DATE).getTime();
const pad = (n: number) => String(n).padStart(2, "0");

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { Days: Math.floor(s / 86400), Hours: Math.floor((s % 86400) / 3600), Minutes: Math.floor((s % 3600) / 60), Seconds: s % 60 };
}

export default function Countdown() {
  // null until mounted: server and first client render match, no hydration warning
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const started = left !== null && left <= 0;
  const parts = split(left ?? 0);

  return (
    <section aria-label="Countdown to the event" className="mt-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-mut-parchment">{started ? "The event has begun" : "Event starts in"}</p>
      <p className="sr-only">
        {left === null ? "" : `${parts.Days} days, ${parts.Hours} hours and ${parts.Minutes} minutes to go`}
      </p>
      <div aria-hidden className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
        {(Object.keys(parts) as (keyof typeof parts)[]).map((label) => (
          <div key={label} className="rounded-xl border border-mut-parchment/25 bg-mut-ink/70 px-1 py-3 text-center backdrop-blur-sm sm:py-4">
            <div className="font-mut-display text-3xl font-extrabold leading-none tabular-nums text-mut-gold sm:text-4xl">
              {left === null ? "--" : pad(parts[label])}
            </div>
            <div className="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-mut-parchment">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
