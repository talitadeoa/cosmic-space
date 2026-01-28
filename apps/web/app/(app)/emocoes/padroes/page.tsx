/**
 * 📍 Rota: /emocoes/padroes
 *
 * Análise de padrões emocionais.
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

export default function PadroesEmocionalPage() {
  return (
    <main className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Padrões Emocionais</h1>
        <p className="text-slate-400">Descubra padrões e tendências em suas emoções</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          <div className="text-6xl mb-4">🔮</div>
          <h2 className="text-xl font-semibold text-white mb-2">Em breve</h2>
          <p className="text-slate-400">
            Estamos trabalhando para trazer insights sobre seus padrões emocionais.
          </p>
        </div>
      </div>
    </main>
  );
}
