/**
 * 📍 Rota: /emocoes
 *
 * Timeline e dashboard emocional.
 * Migração: /timeline + /perfil/emocoes → /emocoes
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function EmocoesPage() {
  return (
    <main className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Emoções</h1>
        <p className="text-slate-400">Registre e acompanhe suas emoções ao longo do tempo</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Registro de Emoções */}
        <Link
          href={ROUTES.EMOCOES.REGISTRO}
          className="group p-6 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all"
        >
          <div className="text-4xl mb-4">💜</div>
          <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400">
            Check-in Emocional
          </h2>
          <p className="text-slate-400 text-sm">
            Registre como você está se sentindo agora
          </p>
        </Link>

        {/* Histórico */}
        <Link
          href={ROUTES.EMOCOES.HISTORICO}
          className="group p-6 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all"
        >
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400">
            Histórico
          </h2>
          <p className="text-slate-400 text-sm">
            Visualize sua timeline emocional
          </p>
        </Link>

        {/* Padrões */}
        <Link
          href={ROUTES.EMOCOES.PADROES}
          className="group p-6 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all"
        >
          <div className="text-4xl mb-4">🔮</div>
          <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400">
            Padrões
          </h2>
          <p className="text-slate-400 text-sm">
            Descubra padrões em suas emoções
          </p>
        </Link>
      </div>
    </main>
  );
}
