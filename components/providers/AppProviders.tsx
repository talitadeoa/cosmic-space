/**
 * 🎯 AppProviders - Composição de todos os Providers
 * 
 * Centraliza todos os providers em um único componente,
 * eliminando o "provider hell" no layout.tsx
 */

'use client';

import React, { type ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import SfxProvider from './SfxProvider';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Compõe todos os providers da aplicação
 * Ordem importa: externos (Auth) → internos (features)
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <SfxProvider>
        {children}
      </SfxProvider>
    </AuthProvider>
  );
}

export default AppProviders;
