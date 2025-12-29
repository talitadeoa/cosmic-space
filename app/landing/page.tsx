import { Space_Grotesk } from 'next/font/google';
import EmailSignupForm from '@/components/home/EmailSignupForm';

const orbitFont = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

const statBlocks = [
  { label: 'Ciclos acompanhados', value: '28 dias', detail: 'Lua em ritmo real' },
  { label: 'Painéis simultâneos', value: '05 cenas', detail: 'Sol • Lua • Planeta' },
  { label: 'Alertas inteligentes', value: '24h', detail: 'Latência média' },
  { label: 'Integrações conectadas', value: '07 fontes', detail: 'Dados vivos' },
];

const highlightCards = [
  {
    title: 'Órbitas sincronizadas',
    description: 'Organize Sol, Lua e Planeta com métricas compartilhadas e contexto em camadas.',
    metric: 'Camadas multiverso',
    accent: 'from-indigo-400 via-sky-400 to-cyan-300',
  },
  {
    title: 'Insights táticos',
    description: 'Modelos de prompts + visão mensal, trimestral e anual para decisões rápidas.',
    metric: '3 temporalidades',
    accent: 'from-violet-400 via-fuchsia-400 to-rose-400',
  },
  {
    title: 'Alertas orbitais',
    description: 'Fluxos que disparam sons, e-mails ou automações quando algo foge da curva.',
    metric: 'Reação em minutos',
    accent: 'from-emerald-400 via-cyan-400 to-sky-400',
  },
  {
    title: 'Mapas navegáveis',
    description: 'Telão interativo com cortes de dados por missão, squad ou energia da temporada.',
    metric: 'Zoom infinito',
    accent: 'from-amber-300 via-orange-400 to-rose-400',
  },
];

const launchTimeline = [
  {
    phase: '01',
    title: 'Alpha privada',
    detail: 'Mapeamento das interações entre Sol e Lua, com dashboards silenciosos.',
    status: 'concluída',
    emoji: '🌑',
  },
  {
    phase: '02',
    title: 'Spark Sessions',
    detail: 'Testes com squads convidados para ajustar alertas orbitais e playlists.',
    status: 'em andamento',
    emoji: '🌗',
  },
  {
    phase: '03',
    title: 'Landing aberta',
    detail: 'Lista de espera, kits de integração e stories da missão.',
    status: 'pré-lançamento',
    emoji: '🌕',
  },
];

