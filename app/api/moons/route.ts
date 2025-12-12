import { NextRequest, NextResponse } from "next/server";

const SYNODIC_MONTH = 29.53058867; // dias
const MAX_DAYS = 550; // evita ranges absurdos em uma chamada

export const dynamic = "force-dynamic";

type MoonDay = {
  date: string;
  moonPhase: string;
  sign: string;
  illumination: number;
  ageDays: number;
  normalizedPhase: "luaNova" | "luaCrescente" | "luaCheia" | "luaMinguante";
  signSource: "approx-solar-range";
};

const zodiacCutoffs: Array<[string, number]> = [
  ["Capricórnio", 20],
  ["Aquário", 19],
  ["Peixes", 21],
  ["Áries", 20],
  ["Touro", 21],
  ["Gêmeos", 21],
  ["Câncer", 23],
  ["Leão", 23],
  ["Virgem", 23],
  ["Libra", 23],
  ["Escorpião", 22],
  ["Sagitário", 22],
];

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
  return frac * SYNODIC_MONTH; // idade em dias
};

const illuminationFromAge = (ageDays: number) =>
  0.5 * (1 - Math.cos((2 * Math.PI * ageDays) / SYNODIC_MONTH));

const labelPhase = (ageDays: number): MoonDay["normalizedPhase"] => {
  if (ageDays < 1.5 || ageDays > SYNODIC_MONTH - 1.5) return "luaNova";
  if (ageDays < SYNODIC_MONTH / 2 - 1.2) return "luaCrescente";
  if (ageDays < SYNODIC_MONTH / 2 + 1.2) return "luaCheia";
  return "luaMinguante";
};

const describePhase = (norm: MoonDay["normalizedPhase"]) => {
  switch (norm) {
    case "luaNova":
      return "Lua Nova";
    case "luaCrescente":
      return "Lua Crescente";
    case "luaCheia":
      return "Lua Cheia";
    case "luaMinguante":
      return "Lua Minguante";
    default:
      return "Lua";
  }
};

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
      signSource: "approx-solar-range",
    });

    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    counter += 1;
  }

  return days;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const now = new Date();
  const defaultYear = now.getUTCFullYear();

  const startParam = searchParams.get("start") || `${defaultYear}-01-01`;
  const endParam = searchParams.get("end") || `${defaultYear}-12-31`;
  const tz = searchParams.get("tz") || "UTC";

  const startDate = parseIsoDate(startParam);
  const endDate = parseIsoDate(endParam);

  if (!startDate || !endDate || startDate > endDate) {
    return NextResponse.json(
      { error: "Parâmetros start/end inválidos. Use ISO YYYY-MM-DD." },
      { status: 400 },
    );
  }

  const days = generateRange(startDate, endDate);

  return NextResponse.json({
    days,
    generatedAt: new Date().toISOString(),
    source: "app/api/moons (aproximação interna)",
    tz,
    range: { start: formatIsoDate(startDate), end: formatIsoDate(endDate) },
  });
}
