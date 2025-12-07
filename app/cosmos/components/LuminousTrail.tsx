"use client";

import React, { useEffect, useRef } from "react";

export const LuminousTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = {
      amplitude: 0.08,
      frequency: 3.5,
      phaseSpeed: 0.0004,
      segments: 220,
    };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function trailPoint(t: number, time: number) {
      const baseX = t;
      const baseY = 1 - t;
      const phase = time * config.phaseSpeed;
      const offset =
        config.amplitude *
        Math.sin(config.frequency * t * Math.PI * 2 + phase);
      return { x: baseX, y: baseY + offset };
    }

    function updateLuminousTrail(time: number) {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pulse = 0.5 + 0.2 * Math.sin(time * 0.003);
      const lineWidth = Math.max(4, 10 * pulse);

      ctx.save();
      ctx.shadowBlur = 40;
      ctx.shadowColor = "rgba(180, 230, 255, 0.9)";

      const grad = ctx.createLinearGradient(0, canvas.height, canvas.width, 0);
      grad.addColorStop(0, "rgba(100,160,255,0)");
      grad.addColorStop(0.2, "rgba(160,210,255,0.8)");
      grad.addColorStop(0.5, "#fff");
      grad.addColorStop(0.8, "rgba(160,220,255,0.8)");
      grad.addColorStop(1, "rgba(100,160,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = lineWidth;

      ctx.beginPath();
      for (let i = 0; i <= config.segments; i++) {
        const t = i / config.segments;
        const p = trailPoint(t, time);
        ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
      }
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.lineWidth = lineWidth * 2.2;
      ctx.strokeStyle = "rgba(160,220,255,0.12)";
      ctx.beginPath();
      for (let i = 0; i <= config.segments; i++) {
        const t = i / config.segments;
        const p = trailPoint(t, time);
        ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
      }
      ctx.stroke();
      ctx.restore();
    }

    let frameId: number | null = null;

    function render(timestamp: number) {
      updateLuminousTrail(timestamp);
      frameId = requestAnimationFrame(render);
    }

    function start() {
      resize();
      window.addEventListener("resize", resize);
      frameId = requestAnimationFrame(render);
    }

    function stop() {
      if (frameId != null) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
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
