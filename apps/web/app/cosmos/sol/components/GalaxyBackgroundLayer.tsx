'use client';

import React from 'react';

const GalaxyBackgroundLayer: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible w-full h-full min-h-[400px]">
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

      {/* Opção 4: Braços da galáxia com conic-gradient + blur */}
      <div 
        className="absolute inset-0 w-full h-full animate-spin-slow"
        style={{
          background: `
            conic-gradient(
              from 0deg at 50% 50%,
              transparent 0deg,
              rgba(139, 92, 246, 0.18) 15deg,
              rgba(168, 85, 247, 0.12) 35deg,
              transparent 55deg,
              transparent 90deg,
              rgba(99, 102, 241, 0.14) 110deg,
              rgba(129, 140, 248, 0.1) 130deg,
              transparent 150deg,
              transparent 180deg,
              rgba(139, 92, 246, 0.16) 195deg,
              rgba(167, 139, 250, 0.11) 215deg,
              transparent 235deg,
              transparent 270deg,
              rgba(99, 102, 241, 0.13) 290deg,
              rgba(129, 140, 248, 0.09) 310deg,
              transparent 330deg,
              transparent 360deg
            )
          `,
          filter: 'blur(45px)',
          transform: 'scale(1.4)',
          animationDuration: '180s',
        }}
      />

      {/* Opção 2: Imagem real de galáxia (NASA NGC 4414) */}
      <div 
        className="absolute inset-0 w-full h-full opacity-30 mix-blend-screen animate-spin-slower"
        style={{
          backgroundImage: 'url(/images/galaxy-spiral.webp)',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(3px) saturate(1.3) hue-rotate(-15deg)',
        }}
      />

      {/* Camada de "poeira estelar" adicional */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 70% at 40% 45%, 
              rgba(139, 92, 246, 0.08) 0%,
              transparent 50%
            ),
            radial-gradient(ellipse 60% 50% at 60% 55%, 
              rgba(99, 102, 241, 0.06) 0%,
              transparent 45%
            )
          `,
        }}
      />

      {/* Brilho central (galáxia) - intensificado */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 35% 30% at 50% 50%, 
              rgba(253, 230, 138, 0.12) 0%,
              rgba(251, 191, 36, 0.08) 20%,
              rgba(147, 51, 234, 0.1) 40%,
              rgba(124, 58, 237, 0.05) 60%,
              transparent 80%
            )
          `,
        }}
      />
    </div>
  );
};

export default GalaxyBackgroundLayer;
