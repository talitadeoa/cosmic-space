'use client';

import React from 'react';
import { PlanetaProviders } from './state/PlanetaProviders';
import { PlanetaScene } from './visuals/PlanetaScene';
import PlanetScreen from './components/PlanetScreen';
import { usePlanetaNavigation } from './hooks/usePlanetaNavigation';

/**
 * Página Planeta - Tela principal de organização de tarefas por fases lunares
 * Estrutura de camadas:
 * 1. Layout (página)
 * 2. Contexto (YearProvider)
 * 3. Background (SpaceBackground)
 * 4. Componente principal (PlanetScreen)
 */

const PlanetaPage: React.FC = () => {
  const { navigateTo, navigateWithFocus } = usePlanetaNavigation();

  return (
    <PlanetaProviders>
      <PlanetaScene>
        <PlanetScreen navigateTo={navigateTo} navigateWithFocus={navigateWithFocus} />
      </PlanetaScene>
    </PlanetaProviders>
  );
};

export default PlanetaPage;
