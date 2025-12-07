"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion, Transition } from "framer-motion";

type ScreenId =
  | "home"
  | "solOrbit"
  | "luaList"
  | "planetCardBelowSun"
  | "planetCardStandalone"
  | "galaxySuns"
  | "ringGalaxy"
  | "sidePlanetCard"
  | "columnSolLuaPlaneta";

type CelestialType =
  | "sol"
  | "lua"
  | "planeta"
  | "galaxia"
  | "anel"
  | "buracoNegro";

type CelestialSize = "sm" | "md" | "lg";

interface CelestialObjectProps {
  type: CelestialType;
  size?: CelestialSize;
  className?: string;
  interactive?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLDivElement>) => void;
  floatOffset?: number;
  pulseOnMount?: boolean;
}

type FocusState = {
  target: ScreenId;
  x: number;
  y: number;
  centerX: number;
  centerY: number;
  type: CelestialType;
  size: CelestialSize;
};

const floatTransition: Transition = {
  duration: 4.5,
  repeat: Infinity,
  repeatType: "reverse",
  ease: "easeInOut",
};

const screenVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.32, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

const sizeToClass: Record<CelestialSize, string> = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-24 h-24",
};

const CelestialObject: React.FC<CelestialObjectProps> = ({
  type,
  size = "md",
  className = "",
  interactive = false,
  onClick,
  floatOffset = 0,
  pulseOnMount = false,
}) => {
  let baseShape = "";
  switch (type) {
    case "sol":
      baseShape =
        "bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-400 shadow-[0_0_40px_rgba(252,211,77,0.7)]";
      break;
    case "lua":
      baseShape =
        "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 shadow-[0_0_24px_rgba(148,163,184,0.9)]";
      break;
    case "planeta":
      baseShape =
        "bg-gradient-to-br from-sky-300 via-sky-400 to-blue-500 shadow-[0_0_40px_rgba(56,189,248,0.8)]";
      break;
    case "galaxia":
      baseShape =
        "border border-sky-300/60 bg-[conic-gradient(from_0deg,#7dd3fc,#0ea5e9,#6366f1,#7dd3fc)] shadow-[0_0_40px_rgba(56,189,248,0.7)]";
      break;
    case "anel":
      baseShape =
        "border-4 border-violet-300/70 shadow-[0_0_40px_rgba(196,181,253,0.7)] bg-transparent";
      break;
    case "buracoNegro":
      baseShape =
        "bg-slate-950 ring-4 ring-indigo-500/60 shadow-[0_0_40px_rgba(129,140,248,0.8)]";
      break;
  }

  const interactiveClasses = interactive ? "cursor-pointer" : "cursor-default";

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (onClick) onClick(e);
  };

  return (
    <motion.div
      onClick={handleClick}
      className={[
        "inline-flex items-center justify-center rounded-full",
        sizeToClass[size],
        baseShape,
        "transition-shadow",
        interactive ? "hover:shadow-[0_0_55px_rgba(255,255,255,0.9)]" : "",
        interactiveClasses,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      initial={{
        y: pulseOnMount ? 4 : 0,
        scale: pulseOnMount ? 0.9 : 1,
      }}
      animate={{
        y: [0 + floatOffset, -10 + floatOffset, 0 + floatOffset],
        scale: 1,
      }}
      transition={floatTransition}
      whileHover={interactive ? { scale: 1.08 } : undefined}
      whileTap={interactive ? { scale: 0.92 } : undefined}
    />
  );
};

const Card: React.FC<{
  className?: string;
  children?: React.ReactNode;
  interactive?: boolean;
  onClick?: () => void;
}> = ({ className = "", children, interactive = false, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  return (
    <motion.div
      onClick={handleClick}
      className={[
        "rounded-3xl bg-white/10 p-6 backdrop-blur-lg border border-white/20 shadow-[0_0_40px_rgba(148,163,184,0.45)]",
        interactive ? "cursor-pointer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      initial={{ opacity: 0.8, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.96 } : undefined}
    >
      {children}
    </motion.div>
  );
};

const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
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
      ctx.fillStyle = '#02030a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawStars(time: number) {
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

    function render(timestamp: number) {
      const time = timestamp * 0.002;
      drawBackground();
      drawStars(time);
      frameId = requestAnimationFrame(render);
    }

    function start() {
      resizeCanvas();
      createStars();
      window.addEventListener('resize', resizeCanvas);
      frameId = requestAnimationFrame(render);
    }

    function stop() {
      if (frameId != null) cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resizeCanvas);
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

const SpaceBackground: React.FC = () => (
  <>
    <StarfieldBackground />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#ffffff20_1px,transparent_0)] bg-[length:40px_40px] opacity-40" />
    <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
    <div className="pointer-events-none absolute bottom-[-10rem] right-[-6rem] h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
  </>
);

const LuminousTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
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
      const offset = config.amplitude * Math.sin(config.frequency * t * Math.PI * 2 + phase);
      return { x: baseX, y: baseY + offset };
    }

    function updateLuminousTrail(time: number) {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pulse = 0.5 + 0.2 * Math.sin(time * 0.003);
      const lineWidth = Math.max(4, 10 * pulse);

      // Linha principal brilhante
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

      // Halo largo
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
      window.addEventListener('resize', resize);
      frameId = requestAnimationFrame(render);
    }

    function stop() {
      if (frameId != null) cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
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

const CosmosPage: React.FC = () => {
  const [screenStack, setScreenStack] = useState<ScreenId[]>(["home"]);
  const currentScreen = screenStack[screenStack.length - 1];

  const [focus, setFocus] = useState<FocusState | null>(null);

  const navigateTo = useCallback((next: ScreenId) => {
    setScreenStack((prev) => [...prev, next]);
  }, []);

  const goBack = useCallback(() => {
    setScreenStack((prev) => {
      if (prev.length <= 1) return prev;
      const clone = [...prev];
      clone.pop();
      return clone;
    });
  }, []);

  const handleBackgroundClick = () => {
    if (screenStack.length > 1) {
      goBack();
    }
  };

  const navigateWithFocus = useCallback(
    (
      next: ScreenId,
      params: {
        event?: React.MouseEvent<HTMLDivElement>;
        type: CelestialType;
        size?: CelestialSize;
      }
    ) => {
      const { event, type, size = "md" } = params;

      if (!event || typeof window === "undefined") {
        // fallback: navega direto se não tiver evento
        setScreenStack((prev) => [...prev, next]);
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      setFocus({
        target: next,
        x,
        y,
        centerX,
        centerY,
        type,
        size,
      });

      setTimeout(() => {
        setScreenStack((prev) => [...prev, next]);
        setFocus(null);
      }, 500);
    },
    []
  );

  const renderHome = () => (
    <div className="relative flex h-full w-full items-center justify-center">
      <CelestialObject
        type="sol"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("solOrbit", { event: e, type: "sol", size: "md" })
        }
        className="absolute top-12 left-10"
        floatOffset={-2}
      />

      <CelestialObject
        type="buracoNegro"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("ringGalaxy", {
            event: e,
            type: "buracoNegro",
            size: "lg",
          })
        }
        className="absolute top-10 left-1/2 -translate-x-1/2"
        floatOffset={-4}
      />

      <CelestialObject
        type="galaxia"
        size="sm"
        interactive
        onClick={(e) =>
          navigateWithFocus("galaxySuns", {
            event: e,
            type: "galaxia",
            size: "sm",
          })
        }
        className="absolute top-16 right-16"
        floatOffset={1}
      />

      <CelestialObject
        type="galaxia"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("galaxySuns", {
            event: e,
            type: "galaxia",
            size: "lg",
          })
        }
        className="absolute bottom-24 left-14"
        floatOffset={3}
      />

      <CelestialObject
        type="lua"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "lg" })
        }
        className="absolute bottom-24 left-1/2 -translate-x-1/2"
        floatOffset={0}
      />

      <CelestialObject
        type="planeta"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("planetCardStandalone", {
            event: e,
            type: "planeta",
            size: "lg",
          })
        }
        className="absolute bottom-10 right-10"
        floatOffset={-1}
      />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.3em] uppercase text-slate-300/60">
        Clique em um astro para navegar · Clique no espaço para voltar
      </div>
    </div>
  );

  const renderSolOrbit = () => (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        className="absolute h-64 w-64 rounded-[40%] border-2 border-sky-400/50"
        animate={{ rotate: [0, 6, -6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <Card
        interactive
        onClick={() => navigateTo("planetCardBelowSun")}
        className="relative z-10 flex aspect-[4/3] w-72 items-center justify-center"
      >
        <CelestialObject type="sol" size="lg" interactive={false} />
      </Card>

      <CelestialObject
        type="lua"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
        }
        className="absolute -top-4 left-1/2 -translate-x-1/2"
      />
      <CelestialObject
        type="lua"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
        }
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        floatOffset={3}
      />
      <CelestialObject
        type="lua"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
        }
        className="absolute left-8 top-1/2 -translate-y-1/2"
        floatOffset={-2}
      />
      <CelestialObject
        type="lua"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
        }
        className="absolute right-8 top-1/2 -translate-y-1/2"
        floatOffset={1}
      />
    </div>
  );

  const renderLuaList = () => (
    <div className="relative flex h-full w-full flex-col items-center justify-between py-16">
      <LuminousTrail />

      <CelestialObject
        type="sol"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("planetCardBelowSun", {
            event: e,
            type: "sol",
            size: "lg",
          })
        }
        className="mt-4"
        floatOffset={-3}
      />

      <div className="relative flex flex-col items-center gap-6">
        <div className="flex gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <CelestialObject
              key={`row1-lua-${i}`}
              type="lua"
              interactive
              onClick={(e) =>
                navigateWithFocus("planetCardStandalone", {
                  event: e,
                  type: "lua",
                  size: "md",
                })
              }
              floatOffset={i * 1.5}
            />
          ))}
        </div>

        <motion.div
          className="h-0.5 w-72 bg-gradient-to-r from-sky-300/60 via-sky-500/80 to-sky-300/60"
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="flex gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <CelestialObject
              key={`row2-lua-${i}`}
              type="lua"
              interactive
              onClick={(e) =>
                navigateWithFocus("planetCardStandalone", {
                  event: e,
                  type: "lua",
                  size: "md",
                })
              }
              floatOffset={-i * 1.5}
            />
          ))}
        </div>
      </div>

      <CelestialObject
        type="planeta"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("planetCardStandalone", {
            event: e,
            type: "planeta",
            size: "lg",
          })
        }
        className="mb-4"
        floatOffset={2}
      />
    </div>
  );

  const renderPlanetCardBelowSun = () => (
    <div className="relative flex h-full w-full flex-col items-center justify-between py-10">
      <CelestialObject
        type="sol"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("solOrbit", {
            event: e,
            type: "sol",
            size: "lg",
          })
        }
        floatOffset={-3}
      />

      <Card
        interactive
        onClick={() => navigateTo("sidePlanetCard")}
        className="mt-4 flex aspect-[4/3] w-80 items-center justify-center"
      >
        <CelestialObject type="planeta" size="lg" />
      </Card>

      <div className="relative mb-6 flex items-center justify-center">
        <motion.div
          className="absolute h-px w-80 bg-gradient-to-r from-sky-300/40 via-sky-500/80 to-sky-300/40"
          animate={{ x: [0, 12, -12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CelestialObject
              key={`bottom-lua-${i}`}
              type="lua"
              size="sm"
              interactive
              onClick={(e) =>
                navigateWithFocus("planetCardStandalone", {
                  event: e,
                  type: "lua",
                  size: "sm",
                })
              }
              floatOffset={i - 2}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlanetCardStandalone = () => (
    <div className="relative flex h-full w-full items-center justify-center">
      <Card
        interactive
        onClick={() => navigateTo("columnSolLuaPlaneta")}
        className="relative flex aspect-[4/3] w-80 items-center justify-end"
      >
        <CelestialObject
          type="lua"
          size="sm"
          interactive
          onClick={(e) =>
            navigateWithFocus("luaList", {
              event: e,
              type: "lua",
              size: "sm",
            })
          }
          className="absolute -top-6 -left-4"
          floatOffset={-2}
        />
        <CelestialObject
          type="sol"
          size="sm"
          interactive
          onClick={(e) =>
            navigateWithFocus("planetCardBelowSun", {
              event: e,
              type: "sol",
              size: "sm",
            })
          }
          className="absolute -top-6 -right-4"
          floatOffset={1}
        />
        <CelestialObject
          type="planeta"
          size="lg"
          interactive
          onClick={(e) =>
            navigateWithFocus("columnSolLuaPlaneta", {
              event: e,
              type: "planeta",
              size: "lg",
            })
          }
          className="absolute -bottom-8 left-1/2 -translate-x-1/2"
          floatOffset={3}
        />
      </Card>
    </div>
  );

  const renderGalaxySuns = () => (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        className="relative flex items-center justify-center"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <CelestialObject
          type="galaxia"
          size="lg"
          interactive
          onClick={(e) =>
            navigateWithFocus("ringGalaxy", {
              event: e,
              type: "galaxia",
              size: "lg",
            })
          }
          floatOffset={0}
        />
      </motion.div>

      <CelestialObject
        type="sol"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("solOrbit", {
            event: e,
            type: "sol",
            size: "md",
          })
        }
        className="absolute top-20 left-1/2 -translate-x-1/2"
        floatOffset={-2}
      />
      <CelestialObject
        type="sol"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("solOrbit", {
            event: e,
            type: "sol",
            size: "md",
          })
        }
        className="absolute bottom-20 left-1/2 -translate-x-1/2"
        floatOffset={2}
      />
      <CelestialObject
        type="sol"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("solOrbit", {
            event: e,
            type: "sol",
            size: "md",
          })
        }
        className="absolute left-20 top-1/2 -translate-y-1/2"
        floatOffset={1}
      />
      <CelestialObject
        type="sol"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("solOrbit", {
            event: e,
            type: "sol",
            size: "md",
          })
        }
        className="absolute right-20 top-1/2 -translate-y-1/2"
        floatOffset={-1}
      />
    </div>
  );

  const renderRingGalaxy = () => (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-violet-300/70 shadow-[0_0_55px_rgba(196,181,253,0.8)]"
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      >
        <Card
          interactive
          onClick={() => navigateTo("columnSolLuaPlaneta")}
          className="w-40"
        />
      </motion.div>

      <CelestialObject
        type="lua"
        size="sm"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", {
            event: e,
            type: "lua",
            size: "sm",
          })
        }
        className="absolute top-16 left-1/2 -translate-x-1/2"
        floatOffset={-2}
      />
      <CelestialObject
        type="lua"
        size="sm"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", {
            event: e,
            type: "lua",
            size: "sm",
          })
        }
        className="absolute bottom-16 left-1/2 -translate-x-1/2"
        floatOffset={2}
      />
      <CelestialObject
        type="lua"
        size="sm"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", {
            event: e,
            type: "lua",
            size: "sm",
          })
        }
        className="absolute left-16 top-1/2 -translate-y-1/2"
        floatOffset={1}
      />
      <CelestialObject
        type="lua"
        size="sm"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", {
            event: e,
            type: "lua",
            size: "sm",
          })
        }
        className="absolute right-16 top-1/2 -translate-y-1/2"
        floatOffset={-1}
      />
    </div>
  );

  const renderSidePlanetCard = () => (
    <div className="relative flex h-full w-full items-center justify-center px-10">
      <div className="relative flex h-80 w-full max-w-4xl items-center justify-between">
        <Card
          interactive
          onClick={() => navigateTo("columnSolLuaPlaneta")}
          className="relative z-10 flex h-64 w-72 items-center justify-center"
        >
          <CelestialObject
            type="planeta"
            size="lg"
            className="absolute -right-10"
          />
        </Card>

        <div className="flex flex-col items-center gap-4 pr-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CelestialObject
              key={`col-lua-${i}`}
              type="lua"
              size="sm"
              interactive
              onClick={(e) =>
                navigateWithFocus("planetCardStandalone", {
                  event: e,
                  type: "lua",
                  size: "sm",
                })
              }
              floatOffset={i * 1.5 - 3}
            />
          ))}
        </div>

        <CelestialObject
          type="sol"
          size="md"
          interactive
          onClick={(e) =>
            navigateWithFocus("planetCardBelowSun", {
              event: e,
              type: "sol",
              size: "md",
            })
          }
          className="absolute -top-6 right-24"
          floatOffset={-2}
        />
      </div>
    </div>
  );

  const renderColumnSolLuaPlaneta = () => (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-10">
        <CelestialObject
          type="sol"
          size="lg"
          interactive
          onClick={(e) =>
            navigateWithFocus("home", { event: e, type: "sol", size: "lg" })
          }
          floatOffset={-4}
        />
        <CelestialObject
          type="lua"
          size="md"
          interactive
          onClick={(e) =>
            navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
          }
          floatOffset={0}
        />
        <CelestialObject
          type="planeta"
          size="lg"
          interactive
          onClick={(e) =>
            navigateWithFocus("planetCardStandalone", {
              event: e,
              type: "planeta",
              size: "lg",
            })
          }
          floatOffset={3}
        />
      </div>
    </div>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return renderHome();
      case "solOrbit":
        return renderSolOrbit();
      case "luaList":
        return renderLuaList();
      case "planetCardBelowSun":
        return renderPlanetCardBelowSun();
      case "planetCardStandalone":
        return renderPlanetCardStandalone();
      case "galaxySuns":
        return renderGalaxySuns();
      case "ringGalaxy":
        return renderRingGalaxy();
      case "sidePlanetCard":
        return renderSidePlanetCard();
      case "columnSolLuaPlaneta":
        return renderColumnSolLuaPlaneta();
      default:
        return renderHome();
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden text-slate-50"
      onClick={handleBackgroundClick}
    >
      <SpaceBackground />

      {/* Overlay de foco no astro clicado */}
      <AnimatePresence>
        {focus && (
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute"
              initial={{ x: focus.x, y: focus.y, scale: 1 }}
              animate={{
                x: focus.centerX,
                y: focus.centerY,
                scale: 3,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <CelestialObject
                type={focus.type}
                size={focus.size}
                interactive={false}
                pulseOnMount={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex h-screen flex-col">
        <div className="pointer-events-none absolute top-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-slate-900/60 px-4 py-1 text-xs text-slate-200/70">
          Tela atual: <span className="font-semibold">{currentScreen}</span>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative h-[80vh] w-[90vw] max-w-5xl"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CosmosPage;
