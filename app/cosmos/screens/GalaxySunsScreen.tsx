"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CelestialObject } from "../components/CelestialObject";
import type { ScreenProps } from "../types";

type YearSun = {
  id: string;
  label: string;
  year: number;
  orbitIndex: number;
};

const BASE_ORBIT_SIZE = 240;
const ORBIT_STEP = 78;

const GalaxySunsScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  const currentYear = new Date().getFullYear();

  const orbitSizes = useMemo(
    () => Array.from({ length: 4 }, (_, idx) => BASE_ORBIT_SIZE + idx * ORBIT_STEP),
    [],
  );

  const yearSuns = useMemo<YearSun[]>(() => {
    return [
      { id: "past", label: "Ano passado", year: currentYear - 1, orbitIndex: 0 },
      { id: "present", label: "Ano presente", year: currentYear, orbitIndex: 1 },
      { id: "next1", label: "Próximo ano", year: currentYear + 1, orbitIndex: 2 },
      { id: "next2", label: "Daqui a 2 anos", year: currentYear + 2, orbitIndex: 3 },
    ];
  }, [currentYear]);

  const largestOrbit = orbitSizes[orbitSizes.length - 1];
  const stagePadding = 120;
  const stageSize = largestOrbit + stagePadding;
  const angleStep = 360 / yearSuns.length;

  const polarToCartesian = (orbitIndex: number, angle: number) => {
    const orbitSize = orbitSizes[orbitIndex] ?? orbitSizes[orbitSizes.length - 1];
    const radius = orbitSize / 2;
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    };
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 px-3 py-5 shadow-2xl shadow-indigo-900/30 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(55,48,163,0.45),rgba(15,23,42,0.95))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_45%),radial-gradient(circle_at_80%_36%,rgba(14,165,233,0.12),transparent_42%),radial-gradient(circle_at_40%_75%,rgba(236,72,153,0.12),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-2 text-center">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-indigo-100/80">
          Galáxia cronológica
        </p>
        <h3 className="text-xl font-semibold text-white sm:text-2xl">
          Um sol para cada ano, orbitando o núcleo da galáxia
        </h3>
        <p className="text-sm text-slate-300">
          Clique em um sol para focar a órbita daquele ano. As órbitas externas marcam os próximos
          ciclos; as internas, o passado e o presente.
        </p>
      </div>

      <div
        className="relative mt-6 w-full max-w-[760px]"
        style={{ minHeight: stageSize }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-square w-full max-w-[720px]">
            {orbitSizes.map((size, idx) => (
              <div
                key={`orbit-${size}`}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-300/15 shadow-[0_0_32px_rgba(79,70,229,0.12)]"
                style={{
                  width: size,
                  height: size,
                  rotate: `${idx * 8}deg`,
                  boxShadow: idx % 2 === 0 ? "0 0 28px rgba(14,165,233,0.14)" : undefined,
                }}
              />
            ))}

            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, ease: "linear", duration: 26 }}
            >
              <div className="absolute -inset-10 blur-3xl bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.28),rgba(14,165,233,0.12),transparent)]" />
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
                className="shadow-[0_0_45px_rgba(99,102,241,0.45)]"
                floatOffset={0}
              />
              <div className="absolute left-1/2 top-full mt-4 -translate-x-1/2 rounded-full bg-slate-900/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-indigo-100/80 ring-1 ring-white/10">
                Núcleo galáctico
              </div>
            </motion.div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {yearSuns.map((sun, idx) => {
                const floatOffset = idx % 2 === 0 ? -2 : 2;
                const angle = idx * angleStep;
                const { x, y } = polarToCartesian(sun.orbitIndex, angle);

                return (
                  <motion.div
                    key={sun.id}
                    className="absolute left-1/2 top-1/2"
                    style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
                  >
                    <motion.div
                      className="flex flex-col items-center"
                      animate={{ y: [0, floatOffset, 0] }}
                      transition={{
                        duration: 6 + idx,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    >
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
                        floatOffset={floatOffset}
                        className="shadow-[0_0_26px_rgba(251,191,36,0.35)]"
                      />
                      <div className="mt-2 flex flex-col items-center gap-1">
                        <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[0.65rem] font-semibold text-indigo-100 ring-1 ring-white/10">
                          {sun.label}
                        </span>
                        <span className="text-[0.7rem] text-slate-300">{sun.year}</span>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalaxySunsScreen;
