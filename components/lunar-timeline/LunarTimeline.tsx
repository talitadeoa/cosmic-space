/**
 * Componente principal de Timeline Lunar Interativa
 * Orquestra MoonRenderer + Timeline com estado compartilhado
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { MoonRenderer } from './MoonRenderer';
import { Timeline } from './Timeline';
import { getMoonData } from './utils/moonPhase';
import type { LunarTimelineProps, MoonData } from './types';
import styles from './styles/LunarTimeline.module.css';

export function LunarTimeline({
  initialDate,
  onDateChange,
  timezone,
  location,
  showDetails = true,
  className = ''
}: LunarTimelineProps) {
  // Estado: data selecionada atual
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate || new Date()
  );

  // Estado: dados lunares calculados
  const [moonData, setMoonData] = useState<MoonData>(() =>
    getMoonData(selectedDate, location, timezone)
  );

  /**
   * Atualizar dados lunares quando data mudar
   * Usa useMemo para evitar recálculos desnecessários
   */
  const currentMoonData = useMemo(() => {
    return getMoonData(selectedDate, location, timezone);
  }, [selectedDate, location, timezone]);

  /**
   * Sincronizar moonData com currentMoonData
   */
  useEffect(() => {
    setMoonData(currentMoonData);
  }, [currentMoonData]);

  /**
   * Handler de mudança de data da timeline
   * Otimizado com useCallback para evitar re-renders
   */
  const handleDateChange = useCallback((newDate: Date) => {
    setSelectedDate(newDate);
    
    // Chamar callback externo se fornecido
    if (onDateChange) {
      const newMoonData = getMoonData(newDate, location, timezone);
      onDateChange(newDate, newMoonData);
    }
  }, [onDateChange, location, timezone]);

  /**
   * Formatar data para exibição
   */
  const formatDateTime = useCallback((date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
    }).format(date);
  }, [timezone]);

  /**
   * Formatar iluminação como percentual
   */
  const illuminationPercentage = Math.round(moonData.illumination * 100);

  return (
    <div className={`${styles.lunarTimelineContainer} ${className}`}>
      {/* Área central: Lua + Informações */}
      <div className={styles.moonSection}>
        {/* Renderizador da Lua */}
        <div className={styles.moonRenderer}>
          <MoonRenderer
            moonData={moonData}
            size={320}
            config={{
              showCraters: true,
              showGlow: true,
              terminatorSoftness: 0.3,
              earthshineIntensity: 0.15
            }}
          />
        </div>

        {/* Informações textuais */}
        <div className={styles.moonInfo}>
          {/* Nome da fase */}
          <div className={styles.phaseName}>
            {moonData.phaseName}
          </div>

          {/* Data e hora */}
          <div className={styles.dateTime}>
            {formatDateTime(selectedDate)}
          </div>

          {/* Detalhes adicionais */}
          {showDetails && (
            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Iluminação</span>
                <span className={styles.detailValue}>
                  {illuminationPercentage}%
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Idade</span>
                <span className={styles.detailValue}>
                  {moonData.lunarAge.toFixed(1)} dias
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Tendência</span>
                <span className={styles.detailValue}>
                  {moonData.isWaxing ? '↑ Crescente' : '↓ Minguante'}
                </span>
              </div>
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
      <div className={styles.instruction}>
        Deslize a timeline para viajar no tempo
      </div>
    </div>
  );
}

/**
 * Export com memo para otimização
 */
export default LunarTimeline;
