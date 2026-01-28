import type { Metadata } from 'next';

/**
 * 📋 Layout para o domínio de Tarefas
 *
 * Anteriormente: /ilha
 * Agora: /tarefas
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

export const metadata: Metadata = {
  title: {
    template: '%s | Tarefas - Flua',
    default: 'Tarefas',
  },
  description: 'Organize suas tarefas e projetos por ilhas temáticas',
  keywords: ['tarefas', 'produtividade', 'ilhas', 'organização'],
  openGraph: {
    title: 'Tarefas - Flua',
    description: 'Organize suas tarefas e projetos por ilhas temáticas',
  },
};

export default function TarefasLayout({ children }: { children: React.ReactNode }) {
  return <section className="min-h-screen w-full">{children}</section>;
}
