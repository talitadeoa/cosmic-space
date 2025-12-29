/**
 * Componente principal: Calendário Lunar em layout 2 colunas (hero + grid)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  LunarCalendarProps,
  LunarData,
} from './types';
import {
  generateCalendarGrid,
  enrichCalendarWithLunarData,
  getMonthName,
} from './utils';
import { LunarHero } from './LunarHero';
import { CalendarGrid } from './CalendarGrid';
import { NavigationControls } from './NavigationControls';
import styles from './styles/LunarCalendarWidget.module.css';

export const LunarCalendarWidget: React.FC<LunarCalendarProps> = ({
  month: initialMonth,
  year: initialYear,
  selectedDate,
  onSelectDate,
  lunarDataByDate,
  onMonthChange,
  locale = 'pt-BR',
  ariaLabel,
}) => {
  // Estado local para navegação de mês
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [displayMonth, setDisplayMonth] = useState(initialMonth);
  const [displayYear, setDisplayYear] = useState(initialYear);
  const [isAnimating, setIsAnimating] = useState(false);

  // Determina a data selecionada (usa selectedDate ou define hoje)
  const effectiveSelectedDate = useMemo(() => {
    return selectedDate || new Date();
  }, [selectedDate]);

  // Gera e enriquece o grid do calendário
  const calendarWeeks = useMemo(() => {
    const baseGrid = generateCalendarGrid(displayYear, displayMonth);
    return enrichCalendarWithLunarData(baseGrid, lunarDataByDate, effectiveSelectedDate);
  }, [displayYear, displayMonth, lunarDataByDate, effectiveSelectedDate]);

  // Função de navegação anterior
  const handlePrevMonth = useCallback(() => {
    setIsAnimating(true);

    // Agenda a mudança com animação
    setTimeout(() => {
      if (displayMonth === 0) {
        setDisplayMonth(11);
        setDisplayYear((prev) => prev - 1);
      } else {
        setDisplayMonth((prev) => prev - 1);
      }
      setIsAnimating(false);
    }, 150);

    // Notifica callback externo
    if (onMonthChange) {
      const newMonth = displayMonth === 0 ? 11 : displayMonth - 1;
      const newYear = displayMonth === 0 ? displayYear - 1 : displayYear;
      onMonthChange(newMonth, newYear);
    }
  }, [displayMonth, displayYear, onMonthChange]);

  // Função de navegação próxima
  const handleNextMonth = useCallback(() => {
    setIsAnimating(true);

    setTimeout(() => {
      if (displayMonth === 11) {
        setDisplayMonth(0);
        setDisplayYear((prev) => prev + 1);
      } else {
        setDisplayMonth((prev) => prev + 1);
      }
      setIsAnimating(false);
    }, 150);

    if (onMonthChange) {
      const newMonth = displayMonth === 11 ? 0 : displayMonth + 1;
      const newYear = displayMonth === 11 ? displayYear + 1 : displayYear;
      onMonthChange(newMonth, newYear);
    }
  }, [displayMonth, displayYear, onMonthChange]);

  // Função para voltar ao mês atual
  const handleToday = useCallback(() => {
    const today = new Date();
    setDisplayMonth(today.getMonth());
    setDisplayYear(today.getFullYear());

    if (onSelectDate) {
      onSelectDate(today);
    }

    if (onMonthChange) {
      onMonthChange(today.getMonth(), today.getFullYear());
    }
  }, [onSelectDate, onMonthChange]);

  // Obtém dados da lua para a data selecionada
  const selectedLunarData = useMemo(() => {
    const dateKey = `${effectiveSelectedDate.getFullYear()}-${String(
      effectiveSelectedDate.getMonth() + 1
    ).padStart(2, '0')}-${String(effectiveSelectedDate.getDate()).padStart(2, '0')}`;

    return lunarDataByDate[dateKey];
  }, [effectiveSelectedDate, lunarDataByDate]);

  const monthName = getMonthName(displayMonth, locale);

  return (
    <div
      className={styles.lunarCalendarWidget}
      role="main"
      aria-label={ariaLabel || `Calendário Lunar - ${monthName} ${displayYear}`}
    >
      {/* Header com navegação */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          {monthName} <span className={styles.year}>{displayYear}</span>
        </h1>

        <NavigationControls
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          locale={locale}
        />
      </div>

      {/* Layout 2 colunas */}
      <div className={`${styles.mainContainer} ${isAnimating ? styles.animating : ''}`}>
        {/* Coluna esquerda: Hero lunar */}
        <div className={styles.heroSection}>
          <LunarHero
            date={effectiveSelectedDate}
            lunarData={selectedLunarData}
            locale={locale}
          />
        </div>

        {/* Coluna direita: Grid calendário */}
        <div className={styles.gridSection}>
          <CalendarGrid
            weeks={calendarWeeks}
            selectedDate={effectiveSelectedDate}
            onSelectDate={onSelectDate}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
};

export default LunarCalendarWidget;
