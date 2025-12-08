"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CelestialObject } from "../components/CelestialObject";
import { LuminousTrail } from "../components/LuminousTrail";
import MonthlyInsightModal from "@/components/MonthlyInsightModal";
import { useMonthlyInsights } from "@/hooks/useMonthlyInsights";
import type { CelestialType, ScreenProps } from "../types";

const LuaListScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMoonIndex, setSelectedMoonIndex] = useState(0);
  const [selectedMoonPhase, setSelectedMoonPhase] = useState<'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante'>('luaNova');
  const [isHoveringMoons, setIsHoveringMoons] = useState(false);
  const { saveInsight } = useMonthlyInsights();

  // 24 luas: 12 novas (cima) + 12 cheias (baixo), 6 visíveis por linha e o restante surge no hover.
  const topMoons: CelestialType[] = new Array(12).fill("luaNova");
  const bottomMoons: CelestialType[] = new Array(12).fill("luaCheia");
  const visiblePerRow = 4; // 8 visíveis (4 em cada linha), posicionados no centro
  const centerStart = Math.floor((topMoons.length - visiblePerRow) / 2); // 4

  const handleMoonClick = (index: number, phase: CelestialType) => {
    setSelectedMoonIndex(index);
    setSelectedMoonPhase(phase as any);
    setIsModalOpen(true);
  };

  const handleInsightSubmit = async (insight: string) => {
    await saveInsight(selectedMoonPhase, selectedMoonIndex, insight);
  };

  return (
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

      <div
        className="relative flex flex-col items-center gap-6"
        onMouseEnter={() => setIsHoveringMoons(true)}
        onMouseLeave={() => setIsHoveringMoons(false)}
      >
        {/* LINHA DE CIMA: 4 luas centrais visíveis, demais surgem no hover */}
        <div className="flex gap-3">
          {topMoons.map((phase, idx) => {
            const globalIndex = idx;
            const isCenter = idx >= centerStart && idx < centerStart + visiblePerRow;
            const isVisible = isCenter || isHoveringMoons;
            const delay =
              isVisible && !isCenter
                ? Math.abs(idx - (centerStart + visiblePerRow / 2)) * 0.05
                : 0;

            return (
              <motion.div
                key={`${phase}-${globalIndex}-row1`}
                whileHover={{ scale: 1.2 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay,
                }}
                animate={{
                  opacity: isVisible ? 1 : 0,
                  y: isVisible ? 0 : 14,
                  scale: isVisible ? 1 : 0.9,
                }}
                className={!isVisible ? "pointer-events-none" : ""}
              >
                <CelestialObject
                  type={phase}
                  interactive
                  onClick={() => handleMoonClick(globalIndex, phase)}
                  floatOffset={-1.5 + idx * 0.05}
                />
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="h-0.5 w-[620px] bg-gradient-to-r from-sky-300/60 via-sky-500/80 to-sky-300/60"
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* LINHA DE BAIXO: 4 luas centrais visíveis, demais surgem no hover */}
        <div className="flex gap-3">
          {bottomMoons.map((phase, idx) => {
            const globalIndex = topMoons.length + idx;
            const isCenter = idx >= centerStart && idx < centerStart + visiblePerRow;
            const isVisible = isCenter || isHoveringMoons;
            const delay =
              isVisible && !isCenter
                ? Math.abs(idx - (centerStart + visiblePerRow / 2)) * 0.05
                : 0;

            return (
              <motion.div
                key={`${phase}-${globalIndex}-row2`}
                whileHover={{ scale: 1.2 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay,
                }}
                animate={{
                  opacity: isVisible ? 1 : 0,
                  y: isVisible ? 0 : 14,
                  scale: isVisible ? 1 : 0.9,
                }}
                className={!isVisible ? "pointer-events-none" : ""}
              >
                <CelestialObject
                  type={phase}
                  interactive
                  onClick={() => handleMoonClick(globalIndex, phase)}
                  floatOffset={1.5 - idx * 0.05}
                />
              </motion.div>
            );
          })}
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

      <MonthlyInsightModal
        isOpen={isModalOpen}
        moonIndex={selectedMoonIndex}
        moonPhase={selectedMoonPhase}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleInsightSubmit}
      />
    </div>
  );
};

export default LuaListScreen;
