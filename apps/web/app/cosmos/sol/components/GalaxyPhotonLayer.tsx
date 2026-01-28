'use client';

import React, { useEffect, useRef } from 'react';

type PhotonParticle = {
  radius: number;
  angle: number;
  speed: number;
  size: number;
  alpha: number;
  hue: number;
  armOffset: number;
  drift: number;
  streak: boolean;
  length: number;
};

type GalaxyPhotonLayerProps = {
  className?: string;
  density?: number;
  speed?: number;
  tilt?: number;
};

const TAU = Math.PI * 2;

const GalaxyPhotonLayer: React.FC<GalaxyPhotonLayerProps> = ({
  className = '',
  density = 1,
  speed = 1,
  tilt = 0.78,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const particles: PhotonParticle[] = [];
    let frameId: number | null = null;
    let lastTime = 0;

    const state = {
      width: 1,
      height: 1,
      centerX: 0,
      centerY: 0,
      maxR: 0,
      sizeScale: 1,
    };

    const getCanvasSize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return { width: window.innerWidth, height: window.innerHeight };
      }
      const width = parent.clientWidth || window.innerWidth;
      const height = parent.clientHeight || window.innerHeight;
      return { width, height };
    };

    const createParticles = () => {
      particles.length = 0;
      const dotCount = Math.round(220 * density);
      const streakCount = Math.round(46 * density);
      const total = dotCount + streakCount;

      for (let i = 0; i < total; i++) {
        const isStreak = i < streakCount;
        const radius = 0.1 + Math.pow(Math.random(), 0.62) * 0.9;
        const hue = Math.random() > 0.75 ? 32 + Math.random() * 28 : 185 + Math.random() * 35;

        particles.push({
          radius,
          angle: Math.random() * TAU,
          speed: (0.00005 + Math.random() * 0.00018) * speed * (Math.random() > 0.5 ? 1 : -1),
          size: (0.45 + Math.random() * 1.6) * state.sizeScale,
          alpha: 0.35 + Math.random() * 0.6,
          hue,
          armOffset: i % 2 === 0 ? 0 : Math.PI,
          drift: (Math.random() - 0.5) * 0.00006 * speed,
          streak: isStreak,
          length: (8 + Math.random() * 18) * state.sizeScale,
        });
      }
    };

    const resize = () => {
      const { width, height } = getCanvasSize();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      state.width = width;
      state.height = height;
      state.centerX = width / 2;
      state.centerY = height / 2;
      state.maxR = Math.min(width, height) * 0.48;
      state.sizeScale = Math.max(0.7, Math.min(1.5, state.maxR / 320));

      createParticles();
    };

    const drawFrame = (timestamp: number) => {
      const dt = Math.min(48, timestamp - lastTime || 16);
      lastTime = timestamp;

      ctx.clearRect(0, 0, state.width, state.height);
      ctx.globalCompositeOperation = 'lighter';

      const coreGlow = ctx.createRadialGradient(
        state.centerX,
        state.centerY,
        0,
        state.centerX,
        state.centerY,
        state.maxR * 0.6
      );
      coreGlow.addColorStop(0, 'rgba(226, 232, 240, 0.08)');
      coreGlow.addColorStop(0.35, 'rgba(56, 189, 248, 0.06)');
      coreGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, state.width, state.height);

      const swirlTightness = 6.2;
      const dtScale = dt / 16.667;

      for (const p of particles) {
        p.angle += p.speed * dt;
        p.radius += p.drift * dtScale;

        if (p.radius > 1.08) p.radius = 0.08;
        if (p.radius < 0.05) p.radius = 1.05;

        const r = p.radius * state.maxR;
        const spiralAngle = p.angle + p.radius * swirlTightness + p.armOffset;

        const cosA = Math.cos(spiralAngle);
        const sinA = Math.sin(spiralAngle);
        const x = state.centerX + cosA * r;
        const y = state.centerY + sinA * r * tilt;

        const depthFade = 0.35 + (1 - p.radius) * 0.7;
        const alpha = p.alpha * depthFade;

        if (p.streak) {
          ctx.strokeStyle = `hsla(${p.hue}, 90%, 72%, ${alpha})`;
          ctx.lineWidth = Math.max(0.6, p.size * 0.65);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - cosA * p.length, y - sinA * p.length * tilt);
          ctx.stroke();
        } else {
          ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, TAU);
          ctx.fill();
        }
      }
    };

    const render = (timestamp: number) => {
      drawFrame(timestamp);
      if (!prefersReducedMotion) {
        frameId = requestAnimationFrame(render);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    const parent = canvas.parentElement;
    const observer = parent ? new ResizeObserver(() => resize()) : null;
    if (observer && parent) {
      observer.observe(parent);
    }

    frameId = requestAnimationFrame(render);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      observer?.disconnect();
    };
  }, [density, speed, tilt]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden
    />
  );
};

export default GalaxyPhotonLayer;
