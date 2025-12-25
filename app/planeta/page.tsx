'use client';

import React from 'react';
import { PlanetaProviders } from './layers/providers/PlanetaProviders';
import { PlanetaScene } from './layers/background/PlanetaScene';
import PlanetScreen from './layers/screen/PlanetScreen';
import type { ScreenProps } from '@/app/cosmos/types';

/**
 * Página Planeta - Tela principal de organização de tarefas por fases lunares
 * Estrutura de camadas:
 * 1. Layout (página)
 * 2. Contexto (YearProvider)
 * 3. Background (SpaceBackground)
 * 4. Componente principal (PlanetScreen)
 */

const PlanetaPage: React.FC = () => {
  const handleNavigateWithFocus: ScreenProps['navigateWithFocus'] = (screenId, options) => {
    // Implementar navegação conforme necessário
    console.log('Navigation request:', screenId, options);
  };

  const handleNavigateTo: ScreenProps['navigateTo'] = (screenId) => {
    // Placeholder até integrar a navegação real
    console.log('Navigation request:', screenId);
  };

  return (
    <PlanetaProviders>
      <PlanetaScene>
        <PlanetScreen navigateTo={handleNavigateTo} navigateWithFocus={handleNavigateWithFocus} />
      </PlanetaScene>
    </PlanetaProviders>
  );
};

export default PlanetaPage;
