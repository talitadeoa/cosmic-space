"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CelestialObject } from "../components/CelestialObject";
import { LuminousTrail } from "../components/LuminousTrail";
import MonthlyInsightModal from "@/components/MonthlyInsightModal";
import { useMonthlyInsights } from "@/hooks/useMonthlyInsights";
import { useMoonCalendar } from "@/hooks/useMoonCalendar";
import type { CelestialType, ScreenProps } from "../types";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const LuaListScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonthNumber, setSelectedMonthNumber] = useState(1);
  const [selectedMoonPhase, setSelectedMoonPhase] = useState<'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante'>('luaNova');
  const [isHoveringMoons, setIsHoveringMoons] = useState(false);
  const [hoveredMoon, setHoveredMoon] = useState<{ monthNumber: number; phase: CelestialType } | null>(null);
  const { saveInsight } = useMonthlyInsights();
  const timezone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const endDate = `${currentYear}-12-31`;
  const {
    calendar: moonCalendar,
    generatedAt,
    isLoading: isCalendarLoading,
    error: calendarError,
  } = useMoonCalendar({
    start: startDate,
    end: endDate,
    tz: timezone,
    autoRefreshMs: 1000 * 60 * 60 * 6, // revalida a cada 6h
  });

  // 24 luas: 12 novas (cima) + 12 cheias (baixo), 6 visíveis por linha e o restante surge no hover.
  const topMoons: CelestialType[] = new Array(12).fill("luaNova");
  const bottomMoons: CelestialType[] = new Array(12).fill("luaCheia");
  const visiblePerRow = 4; // 8 visíveis (4 em cada linha), posicionados no centro
  const centerStart = Math.floor((topMoons.length - visiblePerRow) / 2); // 4

  const moonSignData = useMemo(() => {
    const base = MONTH_NAMES.map((month) => ({
      month,
      newMoonSign: "",
      fullMoonSign: "",
      newMoonDate: "",
      fullMoonDate: "",
    }));

    moonCalendar.forEach((day) => {
      const date = new Date(`${day.date}T00:00:00Z`);
      const monthIndex = Number.isNaN(date.getTime()) ? null : date.getUTCMonth();
      if (monthIndex === null || monthIndex < 0 || monthIndex > 11) return;

      const sign = day.sign?.trim() || "";

      if (day.normalizedPhase === "luaNova" && !base[monthIndex].newMoonSign) {
        base[monthIndex].newMoonSign = sign;
        base[monthIndex].newMoonDate = day.date;
      }

      if (day.normalizedPhase === "luaCheia" && !base[monthIndex].fullMoonSign) {
        base[monthIndex].fullMoonSign = sign;
        base[monthIndex].fullMoonDate = day.date;
      }
    });

    return base;
  }, [moonCalendar]);

  const formatDateLabel = (isoDate?: string) => {
    if (!isoDate) return "";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }).format(new Date(`${isoDate}T00:00:00Z`));
    } catch (error) {
      return isoDate;
    }
  };

  const getMoonInfo = (monthNumber: number, phase: CelestialType) => {
    const index = ((monthNumber - 1) % 12 + 12) % 12;
    const data = moonSignData[index];
    const monthName = data?.month ?? MONTH_NAMES[index];
    const signRaw = phase === "luaNova" ? data?.newMoonSign : data?.fullMoonSign;
    const dateRaw = phase === "luaNova" ? data?.newMoonDate : data?.fullMoonDate;
    const sign = signRaw?.trim();
    const dateLabel = formatDateLabel(dateRaw);
    const signParts = [
      sign && sign.length > 0 ? `em ${sign}` : null,
      dateLabel ? `• ${dateLabel}` : null,
    ].filter(Boolean);

    return {
      monthName,
      signLabel: signParts.length > 0 ? signParts.join(" ") : "— aguardando sincronização",
      phaseLabel: phase === "luaNova" ? "Lua Nova" : "Lua Cheia",
    };
  };

  const handleMoonClick = (monthNumber: number, phase: CelestialType) => {
    setSelectedMonthNumber(monthNumber);
    setSelectedMoonPhase(phase as any);
    setIsModalOpen(true);
  };

  const handleInsightSubmit = async (insight: string) => {
    await saveInsight(selectedMoonPhase, selectedMonthNumber, insight);
  };

  const selectedMoonInfo = getMoonInfo(selectedMonthNumber, selectedMoonPhase);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between py-16">
      <LuminousTrail />
      <div className="absolute right-4 top-4 rounded-full border border-white/5 bg-slate-900/60 px-4 py-2 text-[11px] text-slate-100 shadow-lg shadow-sky-900/30 backdrop-blur-md">
        {isCalendarLoading && "Sincronizando calendário lunar..."}
        {!isCalendarLoading && calendarError && `Erro ao sincronizar: ${calendarError}`}
        {!isCalendarLoading && !calendarError && (generatedAt ? `Dados gerados em ${formatDateLabel(generatedAt)}` : "Calendário lunar pronto")}
      </div>

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
            const monthNumber = idx + 1; // mês representado pela lua nova
            const isCenter = idx >= centerStart && idx < centerStart + visiblePerRow;
            const isVisible = isCenter || isHoveringMoons;
            const delay =
              isVisible && !isCenter
                ? Math.abs(idx - (centerStart + visiblePerRow / 2)) * 0.05
                : 0;

            return (
              <motion.div
                key={`${phase}-${monthNumber}-row1`}
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
                <div
                  className="relative flex items-center justify-center"
                  onMouseEnter={() => setHoveredMoon({ monthNumber, phase })}
                  onMouseLeave={() => setHoveredMoon(null)}
                  onTouchStart={() => setHoveredMoon({ monthNumber, phase })}
                  onTouchEnd={() => setHoveredMoon(null)}
                >
                  {hoveredMoon && hoveredMoon.monthNumber === monthNumber && hoveredMoon.phase === phase && (() => {
                    const info = getMoonInfo(monthNumber, phase);
                    return (
                      <div className="pointer-events-none absolute -top-20 left-1/2 z-20 w-48 -translate-x-1/2 rounded-2xl border border-white/15 bg-slate-900/85 px-3 py-2 text-center text-white shadow-lg shadow-sky-900/30 backdrop-blur-md">
                        <div className="text-xs font-semibold tracking-wide">{info.monthName}</div>
                        <div className="text-[11px] text-slate-200/85">
                          {info.phaseLabel} {info.signLabel}
                        </div>
                      </div>
                    );
                  })()}
                  <CelestialObject
                    type={phase}
                    interactive
                    onClick={() => handleMoonClick(monthNumber, phase)}
                    floatOffset={-1.5 + idx * 0.05}
                  />
                </div>
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
            const monthNumber = ((idx + 6) % topMoons.length) + 1; // 6 meses após a lua nova acima
            const isCenter = idx >= centerStart && idx < centerStart + visiblePerRow;
            const isVisible = isCenter || isHoveringMoons;
            const delay =
              isVisible && !isCenter
                ? Math.abs(idx - (centerStart + visiblePerRow / 2)) * 0.05
                : 0;

            return (
              <motion.div
                key={`${phase}-${monthNumber}-row2`}
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
                <div
                  className="relative flex items-center justify-center"
                  onMouseEnter={() => setHoveredMoon({ monthNumber, phase })}
                  onMouseLeave={() => setHoveredMoon(null)}
                  onTouchStart={() => setHoveredMoon({ monthNumber, phase })}
                  onTouchEnd={() => setHoveredMoon(null)}
                >
                  {hoveredMoon && hoveredMoon.monthNumber === monthNumber && hoveredMoon.phase === phase && (() => {
                    const info = getMoonInfo(monthNumber, phase);
                    return (
                      <div className="pointer-events-none absolute -top-20 left-1/2 z-20 w-48 -translate-x-1/2 rounded-2xl border border-white/15 bg-slate-900/85 px-3 py-2 text-center text-white shadow-lg shadow-sky-900/30 backdrop-blur-md">
                        <div className="text-xs font-semibold tracking-wide">{info.monthName}</div>
                        <div className="text-[11px] text-slate-200/85">
                          {info.phaseLabel} {info.signLabel}
                        </div>
                      </div>
                    );
                  })()}
                  <CelestialObject
                    type={phase}
                    interactive
                    onClick={() => handleMoonClick(monthNumber, phase)}
                    floatOffset={1.5 - idx * 0.05}
                  />
                </div>
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
        moonIndex={selectedMonthNumber}
        moonPhase={selectedMoonPhase}
        moonSignLabel={selectedMoonInfo.signLabel}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleInsightSubmit}
      />
    </div>
  );
};

export default LuaListScreen;
