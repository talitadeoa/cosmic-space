/**
 * 📍 Rota: /ciclos/ciclo
 *
 * Jornada guiada para cuidado do ciclo.
 * Migração: /perfil/ciclos → /ciclos/ciclo
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

'use client';

import { SpacePageLayout } from '@/components/layouts';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';
import { CycleCareButton } from '@/components';
import LuaCycleMenu from '@/app/cosmos/lua/components/LuaCycleMenu';

export default function CicloCyclePage() {
  const { onBackgroundClick } = useBackToHome();

  return (
    <SpacePageLayout onBackgroundClick={onBackgroundClick}>
      <div className="absolute top-3 left-3 z-40 sm:top-4 sm:left-4">
        <LuaCycleMenu currentPath="/ciclos/ciclo" />
      </div>
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-pink-300/70">
              Jornada do ciclo
            </p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Cuidar do seu ciclo, no seu ritmo
            </h1>
            <p className="max-w-3xl text-slate-300">
              Siga passos curtos, conecte com a lua e anote como se sente.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
            <CycleCareButton className="w-full" variant="full" />

            <div className="space-y-4">
              <div className="rounded-3xl border border-pink-800/40 bg-gradient-to-br from-pink-950/30 via-slate-950/20 to-purple-950/30 p-6 shadow-2xl shadow-pink-950/20">
                <p className="text-xs uppercase tracking-[0.3em] text-pink-300">Como funciona</p>
                <div className="mt-4 space-y-3 text-sm text-slate-200">
                  <p className="flex gap-3">
                    <span className="text-lg">🌸</span>
                    <span>
                      Jornada guiada com passos curtos para escolher a data, ritmo e sinais do corpo
                      com palavras gentis.
                    </span>
                  </p>
                  <p className="flex gap-3">
                    <span className="text-lg">🌙</span>
                    <span>O sistema já mostra a fase da lua e signo correspondentes ao dia.</span>
                  </p>
                  <p className="flex gap-3">
                    <span className="text-lg">💾</span>
                    <span>
                      Cada registro é salvo e pode ser sincronizado com sua conta quando estiver
                      logada.
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800/50 bg-black/40 p-6 shadow-xl shadow-slate-900/50">
                <p className="text-sm font-semibold text-white">Dica</p>
                <p className="mt-2 text-sm text-slate-300">
                  Use este espaço para um momento de pausa. Clique em &quot;Cuidar do meu ciclo&quot;
                  para abrir a jornada completa e registrar o que seu corpo comunica hoje.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SpacePageLayout>
  );
}
