/**
 * 📍 Rota: /ciclos/ciclo
 *
 * Rastreamento do ciclo.
 * Migração: /perfil/ciclos → /ciclos/ciclo
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

'use client';

import { SpacePageLayout } from '@/components/layouts';
import { useRouter } from 'next/navigation';
import { useCosmosNavigationSafe } from '@/app/cosmos/context/CosmosNavigationContext';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';
import { CycleTracker } from '@/components';
import LuaCycleMenu from '@/app/cosmos/lua/components/LuaCycleMenu';

export default function CicloCyclePage() {
  const { onBackgroundClick } = useBackToHome();

  return (
    <SpacePageLayout onBackgroundClick={onBackgroundClick}>
      <div className="absolute top-3 left-3 z-40 sm:top-4 sm:left-4">
        <LuaCycleMenu currentPath="/ciclos/ciclo" />
      </div>
      <main className="min-h-screen p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Seu Ciclo</h1>
          <p className="text-slate-400">Rastreie seu ciclo e entenda seus padrões</p>
        </header>

        <div className="max-w-2xl mx-auto">
          <CycleTracker isEnabled={true} />
        </div>
      </main>
    </SpacePageLayout>
  );
}
