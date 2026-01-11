/**
 * 📍 Rota: /ciclos/menstrual
 *
 * Rastreamento do ciclo menstrual.
 * Migração: /perfil/ciclos → /ciclos/menstrual
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

import { MenstrualTracker } from '@/components';

export default function CicloMenstrualPage() {
  return (
    <main className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Ciclo Menstrual</h1>
        <p className="text-slate-400">Rastreie seu ciclo e entenda seus padrões</p>
      </header>

      <div className="max-w-2xl mx-auto">
        <MenstrualTracker isEnabled={true} />
      </div>
    </main>
  );
}
