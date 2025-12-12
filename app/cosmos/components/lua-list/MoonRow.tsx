import React from "react";
import { motion } from "framer-motion";
import { CelestialObject } from "../CelestialObject";
import type { HighlightTarget, MonthEntry } from "../../utils/luaList";
import { ANIMATION_CONFIG, getFloatOffset } from "../../utils/luaList";
import type { MoonPhase } from "../../utils/todoStorage";

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
}) => (
  <div
    className="flex min-w-max items-center"
    style={{
      minWidth: trackWidth,
      paddingLeft: virtualOffsetPx,
      columnGap: gap,
    }}
  >
    {months.map((month, idx) => {
      const isHighlighted =
        highlightTarget &&
        highlightTarget.phase === phase &&
        highlightTarget.monthNumber === month.monthNumber &&
        highlightTarget.year === month.year;

      const floatOffset = getFloatOffset(direction, idx);
      const delay = idx * 0.018;
      const diagonalOffset = baseYOffset - idx * diagonalStep;

      return (
        <motion.div
          key={`${phase}-${month.year}-${String(month.monthNumber).padStart(2, "0")}`}
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
          style={{ width: tileWidth }}
        >
          <div className="relative flex items-center justify-center">
            {isHighlighted && (
              <motion.div
                className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-sky-400/20 blur-xl"
                animate={{ opacity: [0.5, 0.25, 0.5], scale: [1, 1.05, 1] }}
                transition={ANIMATION_CONFIG.glow}
              />
            )}
            <CelestialObject
              type={phase}
              interactive
              onClick={() => onMoonClick(month, phase)}
              floatOffset={floatOffset}
              className={
                isHighlighted
                  ? "ring-2 ring-sky-300/80 shadow-[0_0_0_5px_rgba(56,189,248,0.28)]"
                  : "ring-1 ring-white/5"
              }
            />
          </div>
        </motion.div>
      );
    })}
  </div>
);

export default MoonRow;
