'use client';

import React from 'react';

const GalaxyBackgroundLayer: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] w-full h-full min-h-[400px]">
      {/* Fundo gradiente cósmico */}
      <div 
        className="absolute inset-0 w-full h-full"
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

      {/* Estrelas CSS */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.6), transparent),
              radial-gradient(1px 1px at 50px 160px, rgba(255,255,255,0.7), transparent),
              radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.5), transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
              radial-gradient(2px 2px at 160px 120px, rgba(200,200,255,0.9), transparent),
              radial-gradient(1px 1px at 200px 50px, rgba(255,255,255,0.5), transparent),
              radial-gradient(1px 1px at 220px 140px, rgba(255,255,255,0.7), transparent),
              radial-gradient(1px 1px at 260px 90px, rgba(255,255,255,0.6), transparent),
              radial-gradient(2px 2px at 300px 30px, rgba(180,180,255,0.8), transparent)
            `,
            backgroundSize: '350px 200px',
          }}
        />
      </div>

      {/* Brilho central (galáxia) */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 40% 35% at 50% 50%, 
              rgba(147, 51, 234, 0.15) 0%,
              rgba(124, 58, 237, 0.08) 40%,
              transparent 70%
            )
          `,
        }}
      />

      {/* Overlay para integração suave com UI */}
      <div 
        className="absolute inset-0 w-full h-full"
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
