/**
 * Componente principal de Timeline Lunar Interativa
 * Orquestra MoonRenderer + Timeline com estado compartilhado
 */

'use client';

import { useState, useCallback } from 'react';
import { MoonRenderer } from './MoonRenderer';
import { Timeline } from './Timeline';
import { useLunarPhaseUSNO } from '@/hooks/useLunarPhaseUSNO';
import type { LunarTimelineProps, MoonData } from './types';
import styles from './styles/LunarTimeline.module.css';

// Função auxiliar para converter dados do hook para MoonData completo
function createMoonData(phaseData: any, date: Date): MoonData {
  const illumination = phaseData?.illumination || 0.5;
  const ageDays = phaseData?.age_days || 14.76;
  const phaseFraction = ageDays / 29.53058867;
  
  return {
    illumination,
    phaseFraction,
    isWaxing: phaseData?.is_waxing ?? true,
    phaseName: phaseData?.phase || 'N/A',
    terminatorAngle: (phaseFraction * 360) % 360,
    date,
    daysSinceNew: ageDays,
    lunarAge: ageDays,
    zodiacSign: phaseData?.zodiac_sign,
  };
}

export function LunarTimeline({
  initialDate,
  onDateChange,
  timezone,
  location,
  showDetails = true,
  className = '',
}: LunarTimelineProps) {
  // Estado: data selecionada atual
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());

  // Hook para dados lunares com novo cache deduplica
  const { phase: phaseData, loading } = useLunarPhaseUSNO(selectedDate);

  /**
   * Handler de mudança de data da timeline
   * Otimizado com useCallback para evitar re-renders
   */
  const handleDateChange = useCallback(
    (newDate: Date) => {
      setSelectedDate(newDate);

      // Chamar callback externo se fornecido
      if (onDateChange && phaseData) {
        onDateChange(newDate, {
          phaseName: phaseData.phase,
          illumination: phaseData.illumination,
          lunarAge: phaseData.age_days || 0,
          isWaxing: phaseData.is_waxing ?? false,
          zodiacSign: phaseData.zodiac_sign || 'N/A',
        });
      }
    },
    [onDateChange, phaseData]
  );

  /**
   * Formatar data para exibição
   */
  const formatDateTime = useCallback(
    (date: Date): string => {
      return new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
      }).format(date);
    },
    [timezone]
  );

  /**
   * Formatar iluminação como percentual
   */
  const illuminationPercentage = phaseData ? Math.round(phaseData.illumination * 100) : 0;

  if (loading) {
    return (
      <div className={`${styles.lunarTimelineContainer} ${className}`}>
        <div className={styles.moonSection}>
          <div className={styles.moonRenderer}>
            <div className="text-center text-gray-400">⏳ Carregando dados lunares...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!phaseData) {
    return (
      <div className={`${styles.lunarTimelineContainer} ${className}`}>
        <div className={styles.moonSection}>
          <div className={styles.moonRenderer}>
            <div className="text-center text-red-400">❌ Erro ao carregar dados</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.lunarTimelineContainer} ${className}`}>
      {/* Área central: Lua + Informações */}
      <div className={styles.moonSection}>
        {/* Renderizador da Lua */}
        <div className={styles.moonRenderer}>
          <MoonRenderer
            moonData={phaseData ? createMoonData(phaseData, selectedDate) : {
              illumination: 0.5,
              phaseFraction: 0.5,
              isWaxing: true,
              phaseName: 'N/A',
              terminatorAngle: 180,
              date: selectedDate,
              daysSinceNew: 14.76,
              lunarAge: 14.76,
            }}
            size={320}
            config={{
              showCraters: true,
              showGlow: true,
              terminatorSoftness: 0.3,
              earthshineIntensity: 0.15,
            }}
          />
        </div>

        {/* Informações textuais */}
        <div className={styles.moonInfo}>
          {/* Nome da fase */}
          <div className={styles.phaseName}>{phaseData.phase}</div>

          {/* Data e hora */}
          <div className={styles.dateTime}>{formatDateTime(selectedDate)}</div>

          {/* Detalhes adicionais */}
          {showDetails && (
            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Iluminação</span>
                <span className={styles.detailValue}>{illuminationPercentage}%</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Idade</span>
                <span className={styles.detailValue}>{(phaseData.age_days || 0).toFixed(1)} dias</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Tendência</span>
                <span className={styles.detailValue}>
                  {phaseData.is_waxing ? '↑ Crescente' : '↓ Minguante'}
                </span>
              </div>
              
              {phaseData.zodiac_sign && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Signo</span>
                  <span className={styles.detailValue}>{phaseData.zodiac_sign}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timeline horizontal na parte inferior */}
      <div className={styles.timelineSection}>
        <Timeline
          currentDate={selectedDate}
          onDateChange={handleDateChange}
          visibleDays={7}
          pixelsPerHour={12}
        />
      </div>

      {/* Texto de instrução (opcional) */}
      <div className={styles.instruction}>Deslize a timeline para viajar no tempo</div>
    </div>
  );
}

/**
 * Export com memo para otimização
 */
export default LunarTimeline;
