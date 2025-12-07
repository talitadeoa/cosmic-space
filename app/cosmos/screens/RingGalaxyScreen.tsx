"use client";

import React from "react";
import { MoonPhase } from "../components/MoonPhase";
import { Card } from "../components/Card";
import type { ScreenProps } from "../types";

const RingGalaxyScreen: React.FC<ScreenProps> = ({
  navigateTo,
  navigateWithFocus,
}) => {
  // Raio da órbita das luas (distância do centro)
  const orbitRadius = 180;
  
  // Calcular posições das 4 luas em um círculo (90 graus de distância)
  const moonPositions = [
    { angle: 0, phase: "cheia", label: "Top" },           // 0° - Top
    { angle: 90, phase: "quarto_crescente", label: "Right" },    // 90° - Right
    { angle: 180, phase: "nova", label: "Bottom" },       // 180° - Bottom
    { angle: 270, phase: "quarto_minguante", label: "Left" },    // 270° - Left
  ];

  const getMoonPosition = (angleDegrees: number) => {
    const angleRad = (angleDegrees * Math.PI) / 180;
    const x = Math.cos(angleRad) * orbitRadius;
    const y = Math.sin(angleRad) * orbitRadius;
    return { x, y };
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-violet-300/70 shadow-[0_0_55px_rgba(196,181,253,0.8)]">
        <Card
          interactive
          onClick={() => navigateTo("columnSolLuaPlaneta")}
          className="w-40"
        />
      </div>

      {/* Luas posicionadas em círculo orbital */}
      {moonPositions.map((moon, index) => {
        const { x, y } = getMoonPosition(moon.angle);
        const floatOffsets = [-2, 1, 2, -1];
        
        return (
          <div
            key={moon.label}
            className="absolute"
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
          >
            <MoonPhase
              phase={moon.phase as "cheia" | "nova" | "quarto_crescente" | "quarto_minguante"}
              size="sm"
              interactive
              onClick={(e) =>
                navigateWithFocus("luaList", {
                  event: e,
                  type: "lua",
                  size: "sm",
                })
              }
              floatOffset={floatOffsets[index]}
            />
          </div>
        );
      })}
    </div>
  );
};

export default RingGalaxyScreen;
