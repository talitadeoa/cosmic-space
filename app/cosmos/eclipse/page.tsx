'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthGate } from '@/components/auth';
import { SpacePageLayout } from '@/components/layouts';
import { CosmosRouteHelper } from '@/app/cosmos/components';
import EclipseProductivityView from './EclipseProductivityView';

const EclipsePage = () => {
  const router = useRouter();

  return (
    <AuthGate chatButtonSize="compact">
      <SpacePageLayout
        className="px-4 py-12 sm:px-6 lg:px-8"
        onBackgroundClick={() => router.push('/cosmos')}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.25),transparent_60%),radial-gradient(circle_at_bottom,rgba(15,118,110,0.2),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:26px_26px]" />

        <div className="relative z-20 mx-auto flex max-w-6xl flex-col gap-6">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-200/80">
              Estação Eclipse
            </p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Sintonize o ritmo lunar em tempo real
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Acompanhe o cruzamento entre o SidePlanet e o ciclo de fases lunares. Visualize os
              to-dos sincronizados, identifique onde o fluxo fica mais orgânico e mantenha tudo
              alinhado em um painel dedicado.
            </p>
          </header>

          <EclipseProductivityView />
        </div>
        <CosmosRouteHelper routeKey="eclipse" position="bottom-right" />
      </SpacePageLayout>
    </AuthGate>
  );
};

export default EclipsePage;
