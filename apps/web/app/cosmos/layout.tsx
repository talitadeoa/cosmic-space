'use client';

import { ReactNode } from 'react';
import { CosmosNavigationProvider } from './context/CosmosNavigationContext';

interface CosmosLayoutProps {
  children: ReactNode;
}

/**
 * Layout para todas as rotas do Cosmos
 * Fornece o contexto de navegação para rastrear a home de origem
 */
export default function CosmosLayout({ children }: CosmosLayoutProps) {
  return <CosmosNavigationProvider>{children}</CosmosNavigationProvider>;
}
