"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function TouchGlowEffect() {
  const [isActive, setIsActive] = useState(false);
  const [touchRipples, setTouchRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);

  const springX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;

    const handlePointerMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsActive(true);

      clearTimeout(hideTimer);
      if (e.pointerType === "touch") {
        hideTimer = setTimeout(() => setIsActive(false), 2000);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsActive(true);

      const id = Date.now();
      setTouchRipples((prev) => [...prev.slice(-3), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setTouchRipples((prev) => prev.filter((r) => r.id !== id));
      }, 1200);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      clearTimeout(hideTimer);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Smooth Following Glow Spotlight with Soft Pale-Blue & Subtle Violet blend */}
      <motion.div
        className="absolute w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px] transition-opacity duration-700"
        style={{
          x: springX,
          y: springY,
          opacity: isActive ? 0.6 : 0,
          background:
            "radial-gradient(circle, rgba(180, 210, 235, 0.5) 0%, rgba(199, 210, 254, 0.3) 30%, rgba(221, 214, 254, 0.2) 50%, rgba(234, 244, 255, 0) 75%)",
        }}
      />

      {/* Interactive Touch/Tap Subtle Ripples */}
      {touchRipples.map((ripple) => (
        <motion.div
          key={ripple.id}
          initial={{ scale: 0.2, opacity: 0.55 }}
          animate={{ scale: 2.3, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute w-44 h-44 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[40px]"
          style={{
            left: ripple.x,
            top: ripple.y,
            background:
              "radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, rgba(180, 210, 235, 0.35) 45%, transparent 70%)",
          }}
        />
      ))}
    </div>
  );
}
