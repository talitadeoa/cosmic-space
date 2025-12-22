import React, { useState } from "react";
import { motion } from "framer-motion";
import { CelestialObject } from "../CelestialObject";
import type { HighlightTarget, MonthEntry } from "../../utils/luaList";
import { ANIMATION_CONFIG, getFloatOffset } from "../../utils/luaList";
import type { MoonPhase } from "../../utils/moonPhases";

type MoonRowProps = {
  phase: MoonPhase;
  direction: "up" | "down";
  months: MonthEntry[];
  highlightTarget: HighlightTarget | null;
  trackWidth: number;
  virtualOffsetPx: number;
  tileWidth: number;
  gap: number;
  diagonalStep: number;
  baseYOffset: number;
  onMoonClick: (month: MonthEntry, phase: MoonPhase) => void;
};

const MoonRow: React.FC<MoonRowProps> = ({
  phase,
  direction,
  months,
  highlightTarget,
  trackWidth,
  virtualOffsetPx,
  tileWidth,
  gap,
  diagonalStep,
  baseYOffset,
  onMoonClick,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  return (
  <div
    className="flex min-w-max items-center"
    style={{
      minWidth: trackWidth,
      paddingLeft: virtualOffsetPx,
      columnGap: gap,
    }}
  >
    {months.map((month, idx) => {
      const monthKey = `${month.year}-${String(month.monthNumber).padStart(2, "0")}`;
      const isHovered = hoveredMonth === monthKey;
      
      const isHighlighted =
        highlightTarget &&
        highlightTarget.phase === phase &&
        highlightTarget.monthNumber === month.monthNumber &&
        highlightTarget.year === month.year;

      const floatOffset = getFloatOffset(direction, idx);
      const delay = idx * 0.018;
      const diagonalOffset = baseYOffset - idx * diagonalStep;

      const monthPhaseLabel = phase === "luaNova" ? month.newMoonSign : month.fullMoonSign;
      const monthPhaseDate = phase === "luaNova" ? month.newMoonDate : month.fullMoonDate;

      return (
        <motion.div
          key={`${phase}-${monthKey}`}
          transition={{
            ...ANIMATION_CONFIG.spring,
            delay,
          }}
          animate={{
            opacity: 1,
            y: diagonalOffset,
            scale: 1,
          }}
          initial={{ opacity: 0, y: diagonalOffset + 10, scale: 0.95 }}
          onMouseEnter={() => setHoveredMonth(monthKey)}
          onMouseLeave={() => setHoveredMonth(null)}
          style={{ width: tileWidth }}
          className="relative"
        >
          <div className="relative flex flex-col items-center justify-center cursor-pointer">
            {/* Tooltip com informações do mês */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: direction === "up" ? 10 : -10 }}
                animate={{ opacity: 1, y: direction === "up" ? -8 : 8 }}
                exit={{ opacity: 0, y: direction === "up" ? 10 : -10 }}
                transition={{ duration: 0.2 }}
                className={`absolute z-50 whitespace-nowrap rounded-lg bg-slate-900/95 px-3 py-2 text-xs text-sky-200 shadow-lg backdrop-blur border border-sky-400/30 pointer-events-none ${
                  direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
                }`}
              >
                <div className="font-semibold">{month.monthName} {month.year}</div>
                <div className="text-slate-300/80 text-[10px] mt-1">
                  {phase === "luaNova" ? "🌑" : "🌕"} {monthPhaseLabel || "—"}
                </div>
                {monthPhaseDate && (
                  <div className="text-slate-400 text-[10px]">{monthPhaseDate}</div>
                )}
              </motion.div>
            )}

            {isHighlighted && (
              <motion.div
                className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-sky-400/20 blur-xl"
                animate={{ opacity: [0.5, 0.25, 0.5], scale: [1, 1.05, 1] }}
                transition={ANIMATION_CONFIG.glow}
              />
            )}
            
            {/* Hover glow effect - somente se hover */}
            {isHovered && (
              <motion.div
                className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-sky-400/0 via-sky-300/50 to-sky-400/0 blur-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
            
            <CelestialObject
              type={phase}
              interactive
              onClick={() => onMoonClick(month, phase)}
              floatOffset={floatOffset}
              className={
                isHovered
                  ? "ring-2 ring-sky-300/80 shadow-[0_0_0_8px_rgba(56,189,248,0.25)] transition-all duration-200 scale-110"
                  : isHighlighted
                  ? "ring-2 ring-sky-300/80 shadow-[0_0_0_5px_rgba(56,189,248,0.28)] transition-all duration-300"
                  : "ring-1 ring-white/5 transition-all duration-300"
              }
            />
          </div>
        </motion.div>
      );
    })}
  </div>
);

  return (
    <div
      className="flex min-w-max items-center"
      style={{
        minWidth: trackWidth,
        paddingLeft: virtualOffsetPx,
        columnGap: gap,
      }}
    >
      {months.map((month, idx) => {
        const monthKey = `${month.year}-${String(month.monthNumber).padStart(2, "0")}`;
        const isHovered = hoveredMonth === monthKey;
        
        const isHighlighted =
          highlightTarget &&
          highlightTarget.phase === phase &&
          highlightTarget.monthNumber === month.monthNumber &&
          highlightTarget.year === month.year;

        const floatOffset = getFloatOffset(direction, idx);
        const delay = idx * 0.018;
        const diagonalOffset = baseYOffset - idx * diagonalStep;

        const monthPhaseLabel = phase === "luaNova" ? month.newMoonSign : month.fullMoonSign;
        const monthPhaseDate = phase === "luaNova" ? month.newMoonDate : month.fullMoonDate;

        return (
          <motion.div
            key={`${phase}-${monthKey}`}
            transition={{
              ...ANIMATION_CONFIG.spring,
              delay,
            }}
            animate={{
              opacity: 1,
              y: diagonalOffset,
              scale: 1,
            }}
            initial={{ opacity: 0, y: diagonalOffset + 10, scale: 0.95 }}
            onMouseEnter={() => setHoveredMonth(monthKey)}
            onMouseLeave={() => setHoveredMonth(null)}
            style={{ width: tileWidth }}
            className="relative"
          >
            <div className="relative flex flex-col items-center justify-center cursor-pointer">
              {/* Tooltip com informações do mês */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: direction === "up" ? 10 : -10 }}
                  animate={{ opacity: 1, y: direction === "up" ? -8 : 8 }}
                  exit={{ opacity: 0, y: direction === "up" ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute z-50 whitespace-nowrap rounded-lg bg-slate-900/95 px-3 py-2 text-xs text-sky-200 shadow-lg backdrop-blur border border-sky-400/30 pointer-events-none ${
                    direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
                  }`}
                >
                  <div className="font-semibold">{month.monthName} {month.year}</div>
                  <div className="text-slate-300/80 text-[10px] mt-1">
                    {phase === "luaNova" ? "🌑" : "🌕"} {monthPhaseLabel || "—"}
                  </div>
                  {monthPhaseDate && (
                    <div className="text-slate-400 text-[10px]">{monthPhaseDate}</div>
                  )}
                </motion.div>
              )}

              {isHighlighted && (
                <motion.div
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-sky-400/20 blur-xl"
                  animate={{ opacity: [0.5, 0.25, 0.5], scale: [1, 1.05, 1] }}
                  transition={ANIMATION_CONFIG.glow}
                />
              )}
              
              {/* Hover glow effect - somente se hover */}
              {isHovered && (
                <motion.div
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-sky-400/0 via-sky-300/50 to-sky-400/0 blur-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
              
              <CelestialObject
                type={phase}
                interactive
                onClick={() => onMoonClick(month, phase)}
                floatOffset={floatOffset}
                className={
                  isHovered
                    ? "ring-2 ring-sky-300/80 shadow-[0_0_0_8px_rgba(56,189,248,0.25)] transition-all duration-200 scale-110"
                    : isHighlighted
                    ? "ring-2 ring-sky-300/80 shadow-[0_0_0_5px_rgba(56,189,248,0.28)] transition-all duration-300"
                    : "ring-1 ring-white/5 transition-all duration-300"
                }
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MoonRow;
