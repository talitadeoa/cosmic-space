"use client";

import React, { useEffect, useRef } from "react";

export const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const STAR_COUNT = 250;
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }> = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function normToPixelX(nx: number) {
      return nx * canvas.width;
    }

    function normToPixelY(ny: number) {
      return ny * canvas.height;
    }

    function normRadiusToPixels(nr: number) {
      return nr * Math.min(canvas.width, canvas.height);
    }

    function createStars() {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          radius: Math.random() * 0.002 + 0.0005,
          baseAlpha: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 2 + 0.5,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    function drawBackground() {
      if (!ctx) return;
      ctx.fillStyle = "#02030a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawStars(time: number) {
      if (!ctx) return;
      for (const s of stars) {
        const x = normToPixelX(s.x);
        const y = normToPixelY(s.y);
        const r = normRadiusToPixels(s.radius);

        const twinkle =
          Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.3 + 0.7;
        const alpha = s.baseAlpha * twinkle;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let frameId: number | null = null;

    function render(timestamp: number) {
      const time = timestamp * 0.002;
      drawBackground();
      drawStars(time);
      frameId = requestAnimationFrame(render);
    }

    function start() {
      resizeCanvas();
      createStars();
      window.addEventListener("resize", resizeCanvas);
      frameId = requestAnimationFrame(render);
    }

    function stop() {
      if (frameId != null) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeCanvas);
    }

    start();

    return () => stop();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
    />
  );
};
