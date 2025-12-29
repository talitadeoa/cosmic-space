'use client';

import React, { useEffect, useRef } from 'react';

type LuminousTrailProps = {
  quadrant?: 0 | 1 | 2 | 3;
};

export const LuminousTrail: React.FC<LuminousTrailProps> = ({ quadrant }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = {
      amplitude: 0.025, // oscilação vertical principal
      frequency: 4.0, // quantas ondas cabem no traço
      phaseSpeed: 0.001, // velocidade de deslocamento da onda
      segments: 240,
    };

    const getCanvasSize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return { width: window.innerWidth, height: window.innerHeight };
      }
      const width = parent.clientWidth || window.innerWidth;
      const height = Math.max(parent.clientHeight, parent.scrollHeight, window.innerHeight);
      return { width, height };
    };

    function resize() {
      const { width, height } = getCanvasSize();
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
    }

    function trailPoint(t: number, time: number) {
      const phase = time * config.phaseSpeed;

      // Onda senoidal única para manter movimento uniforme e consistente
      const wave = config.amplitude * Math.sin(config.frequency * t * Math.PI * 2 + phase);

      if (quadrant === undefined) {
        const baseX = 1 - t;
        const baseY = t;

        return { x: baseX, y: baseY + wave };
      }

      const quadrantAngles: Array<{ start: number; end: number }> = [
        { start: Math.PI * 1.5, end: Math.PI * 2 },
        { start: 0, end: Math.PI * 0.5 },
        { start: Math.PI * 0.5, end: Math.PI },
        { start: Math.PI, end: Math.PI * 1.5 },
      ];
      const arc = quadrantAngles[quadrant] ?? quadrantAngles[0];
      const angle = arc.start + (arc.end - arc.start) * t;
      const radius = 0.45 + wave * 0.35;

      return {
        x: 0.5 + Math.cos(angle) * radius,
        y: 0.5 + Math.sin(angle) * radius,
      };
    }

    function updateLuminousTrail(time: number) {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pulse = 0.5 + 0.2 * Math.sin(time * 0.003);
      const lineWidth = Math.max(4, 10 * pulse);

      ctx.save();
      ctx.shadowBlur = 40;
      ctx.shadowColor = 'rgba(180, 230, 255, 0.9)';

      const start = trailPoint(0, time);
      const end = trailPoint(1, time);
      const grad = ctx.createLinearGradient(
        start.x * canvas.width,
        start.y * canvas.height,
        end.x * canvas.width,
        end.y * canvas.height
      );
      grad.addColorStop(0, 'rgba(100,160,255,0)');
      grad.addColorStop(0.2, 'rgba(160,210,255,0.8)');
      grad.addColorStop(0.5, '#fff');
      grad.addColorStop(0.8, 'rgba(160,220,255,0.8)');
      grad.addColorStop(1, 'rgba(100,160,255,0)');
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
      ctx.strokeStyle = 'rgba(160,220,255,0.12)';
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
      window.addEventListener('resize', resize);
      const parent = canvas.parentElement;
      const observer = parent ? new ResizeObserver(() => resize()) : null;
      if (observer && parent) {
        observer.observe(parent);
      }
      frameId = requestAnimationFrame(render);

      return () => observer?.disconnect();
    }

    function stop(cleanup?: () => void) {
      if (frameId != null) cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      cleanup?.();
    }

    const cleanup = start();

    return () => stop(cleanup);
  }, [quadrant]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />;
};
