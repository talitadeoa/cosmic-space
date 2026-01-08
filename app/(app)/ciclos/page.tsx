/**
 * 📍 Rota: /ciclos
 *
 * Dashboard de ciclos (lunar + menstrual).
 * Hub central para acessar calendários e informações.
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function CiclosPage() {
  return (
    <main className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Ciclos</h1>
        <p className="text-slate-400">Acompanhe seus ciclos lunar e menstrual em sincronia</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Calendário Lunar */}
        <Link
          href={ROUTES.CICLOS.CALENDARIO}
          className="group p-6 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all"
        >
          <div className="text-4xl mb-4">🌙</div>
          <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400">
            Calendário Lunar
          </h2>
          <p className="text-slate-400 text-sm">
            Visualize as fases da lua e seus ciclos ao longo do mês
          </p>
        </Link>

        {/* Ciclo Lunar */}
        <Link
          href={ROUTES.CICLOS.LUNAR}
          className="group p-6 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all"
        >
          <div className="text-4xl mb-4">🌕</div>
          <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400">
            Ciclo Lunar
          </h2>
          <p className="text-slate-400 text-sm">Explore as influências lunares do momento atual</p>
        </Link>

        {/* Ciclo Menstrual */}
        <Link
          href={ROUTES.CICLOS.MENSTRUAL}
          className="group p-6 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-rose-500/50 transition-all"
        >
          <div className="text-4xl mb-4">🩸</div>
          <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-rose-400">
            Ciclo Menstrual
          </h2>
          <p className="text-slate-400 text-sm">Rastreie seu ciclo e entenda seus padrões</p>
        </Link>
      </div>
    </main>
  );
}
