import React from 'react';
import AuthGate from '@/components/AuthGate';
import { SpacePageLayout } from '@/components/SpacePageLayout';
import EclipseProductivityView from './EclipseProductivityView';

const EclipsePage = () => {
  return (
    <AuthGate>
      <SpacePageLayout className="px-4 py-12 sm:px-6 lg:px-8" allowBackNavigation>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.25),transparent_60%),radial-gradient(circle_at_bottom,rgba(15,118,110,0.2),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:26px_26px]" />

        <div className="relative z-20 mx-auto flex max-w-6xl flex-col gap-6">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-200/80">
              Estação Eclipse
            </p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Controle sua produtividade lunar em tempo real
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Acompanhe o cruzamento entre o SidePlanet e o ciclo de fases lunares. Visualize os
              to-dos sincronizados, descubra as fases mais eficientes e mantenha tudo organizado em
              um painel dedicado.
            </p>
          </header>

          <EclipseProductivityView />
        </div>
      </SpacePageLayout>
    </AuthGate>
  );
};

export default EclipsePage;
