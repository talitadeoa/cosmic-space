import LunarPhaseForm from '@/components/LunarPhaseForm';
import AuthGate from '@/components/AuthGate';

export const metadata = {
  title: 'Registro de Fase Lunar - Cosmic Universe Portal',
  description: 'Registre suas observações e intenções para cada fase lunar',
};

export default function LunarPhaseRegistryPage() {
  return (
    <AuthGate>
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 mb-2">
              📖 Registro da Fase Lunar
            </h1>
            <p className="text-slate-400 text-lg">
              Acompanhe suas intenções, observações e progresso ao longo das fases da lua
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full">
              <LunarPhaseForm />
            </div>
          </div>

          {/* Guia rápido */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-black/40 p-6 backdrop-blur-md">
              <h3 className="font-semibold text-slate-100 mb-2">🌑 Nova</h3>
              <p className="text-sm text-slate-400">
                Semeadura: plantar intenções claras, iniciar rituais de renovação
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-black/40 p-6 backdrop-blur-md">
              <h3 className="font-semibold text-slate-100 mb-2">🌓 Crescente</h3>
              <p className="text-sm text-slate-400">
                Crescimento: agir sobre a intenção, nutrir projetos e disciplina
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-black/40 p-6 backdrop-blur-md">
              <h3 className="font-semibold text-slate-100 mb-2">🌕 Cheia</h3>
              <p className="text-sm text-slate-400">
                Culminação: celebrar, colher frutos, observar resistências emocionais
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-black/40 p-6 backdrop-blur-md">
              <h3 className="font-semibold text-slate-100 mb-2">🌗 Minguante</h3>
              <p className="text-sm text-slate-400">
                Liberação: soltar, limpar, integrar aprendizados
              </p>
            </div>
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
