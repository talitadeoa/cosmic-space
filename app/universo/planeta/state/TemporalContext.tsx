'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TemporalContextType {
  // Data e hora
  now: Date;
  year: number;
  month: number;
  day: number;
  weekNumber: number;
  weekDay: number; // 0 = domingo, 6 = sábado

  // Fase lunar atual (aproximada)
  currentMoonPhase: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante' | null;
  currentZodiacSign: string | null;

  // Utilitários
  getDateRange: (type: 'month' | 'week' | 'year') => { start: Date; end: Date };
  isToday: (date: Date) => boolean;
}

const TemporalContext = createContext<TemporalContextType | undefined>(undefined);

/**
 * Calcula a fase lunar aproximada baseado na data
 * Usa o método de cálculo simples para fase lunar
 */
function calculateMoonPhase(date: Date): 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante' {
  // Data de referência: lua nova (01/01/2000)
  const known_new_moon = new Date(2000, 0, 6);
  const synodic_month = 29.53058867;

  const diff = (date.getTime() - known_new_moon.getTime()) / (1000 * 60 * 60 * 24);
  const days_into_cycle = diff % synodic_month;

  if (days_into_cycle < 1.5 || days_into_cycle > synodic_month - 1.5) {
    return 'luaNova';
  } else if (days_into_cycle < synodic_month / 2 - 1.2) {
    return 'luaCrescente';
  } else if (days_into_cycle < synodic_month / 2 + 1.2) {
    return 'luaCheia';
  } else {
    return 'luaMinguante';
  }
}

/**
 * Calcula o signo zodiacal aproximado baseado na data
 */
function calculateZodiacSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const zodiacSigns: { name: string; start: [number, number]; end: [number, number] }[] = [
    { name: 'Áries', start: [3, 21], end: [4, 19] },
    { name: 'Touro', start: [4, 20], end: [5, 20] },
    { name: 'Gêmeos', start: [5, 21], end: [6, 20] },
    { name: 'Câncer', start: [6, 21], end: [7, 22] },
    { name: 'Leão', start: [7, 23], end: [8, 22] },
    { name: 'Virgem', start: [8, 23], end: [9, 22] },
    { name: 'Libra', start: [9, 23], end: [10, 22] },
    { name: 'Escorpião', start: [10, 23], end: [11, 21] },
    { name: 'Sagitário', start: [11, 22], end: [12, 21] },
    { name: 'Capricórnio', start: [12, 22], end: [1, 19] },
    { name: 'Aquário', start: [1, 20], end: [2, 18] },
    { name: 'Peixes', start: [2, 19], end: [3, 20] },
  ];

  for (const sign of zodiacSigns) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;

    if (startMonth === endMonth) {
      if (month === startMonth && day >= startDay && day <= endDay) {
        return sign.name;
      }
    } else if (startMonth < endMonth) {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign.name;
      }
    } else {
      // Caso especial: Capricórnio (dezembro-janeiro)
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign.name;
      }
    }
  }

  return 'Capricórnio';
}

/**
 * Calcula o número da semana no ano (ISO 8601)
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function TemporalProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState<Date>(new Date());
  const [currentMoonPhase, setCurrentMoonPhase] = useState<
    'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante' | null
  >(null);
  const [currentZodiacSign, setCurrentZodiacSign] = useState<string | null>(null);

  // Atualizar data/hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      const newDate = new Date();
      setNow(newDate);
      setCurrentMoonPhase(calculateMoonPhase(newDate));
      setCurrentZodiacSign(calculateZodiacSign(newDate));
    }, 60000); // A cada minuto

    // Calcular imediatamente ao montar
    const newDate = new Date();
    setNow(newDate);
    setCurrentMoonPhase(calculateMoonPhase(newDate));
    setCurrentZodiacSign(calculateZodiacSign(newDate));

    return () => clearInterval(timer);
  }, []);

  const getDateRange = (type: 'month' | 'week' | 'year') => {
    const current = new Date(now);

    if (type === 'month') {
      const start = new Date(current.getFullYear(), current.getMonth(), 1);
      const end = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      return { start, end };
    }

    if (type === 'week') {
      const current = new Date(now);
      const first = current.getDate() - current.getDay();
      const start = new Date(current.setDate(first));
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start, end };
    }

    // year
    const start = new Date(current.getFullYear(), 0, 1);
    const end = new Date(current.getFullYear(), 11, 31);
    return { start, end };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const value: TemporalContextType = {
    now,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    weekNumber: getWeekNumber(now),
    weekDay: now.getDay(),
    currentMoonPhase,
    currentZodiacSign,
    getDateRange,
    isToday,
  };

  return <TemporalContext.Provider value={value}>{children}</TemporalContext.Provider>;
}

export function useTemporal() {
  const context = useContext(TemporalContext);
  if (!context) {
    throw new Error('useTemporal deve ser usado dentro de um TemporalProvider');
  }
  return context;
}
