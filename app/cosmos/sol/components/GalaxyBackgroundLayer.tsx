'use client';

import React, { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Importação dinâmica do componente 3D para evitar SSR
const Galaxy3D = dynamic(() => import('./Galaxy3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-[#030014] via-[#0a0820] to-[#030014]" />
  ),
});

const GalaxyBackgroundLayer: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
      {/* Fundo base enquanto carrega */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 50%, 
              rgba(15, 10, 40, 0.95) 0%, 
              rgba(5, 5, 20, 1) 50%, 
              rgba(3, 0, 20, 1) 100%
            )
          `,
        }}
      />

      {/* Galáxia 3D com Three.js */}
      {mounted && (
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-gradient-to-b from-[#030014] via-[#0a0820] to-[#030014]" />
          }
        >
          <Galaxy3D className="opacity-60" />
        </Suspense>
      )}

      {/* Overlay para integração suave com UI */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 50%, 
              transparent 0%, 
              rgba(3, 0, 20, 0.3) 60%, 
              rgba(3, 0, 20, 0.6) 100%
            )
          `,
        }}
      />
    </div>
  );
};

export default GalaxyBackgroundLayer;
