'use client';

import React, { useEffect, useRef } from 'react';

export const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    const STAR_COUNT = 180; // Reduzido de 250
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }> = [];

    const getCanvasSize = () => {
      // Limitar ao viewport, não ao scrollHeight
      return { width: window.innerWidth, height: window.innerHeight };
    };

    function resizeCanvas() {
      const { width, height } = getCanvasSize();
      // Aplicar pixel ratio para melhor qualidade
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      if (ctx) {
        ctx.scale(pixelRatio, pixelRatio);
      }
    }

    function normToPixelX(nx: number) {
      return nx * window.innerWidth;
    }

    function normToPixelY(ny: number) {
      return ny * window.innerHeight;
    }

    function normRadiusToPixels(nr: number) {
      return nr * Math.min(window.innerWidth, window.innerHeight);
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
      ctx.fillStyle = '#02030a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawStars(time: number) {
      if (!ctx) return;
      for (const s of stars) {
        const x = normToPixelX(s.x);
        const y = normToPixelY(s.y);
        const r = normRadiusToPixels(s.radius);

        const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.3 + 0.7;
        const alpha = s.baseAlpha * twinkle;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    let frameId: number | null = null;
    let lastTime = 0;
    const FRAME_TIME = 1000 / 30; // 30 FPS ao invés de 60

    function render(timestamp: number) {
      // Throttle: renderizar a cada ~33ms (30 FPS)
      if (timestamp - lastTime < FRAME_TIME) {
        frameId = requestAnimationFrame(render);
        return;
      }
      lastTime = timestamp;

      const time = timestamp * 0.002;
      drawBackground();
      drawStars(time);
      frameId = requestAnimationFrame(render);
    }

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const debouncedResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        createStars();
      }, 250);
    };

    function start() {
      resizeCanvas();
      createStars();
      window.addEventListener('resize', debouncedResize);
      // Remover ResizeObserver pois causa overhead
      frameId = requestAnimationFrame(render);

      return () => {
        window.removeEventListener('resize', debouncedResize);
        if (resizeTimeout) clearTimeout(resizeTimeout);
      };
    }

    function stop(cleanup?: () => void) {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener('resize', debouncedResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      cleanup?.();
    }

    const cleanup = start();

    return () => stop(cleanup);
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />;
};
