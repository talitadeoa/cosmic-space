'use client';

import React from 'react';

const GalaxyBackgroundLayer: React.FC = () => {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(55,48,163,0.45),rgba(15,23,42,0.95))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_45%),radial-gradient(circle_at_80%_36%,rgba(14,165,233,0.12),transparent_42%),radial-gradient(circle_at_40%_75%,rgba(236,72,153,0.12),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px]" />
    </>
  );
};

export default GalaxyBackgroundLayer;
