'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Tipos para partículas
type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDelay: number;
  color: string;
};

type Photon = {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  delay: number;
  color: string;
};

type NebulaCloud = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  animationDelay: number;
};

// Gera estrelas com diferentes cores e intensidades
const generateStars = (count: number): Star[] => {
  const colors = [
    'rgba(255, 255, 255, 1)',
    'rgba(200, 220, 255, 1)',
    'rgba(255, 240, 220, 1)',
    'rgba(180, 200, 255, 1)',
    'rgba(255, 200, 180, 1)',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.7 + 0.3,
    animationDelay: Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
};

// Gera fótons/partículas de luz que viajam
const generatePhotons = (count: number): Photon[] => {
  const colors = [
    'rgba(99, 102, 241, 0.8)',
    'rgba(14, 165, 233, 0.8)',
    'rgba(168, 85, 247, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(251, 191, 36, 0.6)',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    endX: Math.random() * 100,
    endY: Math.random() * 100,
    duration: Math.random() * 8 + 4,
    delay: Math.random() * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
};

// Gera nuvens de nebulosa
const generateNebulaClouds = (count: number): NebulaCloud[] => {
  const colors = [
    'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
    'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.12) 0%, transparent 70%)',
    'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
    'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
    'radial-gradient(ellipse at center, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100 - 25,
    y: Math.random() * 100 - 25,
    width: Math.random() * 60 + 40,
    height: Math.random() * 60 + 40,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    animationDelay: Math.random() * 8,
  }));
};

const GalaxyBackgroundLayer: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo(() => generateStars(120), []);
  const photons = useMemo(() => generatePhotons(15), []);
  const nebulaClouds = useMemo(() => generateNebulaClouds(6), []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
      {/* Fundo base com gradiente cósmico profundo */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 50%, 
              rgba(15, 10, 40, 0.95) 0%, 
              rgba(5, 5, 20, 1) 50%, 
              rgba(0, 0, 10, 1) 100%
            )
          `,
        }}
      />

      {/* Camada de nebulosas animadas */}
      {nebulaClouds.map((cloud) => (
        <motion.div
          key={`nebula-${cloud.id}`}
          className="absolute"
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            width: `${cloud.width}%`,
            height: `${cloud.height}%`,
            background: cloud.color,
            transform: `rotate(${cloud.rotation}deg)`,
            filter: 'blur(40px)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
            rotate: [cloud.rotation, cloud.rotation + 15, cloud.rotation],
          }}
          transition={{
            duration: 12 + cloud.animationDelay,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: cloud.animationDelay,
          }}
        />
      ))}

      {/* Efeito de brilho central da galáxia */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '80%',
          height: '80%',
          background: `
            radial-gradient(ellipse at center, 
              rgba(99, 102, 241, 0.2) 0%, 
              rgba(79, 70, 229, 0.1) 20%,
              rgba(14, 165, 233, 0.08) 40%,
              transparent 70%
            )
          `,
          filter: 'blur(60px)',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Braços espirais luminosos */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '100%',
          height: '100%',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 90, 180, 270].map((rotation, idx) => (
          <div
            key={`spiral-arm-${idx}`}
            className="absolute left-1/2 top-1/2 origin-center"
            style={{
              width: '50%',
              height: '8%',
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(99, 102, 241, ${0.08 - idx * 0.01}) 30%, 
                rgba(14, 165, 233, ${0.1 - idx * 0.01}) 60%,
                transparent 100%
              )`,
              filter: 'blur(20px)',
              borderRadius: '50%',
            }}
          />
        ))}
      </motion.div>

      {/* Estrelas com efeito de cintilação */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
          }}
          animate={{
            opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.animationDelay,
          }}
        />
      ))}

      {/* Fótons/partículas de luz viajantes */}
      {photons.map((photon) => (
        <motion.div
          key={`photon-${photon.id}`}
          className="absolute rounded-full"
          style={{
            width: 3,
            height: 3,
            backgroundColor: photon.color,
            boxShadow: `0 0 8px ${photon.color}, 0 0 16px ${photon.color}`,
          }}
          animate={{
            left: [`${photon.startX}%`, `${photon.endX}%`],
            top: [`${photon.startY}%`, `${photon.endY}%`],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.5],
          }}
          transition={{
            duration: photon.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: photon.delay,
          }}
        />
      ))}

      {/* Efeito de poeira cósmica */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 20%, rgba(200,220,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 70%, rgba(255,240,220,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 50%, rgba(180,200,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 10% 80%, rgba(255,200,180,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 60%, rgba(255,255,255,0.3) 0%, transparent 100%)
          `,
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Halo de luz ambiente */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 50%, 
              transparent 0%, 
              rgba(0, 0, 20, 0.3) 60%, 
              rgba(0, 0, 10, 0.6) 100%
            )
          `,
        }}
      />
    </div>
  );
};

export default GalaxyBackgroundLayer;
