'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { SpacePageLayout } from '@/components/layouts';
import InputWindow from '@/app/cosmos/components/InputWindow';
import { useCosmosNavigation } from '@/app/cosmos/context/CosmosNavigationContext';

const COSMOS_TAG = process.env.NEXT_PUBLIC_GIT_TAG?.trim() || 'v0.1.3 alpha flow';
const TAG_STORAGE_KEY = 'cosmos:tag';
const TRANSITION_STEPS = [
  { label: `Sincronizando tag ${COSMOS_TAG}`, delayMs: 1800 },
  { label: 'Driblando o tempo para renderizar melhor', delayMs: 1800 },
  { label: 'Abrindo a home do Cosmos', delayMs: 1400 },
] as const;
const TOTAL_DURATION_MS = TRANSITION_STEPS.reduce((sum, step) => sum + step.delayMs, 0);
const METAL_VARS = {
  '--metal-base': 'rgba(5, 10, 18, 0.92)',
  '--metal-ink': 'rgba(226, 232, 240, 0.9)',
  '--metal-steel': 'rgba(148, 163, 184, 0.75)',
  '--metal-core': 'rgba(71, 85, 105, 0.7)',
  '--metal-glow': 'rgba(125, 211, 252, 0.35)',
  '--metal-sheen': 'rgba(255, 255, 255, 0.45)',
} as CSSProperties;

export default function CosmosPage() {
  const router = useRouter();
  const { getBackToHomeRoute } = useCosmosNavigation();
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(TAG_STORAGE_KEY, COSMOS_TAG);
      } catch {}
      document.documentElement?.setAttribute('data-cosmos-tag', COSMOS_TAG);
    }

    setStepIndex(0);
    setProgress(0);

    const timers: number[] = [];
    let elapsed = 0;
    const targetRoute = getBackToHomeRoute();
    let rafId = 0;

    TRANSITION_STEPS.forEach((step, index) => {
      timers.push(
        window.setTimeout(() => {
          setStepIndex(index);
        }, elapsed)
      );
      elapsed += step.delayMs;
    });

    const redirectTimer = window.setTimeout(() => {
      router.replace(targetRoute);
    }, elapsed);

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
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(redirectTimer);
      window.cancelAnimationFrame(rafId);
    };
  }, [router, getBackToHomeRoute]);

  const activeStep = TRANSITION_STEPS[Math.min(stepIndex, TRANSITION_STEPS.length - 1)];
  const progressPercent = Math.min(100, Math.max(0, progress));
  const progressRatio = progressPercent / 100;

  return (
    <SpacePageLayout className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(226,232,240,0.18), transparent 50%), radial-gradient(circle at 80% 75%, rgba(148,163,184,0.16), transparent 55%), linear-gradient(140deg, rgba(2,6,23,0.9), rgba(8,16,28,0.7))',
        }}
      />
      <div
        className="relative w-full max-w-2xl font-['Space_Grotesk','Sora',sans-serif]"
        style={METAL_VARS}
      >
        <div className="pointer-events-none absolute -top-12 right-[-15%] h-48 w-48 rounded-full bg-[radial-gradient(circle,var(--metal-glow),transparent_70%)] blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-16 left-[-10%] h-56 w-56 rounded-full bg-[radial-gradient(circle,var(--metal-steel),transparent_70%)] blur-3xl animate-float-medium" />
        <div className="relative rounded-[32px] p-[1px] bg-[linear-gradient(120deg,rgba(226,232,240,0.3),rgba(71,85,105,0.35),rgba(15,23,42,0.7),rgba(226,232,240,0.25))] shadow-[0_24px_60px_rgba(2,6,23,0.6)]">
          <InputWindow
            variant="nebula"
            size="md"
            radius="lg"
            showAccent
            accentClassName="bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.25),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(148,163,184,0.18),transparent_55%),linear-gradient(120deg,rgba(255,255,255,0.05),transparent_40%)]"
            className="relative overflow-hidden border-white/10 bg-[radial-gradient(circle_at_10%_15%,rgba(226,232,240,0.12),transparent_50%),radial-gradient(circle_at_80%_85%,rgba(148,163,184,0.16),transparent_55%),linear-gradient(145deg,rgba(5,10,18,0.95),rgba(15,23,42,0.8))] shadow-[0_20px_45px_rgba(15,23,42,0.65)]"
          >
            <div className="pointer-events-none absolute -inset-24 bg-[conic-gradient(from_120deg,rgba(255,255,255,0.06),rgba(148,163,184,0.35),rgba(15,23,42,0.25),rgba(226,232,240,0.4),rgba(30,41,59,0.3),rgba(255,255,255,0.06))] opacity-70 blur-2xl animate-spin-slower" />
            <div className="pointer-events-none absolute inset-x-6 -top-8 h-20 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.6),transparent)] opacity-60 blur-xl animate-pulse-soft" />
            <div className="relative z-10 flex flex-col gap-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-transparent bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-clip-text sm:text-3xl">
                  Cosmos em modo experimental
                </h1>
                <p className="text-sm text-slate-200/80 sm:text-base">
                  Esta experiencia esta na versao {COSMOS_TAG} alpha flow em teste aberto.
                </p>
              </div>

              <div className="space-y-2">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.18),transparent_60%)] opacity-70" />
                  <div
                    className="relative h-full w-full origin-left rounded-full bg-[linear-gradient(90deg,rgba(226,232,240,0.9),rgba(148,163,184,0.75),rgba(125,211,252,0.6),rgba(226,232,240,0.85))] shadow-[0_0_18px_rgba(148,163,184,0.35)] will-change-transform"
                    style={{ transform: `scaleX(${progressRatio})` }}
                  >
                    <div className="absolute right-0 top-0 h-full w-10 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.7),transparent)] opacity-70 blur-sm" />
                  </div>
                </div>
              </div>
            </div>
          </InputWindow>
        </div>
      </div>
    </SpacePageLayout>
  );
}
