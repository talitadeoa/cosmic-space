/**
 * Componente para renderizar ícone da fase lunar em SVG
 */

import React from 'react';
import { MoonPhase } from './types';
import styles from './styles/MoonPhaseIcon.module.css';

interface MoonPhaseIconProps {
  phase: MoonPhase;
  illumination: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'circle';
  'aria-label'?: string;
}

export const MoonPhaseIcon: React.FC<MoonPhaseIconProps> = ({
  phase,
  illumination,
  size = 'small',
  variant = 'icon',
  'aria-label': ariaLabel,
}) => {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 48,
  };

  const viewBoxSize = 100;
  const radius = 45;
  const cx = 50;
  const cy = 50;

  const normalizedIllumination = Math.max(0, Math.min(100, illumination));

  // Renderiza o disco da lua com base na iluminação
  const renderMoonDisc = () => {
    const isWaxing = [
      MoonPhase.WAXING_CRESCENT,
      MoonPhase.WAXING_GIBBOUS,
      MoonPhase.FIRST_QUARTER,
    ].includes(phase);

    if (variant === 'circle') {
      // Versão simplificada: círculo com sombra representando iluminação
      const shadowOffset = (1 - normalizedIllumination / 100) * 2;

      return (
        <g>
          {/* Fundo da lua (cinza escuro) */}
          <circle cx={cx} cy={cy} r={radius} fill="#2a3a4a" opacity="0.6" />

          {/* Área iluminada */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="#e8e8ff"
            opacity={normalizedIllumination / 100}
          />

          {/* Borda sutil */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#64748b"
            strokeWidth="1"
            opacity="0.4"
          />
        </g>
      );
    }

    // Versão maior: rendição mais detalhada
    const clipId = `moon-clip-${phase}-${illumination}`;

    if (normalizedIllumination === 0) {
      // Lua Nova
      return (
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="#0a0e13"
          stroke="#3a4a5a"
          strokeWidth="2"
          opacity="0.5"
        />
      );
    }

    if (normalizedIllumination === 100) {
      // Lua Cheia
      return (
        <g>
          <circle cx={cx} cy={cy} r={radius} fill="#f5f5dc" />
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#d4af37" strokeWidth="2" />
        </g>
      );
    }

    // Fase intermediária
    const width = (normalizedIllumination / 100) * radius * 2;
    const xOffset = isWaxing ? cx - radius + width : cx + radius - width;

    return (
      <g>
        <defs>
          <clipPath id={clipId}>
            <rect
              x={isWaxing ? cx - radius : xOffset}
              y={cy - radius}
              width={width}
              height={radius * 2}
            />
          </clipPath>
        </defs>

        {/* Lua escura (base) */}
        <circle cx={cx} cy={cy} r={radius} fill="#2a3a4a" opacity="0.7" />

        {/* Área iluminada (clipped) */}
        <circle cx={cx} cy={cy} r={radius} fill="#e8e8ff" clipPath={`url(#${clipId})`} />

        {/* Borda */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
          opacity="0.6"
        />
      </g>
    );
  };

  const sizeClass = styles[`size-${size}`];

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={`${styles.moonIcon} ${sizeClass}`}
      aria-label={ariaLabel || `${phase}: ${illumination}%`}
      role="img"
    >
      {renderMoonDisc()}
    </svg>
  );
};

export default MoonPhaseIcon;
