'use client';

import React from 'react';
import GalaxySunsExperience from '@/app/sol/visuals/GalaxySunsExperience';
import type { ScreenProps } from '../types';

const GalaxySunsScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  return (
    <GalaxySunsExperience
      onSunSelect={(year, event) =>
        navigateWithFocus?.('solOrbit', {
          event,
          type: 'sol',
          size: 'md',
          year,
        })
      }
      onGalaxyCoreClick={(event) =>
        navigateWithFocus?.('ringGalaxy', {
          event,
          type: 'galaxia',
          size: 'lg',
        })
      }
    />
  );
};

export default GalaxySunsScreen;
