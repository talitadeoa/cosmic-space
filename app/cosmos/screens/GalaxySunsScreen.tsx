'use client';

import React from 'react';
import GalaxySunsExperience from '@/app/cosmos/sol/visuals/GalaxySunsExperience';
import { useUniverseNavigation } from '../hooks/useUniverseNavigation';

const GalaxySunsScreen: React.FC = () => {
  const { navigateWithFocus } = useUniverseNavigation();
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
