"use client";

import React from "react";

/**
 * Cena de fundo sutil usando SVG + CSS.
 * Renderiza um campo de estrelas e gradientes estilizados.
 */
export function UniverseScene() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <svg
        className="h-full w-full"
        viewBox="0 0 1024 768"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="cosmicGradient" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#1e1b4b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Fundo gradiente cósmico */}
        <rect width="1024" height="768" fill="url(#cosmicGradient)" />

        {/* Campo de estrelas simples */}
        {Array.from({ length: 80 }).map((_, i) => {
          const x = Math.random() * 1024;
          const y = Math.random() * 768;
          const r = Math.random() * 1.5;
          const opacity = Math.random() * 0.7 + 0.3;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="#e5e7eb"
              opacity={opacity}
            />
          );
        })}
      </svg>
    </div>
  );
}
