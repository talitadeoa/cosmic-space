'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CosmosParallax } from '@/components/home/CosmosParallax';

const HOTSPOTS = [
  {
    id: 'galaxia',
    label: 'Galáxia',
    href: '/cosmos/galaxia',
    top: '28%',
    left: '38%',
    size: '14%',
    glow: 'rgba(167, 139, 250, 0.6)', // violeta
  },
  {
    id: 'eclipse',
    label: 'Eclipse',
    href: '/cosmos/eclipse',
    top: '16%',
    left: '50%',
    size: '6%',
    glow: 'rgba(251, 191, 36, 0.5)', // dourado
  },
  {
    id: 'sol',
    label: 'Sol',
    href: '/cosmos/sol',
    top: '50%',
    left: '62%',
    size: '10%',
    glow: 'rgba(251, 146, 60, 0.6)', // laranja
  },
  {
    id: 'luas',
    label: 'Luas',
    href: '/cosmos/lua',
    top: '24%',
    left: '16%',
    size: '12%',
    glow: 'rgba(226, 232, 240, 0.5)', // prata
  },
  {
    id: 'planeta',
    label: 'Planeta',
    href: '/cosmos/planeta',
    top: '86%',
    left: '82%',
    size: '18%',
    glow: 'rgba(56, 189, 248, 0.5)', // cyan
  },
];

export default function HomeAlternativaPage() {
  const router = useRouter();

  return (
    <CosmosParallax className="fixed inset-0 h-[100dvh] w-full">
      <div className="flex h-[100dvh] flex-col relative z-20">
        {/* Header com botão e título */}
        <header className="relative z-20 px-4 pt-6 text-center sm:px-6 lg:px-8">
          {/* Botão voltar */}
          <button
            onClick={() => router.push('/cosmos/home')}
            className="absolute left-4 top-6 flex items-center gap-2 rounded-full border border-indigo-300/40 bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-100 backdrop-blur-md transition hover:bg-indigo-500/30 hover:scale-105 active:scale-95 sm:left-6"
            title="Voltar para visualização interativa"
          >
            ✨ <span className="hidden sm:inline">Modo Interativo</span>
          </button>

          <div className="mx-auto max-w-2xl pt-12 sm:pt-4">
            <p className="text-xs uppercase tracking-[0.45em] text-slate-300/90 drop-shadow-sm">
              Home alternativa
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white drop-shadow-lg sm:text-3xl md:text-4xl">
              Explore os elementos do cosmos
            </h1>
            <p className="mt-3 text-sm text-slate-200/80 drop-shadow md:text-base">
              Mova o mouse para explorar • Clique nos elementos para navegar
            </p>
          </div>
        </header>

        {/* Área dos hotspots - centralizada na tela */}
        <div className="flex flex-1 items-center justify-center px-4 py-8 pointer-events-auto">
          <div className="relative aspect-[2/3] w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl z-20">
            {/* Container para posicionar os hotspots */}
            <div className="absolute inset-0">
              {HOTSPOTS.map((spot) => (
                <Link
                  key={spot.id}
                  href={spot.href}
                  aria-label={`Abrir ${spot.label}`}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-[2px] transition-all duration-500 ease-out hover:scale-125 hover:border-white/50 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none z-20"
                  style={{
                    top: spot.top,
                    left: spot.left,
                    width: spot.size,
                    height: spot.size,
                    boxShadow: `0 0 30px ${spot.glow}, inset 0 0 20px ${spot.glow}`,
                  }}
                >
                  {/* Anel pulsante */}
                  <span
                    className="absolute inset-[-4px] rounded-full opacity-60 animate-ping"
                    style={{
                      border: `1px solid ${spot.glow}`,
                      animationDuration: '3s',
                    }}
                  />
                  {/* Brilho interno */}
                  <span
                    className="absolute inset-0 rounded-full opacity-40"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${spot.glow}, transparent 70%)`,
                    }}
                  />
                  {/* Label */}
                  <span className="absolute left-1/2 top-full mt-4 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/90 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-slate-100 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 sm:text-xs border border-white/10 pointer-events-none">
                    {spot.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer com dica */}
        <footer className="relative z-20 px-4 pb-6 text-center">
          <p className="text-xs text-slate-400/80 drop-shadow">
            💫 Mova o mouse para ver o efeito parallax
          </p>
        </footer>
      </div>
    </CosmosParallax>
  );
}
