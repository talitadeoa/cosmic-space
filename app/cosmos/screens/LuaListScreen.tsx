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
  const { saveInsight } = useMonthlyInsights();

  // 8 luas. Se você tiver mais fases no seu tipo, pode trocar aqui.
  const moonPhases: CelestialType[] = [
    "luaNova",
    "luaCrescente",
    "luaCheia",
    "luaMinguante",
    "luaNova",
    "luaCrescente",
    "luaCheia",
    "luaMinguante",
  ];

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

      <div className="relative flex flex-col items-center gap-6">
        {/* LINHA DE CIMA: 4 luas */}
        <div className="flex gap-6">
          {moonPhases.slice(0, 4).map((phase, i) => (
            <motion.div
              key={`${phase}-${i}-top`}
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <CelestialObject
                type={phase}
                interactive
                onClick={() => handleMoonClick(i, phase)}
                floatOffset={-1.5 + i * 0.8}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="h-0.5 w-72 bg-gradient-to-r from-sky-300/60 via-sky-500/80 to-sky-300/60"
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* LINHA DE BAIXO: 4 luas */}
        <div className="flex gap-6">
          {moonPhases.slice(4).map((phase, i) => (
            <motion.div
              key={`${phase}-${i}-bottom`}
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <CelestialObject
                type={phase}
                interactive
                onClick={() => handleMoonClick(i + 4, phase)}
                floatOffset={1.5 - i * 0.8}
              />
            </motion.div>
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
