'use client';

import React from 'react';
import { PlanetaProviders } from './state';
import { PlanetaScene } from './visuals';
import PlanetScreen from './components/PlanetScreen';
import { usePlanetaNavigation } from './hooks';
import { LunationSync } from '@/components/sync';
import { CosmosRouteHelper } from '@/app/cosmos/components';

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
      {/* Sincronização desabilitada para evitar requisições em cascata */}
      {/* <LunationSync autoSync={true} verbose={false} /> */}

      <PlanetaScene>
        <PlanetScreen navigateTo={navigateTo} navigateWithFocus={navigateWithFocus} />
        <CosmosRouteHelper routeKey="planeta" position="top-right" forceShow />
      </PlanetaScene>
    </PlanetaProviders>
  );
};

export default PlanetaPage;
