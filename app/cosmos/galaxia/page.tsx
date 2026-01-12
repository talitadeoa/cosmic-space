'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SpacePageLayout } from '@/components/layouts';
import { CosmosRouteHelper } from '@/app/cosmos/components';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';
import RingGalaxyExperience from './RingGalaxyExperience';

const SHOOTING_STARS = [
  { id: 'north', top: '14%', delay: 0 },
  { id: 'center', top: '42%', delay: 3.2 },
  { id: 'south', top: '68%', delay: 6.4 },
];

const PARTICLES = [
  { id: 'p1', top: '12%', left: '18%', size: '9px', delay: 0.4 },
  { id: 'p2', top: '24%', left: '72%', size: '7px', delay: 1.2 },
  { id: 'p3', top: '38%', left: '46%', size: '11px', delay: 0.8 },
  { id: 'p4', top: '62%', left: '28%', size: '8px', delay: 1.8 },
  { id: 'p5', top: '72%', left: '64%', size: '10px', delay: 0.9 },
];

const GalaxiaPage = () => {
  const { onBackgroundClick } = useBackToHome();
  const [glowPulse, setGlowPulse] = useState(0);
  const [surpriseActive, setSurpriseActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSurpriseActive(true), 900);
    timersRef.current.push(timer);

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const playSoftChime = useCallback(() => {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;

    if (context.state === 'suspended') {
      void context.resume();
    }

    const now = context.currentTime + 0.05;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(540, now);
    oscillator.frequency.exponentialRampToValueAtTime(420, now + 0.4);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.9);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 1);
  }, []);

  const handleResonate = useCallback(() => {
    setGlowPulse((prev) => prev + 1);
    playSoftChime();
  }, [playSoftChime]);

  return (
    <SpacePageLayout onBackgroundClick={onBackgroundClick}>
      <div
        className="relative min-h-[100dvh] overflow-hidden px-4 py-6 sm:px-7 md:px-10 safe-area-inset"
        role="main"
        aria-label="Mapa interativo da galáxia"
      >
        <GalacticBackdrop pulse={glowPulse} surpriseActive={surpriseActive} />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 sm:gap-10">
          <motion.header
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-sky-100/80">
              <span className="rounded-full bg-white/5 px-3 py-1 text-white/80 shadow-inner shadow-slate-900/40 backdrop-blur">
                Galáxia viva
              </span>
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-50/90 ring-1 ring-sky-400/30">
                Clique no fundo para voltar para casa
              </span>
              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-violet-50/90 ring-1 ring-violet-400/30">
                Som e luz reagem ao toque
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  Explore a Galáxia do seu Cosmos
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                  Uma visão mágica e responsiva para você sentir cada órbita, fase e caminho. Toque,
                  escute os pequenos brilhos e deixe as microinterações guiarem a próxima descoberta.
                </p>
              </div>
              <motion.button
                onClick={handleResonate}
                className="group inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 shadow-[0_10px_40px_rgba(59,130,246,0.2)] backdrop-blur transition hover:border-sky-300/40 hover:bg-sky-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                whileTap={{ scale: 0.97 }}
                aria-live="polite"
              >
                <span className="text-lg">🔔</span>
                <span>Escutar o pulso das estrelas</span>
                <motion.span
                  key={glowPulse}
                  initial={{ scale: 0.5, opacity: 0.6 }}
                  animate={{ scale: 1.05, opacity: [0.9, 0.4, 0] }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 rounded-full bg-sky-400/20 blur-2xl"
                  aria-hidden
                />
              </motion.button>
            </div>
          </motion.header>

          <section
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_20px_60px_rgba(2,6,23,0.6)] backdrop-blur-xl"
            aria-label="Experiência de visualização da galáxia"
          >
            <motion.div
              className="pointer-events-none absolute -left-32 -top-28 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl"
              animate={{ opacity: [0.4, 0.65, 0.4], scale: [1, 1.08, 1] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
            <motion.div
              className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl"
              animate={{ opacity: [0.3, 0.55, 0.3], scale: [1.05, 0.95, 1.05] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 opacity-40" aria-hidden />

            <div className="relative grid items-center gap-8 p-4 sm:p-6 lg:grid-cols-[1.08fr_0.92fr] lg:p-10">
              <div className="order-2 lg:order-1">
                <div className="relative isolate rounded-2xl border border-white/10 bg-slate-900/70 p-3 shadow-[0_10px_40px_rgba(14,165,233,0.2)]">
                  <motion.div
                    className="pointer-events-none absolute inset-0 -z-10 rounded-2xl"
                    style={{
                      background:
                        'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.2), transparent 40%), radial-gradient(circle at 80% 60%, rgba(236,72,153,0.2), transparent 42%)',
                    }}
                    animate={{ opacity: [0.55, 0.9, 0.55] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    aria-hidden
                  />
                  <motion.div
                    className="pointer-events-none absolute -inset-6 -z-10 rounded-[36px] border border-sky-200/10"
                    animate={{ rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                    aria-hidden
                  />
                  <div
                    className="relative h-[62vh] min-h-[380px] w-full overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/60 shadow-inner shadow-slate-900/70 sm:h-[68vh]"
                    role="region"
                    aria-label="Anel e camadas da galáxia"
                    onClick={handleResonate}
                    data-stop-background-click="true"
                  >
                    <motion.div
                      key={glowPulse}
                      className="pointer-events-none absolute inset-0"
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: [0.35, 0.6, 0.2], scale: [1, 1.02, 1] }}
                      transition={{ duration: 1.6, ease: 'easeOut' }}
                      style={{
                        background:
                          'radial-gradient(circle at 50% 50%, rgba(56,189,248,0.22), transparent 45%)',
                      }}
                      aria-hidden
                    />

                    <motion.div
                      className="pointer-events-none absolute inset-8 rounded-full border border-white/10"
                      animate={{ rotate: [0, 12, 0] }}
                      transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                      aria-hidden
                    />
                    <motion.div
                      className="pointer-events-none absolute inset-14 rounded-full border border-white/5"
                      animate={{ rotate: [0, -18, 0] }}
                      transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                      aria-hidden
                    />

                    <div className="relative z-10 h-full">
                      <RingGalaxyExperience />
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 space-y-4 text-white/80 lg:order-2">
                <div className="flex items-center gap-3 text-sm font-semibold text-white/90">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20 text-lg">
                    🧭
                  </span>
                  <div>
                    <p className="text-base">Bússola estelar</p>
                    <p className="text-xs text-white/60">
                      Dicas rápidas ficam no canto para orientar cada salto.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard
                    title="Toque e retorne"
                    description="Qualquer clique no fundo te leva de volta ao início. Seguro, intuitivo e imediato."
                    accent="bg-sky-400/20"
                  />
                  <InfoCard
                    title="Energia viva"
                    description="Interaja com os anéis, sinta o brilho, escute um tom suave confirmando o caminho."
                    accent="bg-fuchsia-400/20"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard
                    title="Surpresas sutis"
                    description="Partículas flutuam, estrelas cadentes cruzam a tela e novas cores se revelam."
                    accent="bg-emerald-400/20"
                  />
                  <InfoCard
                    title="Acessível em todos os tamanhos"
                    description="Layout fluido para leitura fácil em celular, tablet ou desktop, com contraste alto."
                    accent="bg-amber-400/20"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 shadow-inner shadow-slate-900/60">
                  <p className="font-semibold text-white">Dica extra</p>
                  <p className="mt-1 text-white/70">
                    Ative o som delicado para sentir o fluxo do espaço. Cada clique vibra com uma nota curta
                    e acompanha o brilho no centro.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <CosmosRouteHelper routeKey="galaxia" position="top-right" />

        <motion.div
          className="pointer-events-none fixed top-16 right-3 h-24 w-24 rounded-full bg-sky-500/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      </div>
    </SpacePageLayout>
  );
};

type BackdropProps = {
  pulse: number;
  surpriseActive: boolean;
};

const GalacticTrail: React.FC<{ delay?: number; top: string }> = ({ delay = 0, top }) => (
  <motion.span
    initial={{ x: '-10vw', opacity: 0 }}
    animate={{ x: '110vw', opacity: [0, 1, 0] }}
    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeOut', delay }}
    className="pointer-events-none absolute h-px w-32 bg-gradient-to-r from-transparent via-white/70 to-transparent"
    style={{ top }}
    aria-hidden
  />
);

const FloatingParticle: React.FC<{ top: string; left: string; size: string; delay: number }> = ({
  top,
  left,
  size,
  delay,
}) => (
  <motion.span
    className="pointer-events-none absolute rounded-full bg-white/50 shadow-[0_0_25px_rgba(255,255,255,0.5)]"
    style={{ top, left, width: size, height: size }}
    animate={{ y: ['0%', '-10%', '0%'], opacity: [0.4, 0.9, 0.4] }}
    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay }}
    aria-hidden
  />
);

const GalacticBackdrop: React.FC<BackdropProps> = ({ pulse, surpriseActive }) => (
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.12),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(34,211,238,0.14),transparent_30%)]" />
    <AnimatePresence>
      {surpriseActive && (
        <motion.div
          key="surprise-glow"
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_45%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.7, 0.25] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    </AnimatePresence>

    <motion.div
      key={pulse}
      className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1),transparent_38%)]"
      initial={{ opacity: 0.1, scale: 0.98 }}
      animate={{ opacity: [0.2, 0.5, 0.25], scale: [0.98, 1.02, 1] }}
      transition={{ duration: 2, ease: 'easeOut' }}
    />

    {SHOOTING_STARS.map((star) => (
      <GalacticTrail key={star.id} delay={star.delay} top={star.top} />
    ))}
    {PARTICLES.map((particle) => (
      <FloatingParticle
        key={particle.id}
        top={particle.top}
        left={particle.left}
        size={particle.size}
        delay={particle.delay}
      />
    ))}
  </div>
);

type InfoCardProps = {
  title: string;
  description: string;
  accent: string;
};

const InfoCard: React.FC<InfoCardProps> = ({ title, description, accent }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-sm shadow-[0_10px_30px_rgba(2,6,23,0.45)] ${accent}`}
  >
    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/5 blur-2xl" aria-hidden />
    <p className="text-sm font-semibold text-white">{title}</p>
    <p className="mt-1 text-white/70">{description}</p>
  </div>
);

export default GalaxiaPage;