const signalBeams = [
  { label: 'Integrações nativas', value: 'Neon, Supabase, Airtable, Notion, Linear' },
  { label: 'Rotas em destaque', value: 'LuaList, Galáxia Suns, Eclipse Productivity' },
  { label: 'Protocolos de acesso', value: 'Auth Gate com sync automático + Radio Player' },
  { label: 'Stack criativo', value: 'Next 14 • Tailwind • Web Audio • Vercel Edge' },
];

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <main
      className={`${orbitFont.className} relative isolate min-h-screen overflow-hidden px-4 py-16 sm:px-8 lg:px-12`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/30 blur-[120px]" />
        <div className="absolute bottom-0 left-20 h-64 w-64 rounded-full bg-rose-500/20 blur-[120px]" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-sky-400/20 blur-[130px]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-20">
        <section className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[32px] border border-white/10 bg-black/30 p-8 shadow-2xl shadow-indigo-900/30 backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.28em] text-slate-200/80">
              temporada 02
              <span className="text-sky-300">•</span>
              modo órbita
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Aterrissagem oficial da{' '}
              <span className="bg-gradient-to-r from-indigo-200 via-sky-200 to-rose-200 bg-clip-text text-transparent">
                Cosmic Space
              </span>
            </h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Uma landing viva para acompanhar o nascimento do hub que sincroniza Sol, Lua, Planeta
              e toda a galáxia produtiva. Entre na lista para receber os bastidores e o kit de
              integração.
            </p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/40 p-5 shadow-inner shadow-black/40">
              <EmailSignupForm />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {statBlocks.map((stat) => (
                <div key={stat.label} className="space-y-1 border-l border-white/10 pl-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                  <p className="text-xl font-semibold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-space-medium/70 via-slate-900/50 to-space-dark/90 p-8 shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
            <div className="relative space-y-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">sinais captados</p>
              <p className="text-3xl font-semibold text-white">
                Narrativa viva, camadas sonoras e visual tático
              </p>
              <div className="space-y-5">
                {signalBeams.slice(0, 2).map((beam) => (
                  <div
                    key={beam.label}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                      {beam.label}
                    </p>
                    <p className="mt-2 text-base text-white">{beam.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-5">
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">
                  Envelope sonoro
                </p>
                <p className="mt-2 text-lg text-white">
                  Radio Player + Sfx Provider ativados para guiar cada salto.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                ferramentas orbitais
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                Recursos feitos para explorar cada camada
              </h2>
            </div>
            <p className="text-sm text-slate-400 sm:max-w-sm">
              Tudo conversa entre si: insights, áudio, alerts, automações e os fluxos visuais que
              você já conhece nas rotas internas.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {highlightCards.map((card) => (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-lg transition-transform duration-200 hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 opacity-0 blur-3xl transition group-hover:opacity-40 bg-gradient-to-r ${card.accent}`}
                />
                <div className="relative space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{card.metric}</p>
                  <h3 className="text-2xl font-semibold text-white">{card.title}</h3>
                  <p className="text-sm text-slate-300">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/10 bg-black/30 p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  linha do lançamento
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Próximos saltos</h2>
              </div>
              <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
                beta em breve
              </span>
            </div>
            <div className="relative mt-10">
              <div className="absolute left-3 top-0 h-full w-px bg-white/10" />
              <ul className="space-y-8">
                {launchTimeline.map((step, index) => (
                  <li key={step.phase} className="relative pl-12">
                    <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-gradient-to-r from-indigo-300 to-rose-300" />
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      fase {step.phase}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <span>{step.emoji}</span>
                      <span>{step.status}</span>
                      {index === 1 && (
                        <span className="animate-pulse text-emerald-300">• ao vivo</span>
                      )}
                    </div>
                    <h3 className="mt-1 text-2xl font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{step.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-gradient-to-b from-slate-900/80 via-space-medium/60 to-space-dark/80 p-8 shadow-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              frequência de sinais
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Stack pronto para orbitar</h2>
            <div className="mt-8 space-y-6">
              {signalBeams.map((beam) => (
                <div key={beam.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-300">
                    {beam.label}
                  </p>
                  <p className="mt-3 text-lg text-white">{beam.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[36px] border border-white/15 bg-gradient-to-br from-indigo-900/60 via-space-medium/80 to-black/90 p-10 shadow-2xl">
          <div className="absolute right-10 top-10 h-40 w-40 rounded-full border border-white/10" />
          <div className="absolute -right-16 bottom-6 h-48 w-48 rounded-full bg-rose-400/10 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
                lista de transmissão
              </p>
              <h2 className="text-4xl font-semibold text-white">
                Receba o kit de orbitas e a playlist de lançamento
              </h2>
              <p className="text-base text-slate-200">
                Mandaremos um pacote com briefing visual, atalhos de automação, wallpaper tático e
                acesso antecipado às rotas paralelas quando cada fase abrir.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-white/20 px-3 py-1">
                  🎧 Radio Player
                </span>
                <span className="rounded-full border border-white/20 px-3 py-1">
                  🛰️ Neon branch
                </span>
                <span className="rounded-full border border-white/20 px-3 py-1">
                  🌗 Guia Luações
                </span>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-inner">
              <EmailSignupForm />
              <p className="mt-4 text-[13px] text-slate-400">
                Prometemos zero spam: apenas sinais quando algo realmente pousar.
              </p>
            </div>
          </div>
          <p className="mt-10 text-center text-[11px] text-slate-400">
            © {year} Cosmic Space • Construído no hiperespaço com som ambiente
          </p>
        </section>
      </div>
    </main>
  );
}
