import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Ciclos - Flua',
    default: 'Ciclos Lunares e Menstruais',
  },
  description: 'Acompanhe seus ciclos lunar e menstrual em sincronia',
  keywords: ['ciclo lunar', 'ciclo menstrual', 'fases da lua', 'calendário lunar'],
  openGraph: {
    title: 'Ciclos - Flua',
    description: 'Sincronize-se com os ciclos da lua e do seu corpo',
  },
};

/**
 * Layout para o domínio de Ciclos
 *
 * Agrega:
 * - Ciclo Lunar (antes: /cosmos/lua, /cosmos/calendarioc)
 * - Ciclo Menstrual (antes: /perfil/ciclos)
 * - Calendário unificado
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */
export default function CiclosLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen w-full">{children}</div>;
}
