'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SpacePageLayout } from '@/components/layouts';
import InputWindow from '@/app/cosmos/components/InputWindow';
import { useCosmosNavigation } from '@/app/cosmos/context/CosmosNavigationContext';

const COSMOS_TAG = 'v0.1.3 alpha flow'; // Atualize manualmente aqui
const TAG_STORAGE_KEY = 'cosmos:tag';
const TRANSITION_STEPS = [900, 900, 700] as const;
const TOTAL_DURATION_MS = TRANSITION_STEPS.reduce((sum, delayMs) => sum + delayMs, 0);

export default function CosmosPage() {
  const router = useRouter();
  const { getBackToHomeRoute } = useCosmosNavigation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(TAG_STORAGE_KEY, COSMOS_TAG);
      } catch {}
      document.documentElement?.setAttribute('data-cosmos-tag', COSMOS_TAG);
    }

    setProgress(0);

    const targetRoute = getBackToHomeRoute();
    let rafId = 0;

    const redirectTimer = window.setTimeout(() => {
      router.replace(targetRoute);
    }, TOTAL_DURATION_MS);

    const startTime = performance.now();
    const tick = (timestamp: number) => {
      const elapsedMs = Math.min(timestamp - startTime, TOTAL_DURATION_MS);
      const nextProgress =
        TOTAL_DURATION_MS > 0 ? (elapsedMs / TOTAL_DURATION_MS) * 100 : 100;
      setProgress(nextProgress);

      if (elapsedMs < TOTAL_DURATION_MS) {
        rafId = window.requestAnimationFrame(tick);
      }
    };
    rafId = window.requestAnimationFrame(tick);

    router.prefetch(targetRoute);

    return () => {
      window.clearTimeout(redirectTimer);
      window.cancelAnimationFrame(rafId);
    };
  }, [router, getBackToHomeRoute]);

  const progressPercent = Math.min(100, Math.max(0, progress));
  const progressRatio = progressPercent / 100;

  return (
    <SpacePageLayout className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <InputWindow
          variant="nebula"
          size="md"
          radius="lg"
          showAccent
          className="flex flex-col gap-6 border-white/10 bg-slate-950/50 shadow-xl shadow-indigo-900/30 backdrop-blur-xl"
        >
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white/90 sm:text-3xl">
              Cosmos em modo experimental
            </h1>
            <p className="text-sm text-slate-300/80 sm:text-base">
              Esta experiencia esta na versao {COSMOS_TAG} em teste aberto.
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full w-full origin-left rounded-full bg-gradient-to-r from-indigo-400/70 via-sky-400/80 to-indigo-200/70 will-change-transform"
                style={{ transform: `scaleX(${progressRatio})` }}
              />
            </div>
          </div>
        </InputWindow>
      </div>
    </SpacePageLayout>
  );
}
