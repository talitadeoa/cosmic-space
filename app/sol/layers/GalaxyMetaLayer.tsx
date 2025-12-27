'use client';

import React from 'react';

type GalaxyMetaLayerProps = {
  isLoading?: boolean;
};

const GalaxyMetaLayer: React.FC<GalaxyMetaLayerProps> = ({ isLoading }) => {
  return (
    <div className="relative z-10 flex max-w-2xl flex-col items-center gap-2 text-center">
      {isLoading && <p className="text-xs text-indigo-100/70">Sincronizando dados lunares...</p>}
    </div>
  );
};

export default GalaxyMetaLayer;
