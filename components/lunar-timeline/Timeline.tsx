/**
 * Timeline horizontal com scrubbing interativo
 * Suporta touch e mouse, com cursor central fixo
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { TimelineDay, TimelineTick, ScrubState } from './types';
import styles from './styles/Timeline.module.css';

interface TimelineProps {
  /** Data atualmente selecionada (no cursor central) */
  currentDate: Date;

  /** Callback quando a data mudar durante scrubbing */
  onDateChange: (date: Date) => void;

  /** Número de dias visíveis antes/depois do centro */
  visibleDays?: number;

  /** Pixels por hora */
  pixelsPerHour?: number;
}

/**
 * Abrevia dia da semana em português
 */
function getDayAbbr(date: Date): string {
  const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  return days[date.getDay()];
}

/**
 * Verifica se é hoje
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Verifica se é fim de semana
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function Timeline({
  currentDate,
  onDateChange,
  visibleDays = 7,
  pixelsPerHour = 12,
}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrubState, setScrubState] = useState<ScrubState>({
    isDragging: false,
    startX: 0,
    offsetX: 0,
    velocity: 0,
    lastTime: 0,
  });

  const [containerWidth, setContainerWidth] = useState(0);

  /**
   * Atualizar largura do container
   */
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  /**
   * Gerar dias visíveis na timeline
   */
  const generateTimelineDays = useCallback((): TimelineDay[] => {
    const days: TimelineDay[] = [];
    const centerX = containerWidth / 2;
    const dayWidth = pixelsPerHour * 24; // Largura de um dia em pixels

    // Gerar dias ao redor da data atual
    for (let i = -visibleDays; i <= visibleDays; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const x = centerX + i * dayWidth + scrubState.offsetX;

      days.push({
        date,
        dayAbbr: getDayAbbr(date),
        dayOfMonth: date.getDate(),
        isToday: isToday(date),
        isWeekend: isWeekend(date),
        x,
      });
    }

    return days;
  }, [currentDate, containerWidth, pixelsPerHour, visibleDays, scrubState.offsetX]);

  /**
   * Gerar ticks (marcações horárias)
   */
  const generateTicks = useCallback((): TimelineTick[] => {
    const ticks: TimelineTick[] = [];
    const centerX = containerWidth / 2;
    const hourWidth = pixelsPerHour;

    // Gerar ticks para horas visíveis
    const totalHours = visibleDays * 24 * 2; // Dias * 24h * 2 lados
    const startHour = -totalHours / 2;

    for (let i = 0; i < totalHours; i++) {
      const hourOffset = startHour + i;
      const time = new Date(currentDate);
      time.setHours(time.getHours() + hourOffset);

      const x = centerX + hourOffset * hourWidth + scrubState.offsetX;

      // Determinar tipo de tick
      let type: 'hour' | 'day' | 'major';
      let label: string | undefined;

      if (hourOffset % 24 === 0) {
        type = 'day';
        label = getDayAbbr(time);
      } else if (hourOffset % 6 === 0) {
        type = 'major';
        label = `${time.getHours()}h`;
      } else {
        type = 'hour';
      }

      ticks.push({ time, x, type, label });
    }

    return ticks;
  }, [currentDate, containerWidth, pixelsPerHour, visibleDays, scrubState.offsetX]);

  // Função auxiliar para converter posição em data (disponível para extensões futuras)
  // const xPositionToDate = useCallback((x: number): Date => {
  //   const centerX = containerWidth / 2;
  //   const deltaX = x - centerX - scrubState.offsetX;
  //   const hours = deltaX / pixelsPerHour;
  //   const newDate = new Date(currentDate);
  //   newDate.setHours(newDate.getHours() + hours);
  //   return newDate;
  // }, [containerWidth, currentDate, pixelsPerHour, scrubState.offsetX]);

  /**
   * Handler de início de drag (mouse/touch unificado)
   */
  const handleDragStart = useCallback((clientX: number) => {
    setScrubState((prev) => ({
      ...prev,
      isDragging: true,
      startX: clientX,
      lastTime: Date.now(),
    }));
  }, []);

  /**
   * Handler de movimento durante drag
   */
  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!scrubState.isDragging) return;

      const now = Date.now();
      const deltaX = scrubState.startX - clientX;
      const deltaTime = now - scrubState.lastTime;
      const velocity = deltaTime > 0 ? deltaX / deltaTime : 0;

      // Calcular nova data baseada no movimento
      const hoursShift = deltaX / pixelsPerHour;
      const newDate = new Date(currentDate);
      newDate.setTime(newDate.getTime() + hoursShift * 60 * 60 * 1000);

      // Atualizar data (isso resetará offsetX, mantendo cursor no centro)
      onDateChange(newDate);

      // Atualizar estado
      setScrubState((prev) => ({
        ...prev,
        startX: clientX,
        velocity,
        lastTime: now,
      }));
    },
    [scrubState, pixelsPerHour, currentDate, onDateChange]
  );

  /**
   * Handler de fim de drag
   */
  const handleDragEnd = useCallback(() => {
    setScrubState((prev) => ({
      ...prev,
      isDragging: false,
      offsetX: 0,
      velocity: 0,
    }));
  }, []);

  /**
   * Event listeners para mouse
   */
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (timelineRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        handleDragStart(e.clientX);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (scrubState.isDragging) {
        e.preventDefault();
        handleDragMove(e.clientX);
      }
    };

    const handleMouseUp = () => {
      if (scrubState.isDragging) {
        handleDragEnd();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [scrubState.isDragging, handleDragStart, handleDragMove, handleDragEnd]);

  /**
   * Event listeners para touch
   */
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (timelineRef.current?.contains(e.target as Node)) {
        const touch = e.touches[0];
        handleDragStart(touch.clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (scrubState.isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        handleDragMove(touch.clientX);
      }
    };

    const handleTouchEnd = () => {
      if (scrubState.isDragging) {
        handleDragEnd();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrubState.isDragging, handleDragStart, handleDragMove, handleDragEnd]);

  const days = generateTimelineDays();
  const ticks = generateTicks();

  return (
    <div ref={containerRef} className={styles.timelineContainer}>
      {/* Cursor central fixo */}
      <div className={styles.centerCursor}>
        <div className={styles.cursorLine} />
        <div className={styles.cursorArrow}>▼</div>
      </div>

      {/* Timeline scrollável */}
      <div
        ref={timelineRef}
        className={`${styles.timeline} ${scrubState.isDragging ? styles.dragging : ''}`}
      >
        {/* Ticks de horas */}
        <div className={styles.ticksLayer}>
          {ticks.map((tick, i) => (
            <div
              key={i}
              className={`${styles.tick} ${styles[tick.type]}`}
              style={{ left: `${tick.x}px` }}
            >
              {tick.label && <span className={styles.tickLabel}>{tick.label}</span>}
            </div>
          ))}
        </div>

        {/* Dias da semana */}
        <div className={styles.daysLayer}>
          {days.map((day, i) => (
            <div
              key={i}
              className={`${styles.day} ${day.isToday ? styles.today : ''} ${
                day.isWeekend ? styles.weekend : ''
              }`}
              style={{ left: `${day.x}px` }}
            >
              <div className={styles.dayAbbr}>{day.dayAbbr}</div>
              <div className={styles.dayNumber}>{day.dayOfMonth}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradientes de fade nas bordas */}
      <div className={styles.fadeLeft} />
      <div className={styles.fadeRight} />
    </div>
  );
}
