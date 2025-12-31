import { NextRequest, NextResponse } from 'next/server';
import { getLunations, saveLunations, deleteLunations } from '@/lib/forms';
import { getLunarPhaseAndSign } from '@/lib/astro';

export const dynamic = 'force-dynamic';

const SYNODIC_MONTH = 29.53058867; // dias
const MAX_DAYS = 550;

type MoonDay = {
  date: string;
  moonPhase: string;
  sign: string;
  illumination: number;
  ageDays: number;
  normalizedPhase: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';
};

const toJulianDay = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
};

const calcMoonAge = (date: Date) => {
  const jd = toJulianDay(date) + (date.getUTCHours() - 12) / 24 + date.getUTCMinutes() / 1440;
  const daysSinceNew = jd - 2451549.5;
  const newMoons = daysSinceNew / SYNODIC_MONTH;
  const frac = newMoons - Math.floor(newMoons);
  return frac * SYNODIC_MONTH;
};

const illuminationFromAge = (ageDays: number) =>
  0.5 * (1 - Math.cos((2 * Math.PI * ageDays) / SYNODIC_MONTH));

const labelPhase = (ageDays: number): 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante' => {
  if (ageDays < 1.5 || ageDays > SYNODIC_MONTH - 1.5) return 'luaNova';
  if (ageDays < SYNODIC_MONTH / 2 - 1.2) return 'luaCrescente';
  if (ageDays < SYNODIC_MONTH / 2 + 1.2) return 'luaCheia';
  return 'luaMinguante';
};

const describePhase = (norm: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante') => {
  switch (norm) {
    case 'luaNova':
      return 'Lua Nova';
    case 'luaCrescente':
      return 'Lua Crescente';
    case 'luaCheia':
      return 'Lua Cheia';
    case 'luaMinguante':
      return 'Lua Minguante';
    default:
      return 'Lua';
  }
};

const zodiacCutoffs: Array<[string, number]> = [
  ['Capricórnio', 20],
  ['Aquário', 19],
  ['Peixes', 21],
  ['Áries', 20],
  ['Touro', 21],
  ['Gêmeos', 21],
  ['Câncer', 23],
  ['Leão', 23],
  ['Virgem', 23],
  ['Libra', 23],
  ['Escorpião', 22],
  ['Sagitário', 22],
];

const approximateSign = (date: Date) => {
  const dayOfMonth = date.getUTCDate();
  const monthIndex = date.getUTCMonth();
  const cutoff = zodiacCutoffs[monthIndex][1];
  const sign =
    dayOfMonth < cutoff
      ? zodiacCutoffs[monthIndex === 0 ? 11 : monthIndex - 1][0]
      : zodiacCutoffs[monthIndex][0];
  return sign;
};

const parseIsoDate = (value: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const generateRange = (start: Date, end: Date): MoonDay[] => {
  const days: MoonDay[] = [];
  let cursor = new Date(start);
  let counter = 0;

  while (cursor <= end && counter < MAX_DAYS) {
    const ageDays = calcMoonAge(cursor);
    const normalizedPhase = labelPhase(ageDays);
    const illumination = illuminationFromAge(ageDays);
    const sign = approximateSign(cursor);

    days.push({
      date: formatIsoDate(cursor),
      moonPhase: describePhase(normalizedPhase),
      sign,
      illumination,
      ageDays: Number(ageDays.toFixed(3)),
      normalizedPhase,
    });

    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    counter += 1;
  }

  return days;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const now = new Date();
    const defaultYear = now.getUTCFullYear();

    const startParam = searchParams.get('start') || `${defaultYear}-01-01`;
    const endParam = searchParams.get('end') || `${defaultYear}-12-31`;
    const source = searchParams.get('source') || 'auto'; // 'auto', 'db', 'generated'

    const startDate = parseIsoDate(startParam);
    const endDate = parseIsoDate(endParam);

    if (!startDate || !endDate || startDate > endDate) {
      return NextResponse.json(
        { error: 'Parâmetros start/end inválidos. Use ISO YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    let dbLunations: any[] = [];
    let usedDatabase = false;
    let dbError: Error | null = null;

    // 1. Tentar buscar do banco de dados se source é 'auto' ou 'db'
    if ((source === 'auto' || source === 'db') && process.env.DATABASE_URL) {
      try {
        dbLunations = await getLunations(startParam, endParam);
        if (dbLunations && dbLunations.length > 0) {
          usedDatabase = true;
          console.log(`✅ Lunações do banco: ${dbLunations.length} registros (${startParam} a ${endParam})`);
          return NextResponse.json({
            days: dbLunations.map((l: any) => ({
              date: l.lunation_date,
              moonPhase: l.moon_phase,
              sign: l.zodiac_sign,
              illumination: l.illumination,
              ageDays: l.age_days,
              description: l.description,
              source: 'database',
            })),
            generatedAt: new Date().toISOString(),
            source: 'database',
            range: { start: startParam, end: endParam },
          });
        }
      } catch (error) {
        dbError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️  Banco não disponível (${startParam} a ${endParam}):`, dbError.message);
        // Continua para gerar localmente
      }
    }

    // Se source é 'db' e banco falhou, retornar erro
    if (source === 'db' && !usedDatabase) {
      console.error(`❌ Erro crítico: source=db solicitado mas banco não disponível`, dbError?.message);
      return NextResponse.json(
        { error: 'Banco de dados não disponível e source=db foi solicitado', details: dbError?.message },
        { status: 503 }
      );
    }

    // 2. Gerar localmente (fallback ou source=generated)
    console.log(`📊 Gerando lunações localmente (${startParam} a ${endParam})`);
    const days = generateRange(startDate, endDate);

    return NextResponse.json({
      days,
      generatedAt: new Date().toISOString(),
      source: 'generated',
      range: { start: formatIsoDate(startDate), end: formatIsoDate(endDate) },
    });
  } catch (error) {
    console.error('Erro ao buscar lunações:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { days, action } = body;

    if (!Array.isArray(days) || days.length === 0) {
      return NextResponse.json({ error: 'Array de dias obrigatório e não vazio' }, { status: 400 });
    }

    if (action === 'replace') {
      // Deletar e recriar para um range específico
      if (days.length === 0) {
        return NextResponse.json({ error: "Dias obrigatórios para 'replace'" }, { status: 400 });
      }

      const dates = days.map((d: any) => d.date || d.lunation_date);
      const minDate = dates.reduce((a: string, b: string) => (a < b ? a : b));
      const maxDate = dates.reduce((a: string, b: string) => (a > b ? a : b));

      // Deletar antigos
      await deleteLunations(minDate, maxDate);
    }

    // Salvar lunações
    const lunationsData = days.map((d: any) => {
      // Normalizar nomes de campos que podem vir de diferentes fontes
      const lunation_date = d.date || d.lunation_date;
      const moon_phase = d.moonPhase || d.moon_phase;
      const zodiac_sign = d.sign || d.zodiac_sign;

      // Validar dados obrigatórios
      if (!lunation_date || !moon_phase || !zodiac_sign) {
        console.warn('Lunação com dados incompletos:', d);
      }

      return {
        lunation_date,
        moon_phase,
        zodiac_sign,
        illumination: d.illumination ?? null,
        age_days: d.ageDays ?? d.age_days ?? null,
        description: d.description ?? null,
        source: d.source || 'synced',
      };
    });

    const saved = await saveLunations(lunationsData);

    return NextResponse.json(
      {
        success: true,
        message: `${saved.length} lunações salvas com sucesso`,
        count: saved.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao salvar lunações:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar lunações', details: String(error) },
      { status: 500 }
    );
  }
}
