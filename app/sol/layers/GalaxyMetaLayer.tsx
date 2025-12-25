'use client';

import React from 'react';

type GalaxyMetaLayerProps = {
  isLoading?: boolean;
};

const GalaxyMetaLayer: React.FC<GalaxyMetaLayerProps> = ({ isLoading }) => {
  return (
    <div className="relative z-10 flex max-w-2xl flex-col items-center gap-2 text-center">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-indigo-100/80">
        Galáxia cronológica
      </p>
      <h3 className="text-xl font-semibold text-white sm:text-2xl">
        Um sol para cada ano, orbitando o núcleo da galáxia
      </h3>
      <p className="text-sm text-slate-300">
        Clique em um sol para focar a órbita daquele ano. Cada órbita representa um ciclo anual.
      </p>
      {isLoading && <p className="text-xs text-indigo-100/70">Sincronizando dados lunares...</p>}
    </div>
  );
};

export default GalaxyMetaLayer;
