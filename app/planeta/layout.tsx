import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Planeta - Organizador Lunar',
  description: 'Organize suas tarefas e pensamentos por fases lunares',
};

/**
 * Layout para a rota /planeta
 * Estrutura de camadas:
 * 1. Provedores (metadata)
 * 2. Wrapper de layout
 */

export default function PlanetaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-950">
      {children}
    </div>
  );
}
