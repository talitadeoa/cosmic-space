import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarefas | Flua',
  description: 'Organize suas tarefas e projetos por ilhas temáticas',
  openGraph: {
    title: 'Tarefas - Flua',
    description: 'Organize suas tarefas e projetos por ilhas temáticas',
  },
};

/**
 * Layout para o domínio de Tarefas
 *
 * Anteriormente: /ilha
 * Agora: /tarefas
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */
export default function TarefasLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen w-full">{children}</div>;
}
