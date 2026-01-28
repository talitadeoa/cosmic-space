/**
 * 🎯 AppProviders - Compositor de Contextos
 * 
 * Centraliza todos os providers da aplicação em um único componente,
 * simplificando o layout.tsx e facilitando a manutenção.
 * 
 * Ordem dos providers (de fora para dentro):
 * 1. AuthProvider - Estado de autenticação
 * 2. AutoSyncLunar - Sincronização lunar (efeito colateral, sem UI)
 * 3. GalaxySunsSync - Sincronização de dados (efeito colateral, sem UI)
 */

'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { AutoSyncLunar, GalaxySunsSync } from '@/components/sync';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Compõe todos os providers da aplicação
 * 
 * @example
 * // app/layout.tsx
 * import { AppProviders } from '@/components/providers';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AppProviders>
 *           <NavMenu />
 *           {children}
 *           <RadioPlayer />
 *         </AppProviders>
 *       </body>
 *     </html>
 *   );
 * }
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      {/* Componentes de efeito colateral (sem UI) */}
      <AutoSyncLunar />
      <GalaxySunsSync autoSync={true} />
      {children}
    </AuthProvider>
  );
}

export default AppProviders;
