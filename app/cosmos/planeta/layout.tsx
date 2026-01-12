import type { Metadata } from 'next';

/**
 * 🪐 Layout para o domínio Planeta
 *
 * Organizador de tarefas e pensamentos por fases lunares.
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

export const metadata: Metadata = {
  title: {
    template: '%s | Planeta - Flua',
    default: 'Planeta - Organizador Lunar',
  },
  description: 'Organize suas tarefas e pensamentos por fases lunares',
  keywords: ['planeta', 'fases lunares', 'organização', 'planejamento'],
  openGraph: {
    title: 'Planeta - Flua',
    description: 'Organize suas tarefas e pensamentos por fases lunares',
  },
};

export default function PlanetaLayout({ children }: { children: React.ReactNode }) {
  return <section className="min-h-screen w-full bg-slate-950">{children}</section>;
}
