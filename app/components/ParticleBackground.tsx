"use client";

import React, { useRef, useEffect, useCallback } from "react";

/* --------------------------------
 * Wave Configuration
 * ------------------------------- */
interface Wave {
    amplitude: number;
    frequency: number;
    speed: number;
    color: string;
}

const WAVE_LAYERS: Wave[] = [
    { amplitude: 0.15, frequency: 0.005, speed: 0.01, color: "rgba(0, 50, 200, 0.4)" },
    { amplitude: 0.1, frequency: 0.008, speed: -0.015, color: "rgba(50, 150, 255, 0.6)" },
    { amplitude: 0.05, frequency: 0.012, speed: 0.02, color: "rgba(0, 100, 255, 0.8)" },
];

/* --------------------------------
 * Component
 * ------------------------------- */
const WaveBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number>(0);
    const timeRef = useRef<number>(0);

    /* -------------------------------
     * Resize Canvas
     * ----------------------------- */
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, []);

    /* -------------------------------
     * Draw Waves
     * ----------------------------- */
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = canvas;

        // Clear background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Subtle radial glow
        const gradient = ctx.createRadialGradient(
            width / 2,
            height / 2,
            0,
            width / 2,
            height / 2,
            Math.max(width, height) / 2
        );

        gradient.addColorStop(0, "rgba(200, 220, 255, 0.2)");
        gradient.addColorStop(1, "#ffffff");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw wave layers
        WAVE_LAYERS.forEach((wave, index) => {
            ctx.beginPath();
            ctx.moveTo(0, height);

            for (let x = 0; x <= width; x++) {
                const y =
                    height * (0.8 - index * 0.05) +
                    height *
                    wave.amplitude *
                    Math.sin(x * wave.frequency + timeRef.current * wave.speed);

                ctx.lineTo(x, y);
            }

            ctx.lineTo(width, height);
            ctx.closePath();

            ctx.fillStyle = wave.color;
            ctx.fill();
        });

        timeRef.current += 1;
    }, []);

    /* -------------------------------
     * Animation Loop
     * ----------------------------- */
    const animate = useCallback(() => {
        draw();
        animationRef.current = requestAnimationFrame(animate);
    }, [draw]);

    /* -------------------------------
     * Effects
     * ----------------------------- */
    useEffect(() => {
        if (typeof window === "undefined") return;

        resizeCanvas();
        animate();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [resizeCanvas, animate]);

    /* -------------------------------
     * Render
     * ----------------------------- */
    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full -z-10"
            aria-hidden
        />
    );
};

export default WaveBackground;
