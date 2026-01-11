'use client';

import React from 'react';
import { motion } from 'framer-motion';

type GalaxyMetaLayerProps = {
  isLoading?: boolean;
};

const GalaxyMetaLayer: React.FC<GalaxyMetaLayerProps> = ({ isLoading }) => {
  return (
    <div className="relative z-20 flex max-w-2xl flex-col items-center gap-3 text-center">
      {/* Título com efeito de brilho */}
      <motion.h2
        className="relative text-lg font-light tracking-[0.3em] text-indigo-100/90 sm:text-xl"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.span
          className="relative inline-block"
          style={{
            textShadow: '0 0 20px rgba(99, 102, 241, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)',
          }}
          animate={{
            textShadow: [
              '0 0 20px rgba(99, 102, 241, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)',
              '0 0 30px rgba(99, 102, 241, 0.7), 0 0 60px rgba(168, 85, 247, 0.5)',
              '0 0 20px rgba(99, 102, 241, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          GALÁXIA SOLAR
        </motion.span>

        {/* Linha decorativa animada */}
        <motion.div
          className="absolute -bottom-2 left-1/2 h-[1px] -translate-x-1/2"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), rgba(168, 85, 247, 0.6), transparent)',
          }}
          initial={{ width: 0 }}
          animate={{ width: '80%' }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
        />
      </motion.h2>

      {/* Subtítulo */}
      <motion.p
        className="text-xs tracking-widest text-indigo-200/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        Explore seus ciclos cósmicos
      </motion.p>

      {/* Indicador de loading com animação espacial */}
      {isLoading && (
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: 'rgba(99, 102, 241, 0.8)',
                  boxShadow: '0 0 6px rgba(99, 102, 241, 0.6)',
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <p className="text-xs text-indigo-100/70">Sincronizando dados lunares...</p>
        </motion.div>
      )}
    </div>
  );
};

export default GalaxyMetaLayer;
