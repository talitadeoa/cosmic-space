import Image from 'next/image';
import Link from 'next/link';

const BACKGROUND_IMAGE = '/home-alternativa.png';

const HOTSPOTS = [
  {
    id: 'galaxia',
    label: 'Galáxia',
    href: '/universo/galaxia',
    top: '28%',
    left: '38%',
    size: '14%',
  },
  {
    id: 'eclipse',
    label: 'Eclipse',
    href: '/universo/eclipse',
    top: '16%',
    left: '50%',
    size: '6%',
  },
  {
    id: 'sol',
    label: 'Sol',
    href: '/universo/sol',
    top: '50%',
    left: '62%',
    size: '10%',
  },
  {
    id: 'luas',
    label: 'Luas',
    href: '/universo/lua',
    top: '24%',
    left: '16%',
    size: '12%',
  },
  {
    id: 'planeta',
    label: 'Planeta',
    href: '/universo/planeta',
    top: '86%',
    left: '82%',
    size: '18%',
  },
];

export default function HomeAlternativaPage() {
  return (
    <main className="min-h-[100dvh] px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-slate-300">Home alternativa</p>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            Explore os elementos do cosmos
          </h1>
          <p className="mt-3 text-sm text-slate-200/80 md:text-base">
            Clique nos planetas, luas, sol, galáxia e eclipse para navegar pelas rotas já
            existentes.
          </p>
        </header>

        <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={BACKGROUND_IMAGE}
              alt="Cenário espacial com planetas, luas, galáxia, sol e eclipse"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-950/70" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.2),transparent_45%)]" />
          </div>

          <div className="absolute inset-0 z-10">
            {HOTSPOTS.map((spot) => (
              <Link
                key={spot.id}
                href={spot.href}
                aria-label={`Abrir ${spot.label}`}
                className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/10 text-white shadow-[0_0_25px_rgba(255,255,255,0.25)] transition duration-300 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/80"
                style={{
                  top: spot.top,
                  left: spot.left,
                  width: spot.size,
                  height: spot.size,
                }}
              >
                <span className="absolute inset-0 rounded-full bg-white/10 opacity-70 animate-pulse-soft" />
                <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-100 opacity-0 transition duration-300 group-hover:opacity-100">
                  {spot.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Dica: ajuste a posição dos hotspots no arquivo para alinhar perfeitamente com a sua
          imagem.
        </div>
      </div>
    </main>
  );
}
