'use client';

import React from 'react';
import { PlanetaProviders } from './state/PlanetaProviders';
import { PlanetaScene } from './visuals/PlanetaScene';
import PlanetScreen from './components/PlanetScreen';
import { usePlanetaNavigation } from './hooks/usePlanetaNavigation';
import { LunationSync } from '@/components/LunationSync';

/**
 * Página Planeta - Tela principal de organização de tarefas por fases lunares
 * Estrutura de camadas:
 * 1. Layout (página)
 * 2. Contexto (TemporalProvider + YearProvider)
 * 3. Sincronização (LunationSync)
 * 4. Background (SpaceBackground)
 * 5. Componente principal (PlanetScreen)
 */

const PlanetaPage: React.FC = () => {
  const { navigateTo, navigateWithFocus } = usePlanetaNavigation();

  return (
    <PlanetaProviders>
      {/* Sincronizar lunações do banco automaticamente */}
      <LunationSync autoSync={true} verbose={false} />

      <PlanetaScene>
        <PlanetScreen navigateTo={navigateTo} navigateWithFocus={navigateWithFocus} />
      </PlanetaScene>
    </PlanetaProviders>
  );
};

export default PlanetaPage;
