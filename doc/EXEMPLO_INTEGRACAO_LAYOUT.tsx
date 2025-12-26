// Exemplo de como integrar LunationSync em app/layout.tsx

import type { Metadata } from 'next';
import { LunationSync } from '@/components/LunationSync';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cosmic Space',
  description: 'Universo de lunações e insights pessoais',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* ✨ Sincroniza lunações automaticamente em background */}
        {/* Sem UI, só carrega dados do banco quando necessário */}
        <LunationSync
          autoSync={true}
          years={[
            new Date().getFullYear() - 1,
            new Date().getFullYear(),
            new Date().getFullYear() + 1,
          ]}
          verbose={false} // Mude para true para ver logs no console
        />

        {children}
      </body>
    </html>
  );
}

/**
 * 💡 Como funciona:
 *
 * 1. Componente monta e inicia sincronização em background
 * 2. Para cada ano:
 *    - Verifica se já existe no banco com source=db
 *    - Se não existir, busca source=generated
 *    - Salva no banco com POST /api/moons/lunations
 * 3. Tudo acontece sem bloquear a renderização
 * 4. LuaListScreen automaticamente usa dados do banco quando disponível
 *
 * 📊 Performance:
 * - Primeira carga: ~1-2 segundos (gera + salva)
 * - Cargas posteriores: ~0ms (já no banco)
 *
 * 🎯 Resultado:
 * - Usuário não vê delays
 * - Dados estão sempre sincronizados
 * - LuaListScreen funciona perfeitamente
 */
