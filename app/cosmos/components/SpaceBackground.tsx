'use client';

import React from 'react';
import { StarfieldBackground } from './StarfieldBackground';
import { LuminousTrail } from './LuminousTrail';

export const SpaceBackground: React.FC<{ showTrail?: boolean }> = React.memo(
  ({ showTrail = false }) => (
    <>
      <StarfieldBackground />
      {showTrail && <LuminousTrail />}
      {/* Reduzido de opacity-40 para opacity-20 para economia de memória */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#ffffff10_1px,transparent_0)] bg-[length:60px_60px] opacity-20" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-64 w-64 rounded-full bg-fuchsia-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-6rem] h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
    </>
  )
);
