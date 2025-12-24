import type { FC } from 'react';

type GalaxyInnerViewProps = {
  compact?: boolean;
};
/**
 * Visualização de uma "galáxia interior" lembrando um átomo:
 * órbitas elípticas com partículas orbitando um núcleo.
 * Aqui usamos apenas SVG + animações CSS simples (definidas na própria tag).
 */
export const GalaxyInnerView: FC<GalaxyInnerViewProps> = ({ compact = false }) => {
  const titleClass = compact
    ? 'text-xs font-semibold text-indigo-100'
    : 'text-sm font-semibold text-indigo-100';
  const subtitleClass = compact ? 'text-[0.7rem] text-slate-300' : 'text-xs text-slate-300';
  const svgSize = compact ? 'h-32 w-32' : 'h-48 w-48';
  const containerSpacing = compact ? 'space-y-3 text-center' : 'space-y-6';

  return (
    <div className={containerSpacing}>
      <div className={compact ? 'space-y-1' : ''}>
        <h3 className={titleClass}>-</h3>
        <p className={subtitleClass}>
          {compact
            ? '-'
            : 'Uma cartografia simbólica do seu universo interno — camadas, órbitas e partículas em constante reorganização.'}
        </p>
      </div>

      <div className="mt-2 flex items-center justify-center">
        <svg className={`${svgSize} text-indigo-200`} viewBox="0 0 200 200" aria-hidden="true">
          {/* Núcleo */}
          <defs>
            <radialGradient id="core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f9a8d4" stopOpacity="1" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="100" cy="100" r="18" fill="url(#core)" opacity="0.9" />
          <circle cx="100" cy="100" r="6" fill="#0f172a" stroke="#e5e7eb" strokeWidth="1.5" />

          {/* Órbitas */}
          <ellipse
            cx="100"
            cy="100"
            rx="38"
            ry="70"
            fill="none"
            stroke="rgba(148,163,184,0.6)"
            strokeWidth="1"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="70"
            ry="38"
            fill="none"
            stroke="rgba(129,140,248,0.7)"
            strokeWidth="1"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="56"
            ry="56"
            fill="none"
            stroke="rgba(248,250,252,0.5)"
            strokeWidth="0.7"
            strokeDasharray="4 4"
          />

          {/* Partículas orbitando */}
          <g className="origin-center animate-[spin_13s_linear_infinite]">
            <circle cx="100" cy="30" r="4" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
          </g>

          <g className="origin-center animate-[spin_18s_linear_infinite_reverse]">
            <circle cx="170" cy="100" r="4" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
          </g>

          <g className="origin-center animate-[spin_22s_linear_infinite]">
            <circle cx="100" cy="170" r="4" fill="#ede9fe" stroke="#a855f7" strokeWidth="1" />
          </g>
        </svg>
      </div>

      <p className="text-[0.7rem] text-slate-400">{compact ? '-' : '-'}</p>
    </div>
  );
};
