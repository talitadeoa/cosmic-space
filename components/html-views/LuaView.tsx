// src/components/html-views/LuaView.tsx
"use client";

import { useEffect, useRef } from "react";

export function LuaView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasEl = canvasRef.current!;
    const ctx = canvasEl.getContext("2d")!;

    // ==========================
    // Setup básico do canvas
    // ==========================
    function resizeCanvas() {
      const c = canvasRef.current;
      if (!c) return;
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ==========================
    // Coordenadas normalizadas
    // ==========================
    function normToPixelX(nx: number) {
      return nx * canvasEl.width;
    }

    function normToPixelY(ny: number) {
      return ny * canvasEl.height;
    }

    function normRadiusToPixels(nr: number) {
      return nr * Math.min(canvasEl.width, canvasEl.height);
    }

    // ==========================
    // Sistema de câmera (pan + zoom)
    // ==========================
    const camera = {
      current: { x: 0.5, y: 0.5, scale: 1.0 },
      target: { x: 0.5, y: 0.5, scale: 1.0 },
      lerpFactor: 0.08,
    };

    function updateCamera() {
      const c = camera.current;
      const t = camera.target;
      c.x += (t.x - c.x) * camera.lerpFactor;
      c.y += (t.y - c.y) * camera.lerpFactor;
      c.scale += (t.scale - c.scale) * camera.lerpFactor;
    }

    function applyCameraTransform() {
      const c = camera.current;
      const cxPix = normToPixelX(c.x);
      const cyPix = normToPixelY(c.y);

      ctx.translate(canvasEl.width / 2, canvasEl.height / 2);
      ctx.scale(c.scale, c.scale);
      ctx.translate(-cxPix, -cyPix);
    }

    function screenToWorldNormalized(sx: number, sy: number) {
      const c = camera.current;
      const cxPix = normToPixelX(c.x);
      const cyPix = normToPixelY(c.y);

      const worldPixX = (sx - canvasEl.width / 2) / c.scale + cxPix;
      const worldPixY = (sy - canvasEl.height / 2) / c.scale + cyPix;

      const nx = worldPixX / canvasEl.width;
      const ny = worldPixY / canvasEl.height;
      return { x: nx, y: ny };
    }

    // ==========================
    // Estrelas de fundo
    // ==========================
    type Star = {
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      twinkleSpeed: number;
      twinklePhase: number;
    };

    const stars: Star[] = [];
    const STAR_COUNT = 250;

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
    createStars();

    // ==========================
    // Trilha luminosa senoidal
    // ==========================
    const trail = {
      amplitude: 0.08,
      frequency: 3.5,
      phaseSpeed: 0.0004,
    };

    function getTrailPoint(t: number, time: number) {
      const baseX = t;
      const baseY = 1 - t;
      const phase = time * trail.phaseSpeed;
      const offset =
        trail.amplitude * Math.sin(trail.frequency * t * Math.PI * 2 + phase);
      return { x: baseX, y: baseY + offset };
    }

    // ==========================
    // Nebulosas / galáxias suaves
    // ==========================
    const nebulas = [
      {
        x: 0.15,
        y: 0.25,
        radius: 0.18,
        color1: "rgba(130, 180, 255, 0.7)",
        color2: "rgba(20, 40, 80, 0)",
      },
      {
        x: 0.65,
        y: 0.15,
        radius: 0.22,
        color1: "rgba(255, 150, 200, 0.6)",
        color2: "rgba(60, 20, 40, 0)",
      },
      {
        x: 0.85,
        y: 0.65,
        radius: 0.2,
        color1: "rgba(170, 255, 200, 0.5)",
        color2: "rgba(20, 60, 40, 0)",
      },
    ];

    // ==========================
    // Luas
    // ==========================
    type MoonPhase = "new" | "full";

    type Moon = {
      id: number;
      type: "moon";
      phase: MoonPhase;
      x: number;
      y: number;
      radius: number;
      color: string;
      floatPhase: number;
    };

    const moons: Moon[] = [
      // Acima da trilha: luas novas
      {
        id: 1,
        type: "moon",
        phase: "new",
        x: 0.18,
        y: 0.65,
        radius: 0.022,
        color: "#333744",
        floatPhase: Math.random() * Math.PI * 2,
      },
      {
        id: 2,
        type: "moon",
        phase: "new",
        x: 0.32,
        y: 0.52,
        radius: 0.02,
        color: "#2c3140",
        floatPhase: Math.random() * Math.PI * 2,
      },
      {
        id: 3,
        type: "moon",
        phase: "new",
        x: 0.55,
        y: 0.32,
        radius: 0.024,
        color: "#3b3f4f",
        floatPhase: Math.random() * Math.PI * 2,
      },
      {
        id: 4,
        type: "moon",
        phase: "new",
        x: 0.78,
        y: 0.12,
        radius: 0.02,
        color: "#262a35",
        floatPhase: Math.random() * Math.PI * 2,
      },

      // Abaixo da trilha: luas cheias
      {
        id: 5,
        type: "moon",
        phase: "full",
        x: 0.22,
        y: 0.86,
        radius: 0.025,
        color: "#f5e3a0",
        floatPhase: Math.random() * Math.PI * 2,
      },
      {
        id: 6,
        type: "moon",
        phase: "full",
        x: 0.4,
        y: 0.7,
        radius: 0.02,
        color: "#ffd7a3",
        floatPhase: Math.random() * Math.PI * 2,
      },
      {
        id: 7,
        type: "moon",
        phase: "full",
        x: 0.62,
        y: 0.55,
        radius: 0.023,
        color: "#ffecc4",
        floatPhase: Math.random() * Math.PI * 2,
      },
      {
        id: 8,
        type: "moon",
        phase: "full",
        x: 0.82,
        y: 0.42,
        radius: 0.021,
        color: "#d7f0ff",
        floatPhase: Math.random() * Math.PI * 2,
      },
    ];

    let focusedMoonId: number | null = null;
    let animationFrameId: number;

    // ==========================
    // Funções de desenho
    // ==========================
    function drawBackground() {
      ctx.fillStyle = "#02030a";
      ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    }

    function drawStars(time: number) {
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

    function drawNebulas() {
      for (const n of nebulas) {
        const x = normToPixelX(n.x);
        const y = normToPixelY(n.y);
        const r = normRadiusToPixels(n.radius);

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, n.color1);
        grad.addColorStop(1, n.color2);
        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawLuminousTrail(time: number) {
      const segments = 220;

      // Brilho principal
      ctx.save();

      const flicker = 0.5 + 0.2 * Math.sin(time * 0.003);
      const lineWidth = Math.max(4, 10 * flicker);

      ctx.shadowBlur = 40;
      ctx.shadowColor = "rgba(180, 230, 255, 0.9)";

      const grad = ctx.createLinearGradient(0, canvasEl.height, canvasEl.width, 0);
      grad.addColorStop(0.0, "rgba(100, 160, 255, 0)");
      grad.addColorStop(0.2, "rgba(160, 210, 255, 0.8)");
      grad.addColorStop(0.5, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.8, "rgba(160, 220, 255, 0.8)");
      grad.addColorStop(1.0, "rgba(100, 160, 255, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = lineWidth;

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const p = getTrailPoint(t, time);
        const x = normToPixelX(p.x);
        const y = normToPixelY(p.y);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // Halo suave
      ctx.save();
      ctx.lineWidth = lineWidth * 2.2;
      ctx.strokeStyle = "rgba(160, 220, 255, 0.12)";
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const p = getTrailPoint(t, time);
        const x = normToPixelX(p.x);
        const y = normToPixelY(p.y);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    function drawMoon(m: Moon, time: number) {
      const floatOffset =
        Math.sin(time * 0.0007 + m.floatPhase) * 0.008;
      const x = normToPixelX(m.x);
      const y = normToPixelY(m.y + floatOffset);
      const r = normRadiusToPixels(m.radius);

      ctx.save();

      const haloStrength = m.phase === "full" ? 0.75 : 0.35;
      const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
      haloGrad.addColorStop(0, `rgba(255, 255, 230, ${haloStrength})`);
      haloGrad.addColorStop(1, "rgba(255, 255, 230, 0)");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(x, y, r * 2, 0, Math.PI * 2);
      ctx.fill();

      if (m.phase === "new") {
        const grad = ctx.createRadialGradient(
          x - r * 0.3,
          y - r * 0.3,
          r * 0.1,
          x,
          y,
          r
        );
        grad.addColorStop(0, "#111319");
        grad.addColorStop(1, m.color || "#05070c");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(220, 230, 255, 0.4)";
        ctx.lineWidth = r * 0.18;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.94, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const grad = ctx.createRadialGradient(
          x - r * 0.3,
          y - r * 0.3,
          r * 0.1,
          x,
          y,
          r
        );
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(1, m.color || "#f5e3a0");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    function drawMoons(time: number) {
      for (const m of moons) {
        drawMoon(m, time);
      }
    }

    function drawFocusedMoonOverlay(moon: Moon, time: number) {
      const c = camera.current;
      const cxPix = normToPixelX(c.x);
      const cyPix = normToPixelY(c.y);
      const floatOffset =
        Math.sin(time * 0.0007 + moon.floatPhase) * 0.008;

      const worldPixX = normToPixelX(moon.x);
      const worldPixY = normToPixelY(moon.y + floatOffset);
      const scale = c.scale;

      const sx = (worldPixX - cxPix) * scale + canvasEl.width / 2;
      const sy = (worldPixY - cyPix) * scale + canvasEl.height / 2;
      const r = normRadiusToPixels(moon.radius) * scale;

      ctx.save();

      const haloStrength = moon.phase === "full" ? 0.95 : 0.65;
      const haloGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3);
      haloGrad.addColorStop(0, `rgba(255, 255, 230, ${haloStrength})`);
      haloGrad.addColorStop(1, "rgba(255, 255, 230, 0)");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 3, 0, Math.PI * 2);
      ctx.fill();

      if (moon.phase === "new") {
        const grad = ctx.createRadialGradient(
          sx - r * 0.3,
          sy - r * 0.3,
          r * 0.1,
          sx,
          sy,
          r
        );
        grad.addColorStop(0, "#111319");
        grad.addColorStop(1, moon.color || "#05070c");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(220, 230, 255, 0.5)";
        ctx.lineWidth = r * 0.18;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.94, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const grad = ctx.createRadialGradient(
          sx - r * 0.3,
          sy - r * 0.3,
          r * 0.1,
          sx,
          sy,
          r
        );
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(1, moon.color || "#f5e3a0");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // ==========================
    // Interação
    // ==========================
    function findClickedMoon(screenX: number, screenY: number) {
      const world = screenToWorldNormalized(screenX, screenY);

      for (const m of moons) {
        const dx = world.x - m.x;
        const dy = world.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= m.radius * 1.4) {
          return m;
        }
      }
      return null;
    }

    function focusOnMoon(moon: Moon) {
      focusedMoonId = moon.id;
      camera.target.x = moon.x;
      camera.target.y = moon.y;
      camera.target.scale = 2.5;
    }

    function resetCamera() {
      focusedMoonId = null;
      camera.target.x = 0.5;
      camera.target.y = 0.5;
      camera.target.scale = 1.0;
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvasEl.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const clicked = findClickedMoon(sx, sy);
      if (clicked) {
        if (focusedMoonId === clicked.id) {
          resetCamera();
        } else {
          focusOnMoon(clicked);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        resetCamera();
      }
    };

    canvasEl.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);

    // ==========================
    // Loop de animação
    // ==========================
    const render = (timestamp: number) => {
      const time = timestamp;

      updateCamera();

      ctx.save();
      drawBackground();
      ctx.restore();

      ctx.save();
      drawStars(time * 0.002);
      drawNebulas();
      ctx.restore();

      ctx.save();
      applyCameraTransform();
      drawLuminousTrail(time);
      drawMoons(time);
      ctx.restore();

      if (focusedMoonId !== null) {
        ctx.save();
          ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
          ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

        const moon = moons.find((m) => m.id === focusedMoonId);
        if (moon) {
          drawFocusedMoonOverlay(moon, time);
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeyDown);
      const cr = canvasRef.current;
      if (cr) cr.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-screen h-screen block"
      />
      <div className="fixed left-4 bottom-4 text-xs text-slate-300 bg-black/60 px-3 py-1.5 rounded-md backdrop-blur-sm pointer-events-none">
        Clique em uma lua para focar • Clique de novo ou aperte Esc para voltar
      </div>
    </div>
  );
}
