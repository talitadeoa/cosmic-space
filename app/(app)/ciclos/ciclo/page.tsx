/**
 * 📍 Rota: /ciclos/ciclo
 *
 * Rastreamento do ciclo.
 * Migração: /perfil/ciclos → /ciclos/ciclo
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

import { CycleTracker } from '@/components';

export default function CicloCyclePage() {
  return (
    <main className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Seu Ciclo</h1>
        <p className="text-slate-400">Rastreie seu ciclo e entenda seus padrões</p>
      </header>

      <div className="max-w-2xl mx-auto">
        <CycleTracker isEnabled={true} />
      </div>
    </main>
  );
}
