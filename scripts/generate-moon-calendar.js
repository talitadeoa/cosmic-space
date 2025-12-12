#!/usr/bin/env node
/* Gera moons.json para o app consumir offline/estático.
   Uso: node scripts/generate-moon-calendar.js [ano] [outputPath]
   Exemplo: node scripts/generate-moon-calendar.js 2025 public/moons.json
*/

const fs = require("fs");
const path = require("path");

const SYNODIC_MONTH = 29.53058867; // dias
const zodiacCutoffs = [
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

const toJulianDay = (date) => {
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

const calcMoonAge = (date) => {
  const jd = toJulianDay(date) + (date.getUTCHours() - 12) / 24 + date.getUTCMinutes() / 1440;
  const daysSinceNew = jd - 2451549.5;
  const newMoons = daysSinceNew / SYNODIC_MONTH;
  const frac = newMoons - Math.floor(newMoons);
  return frac * SYNODIC_MONTH; // idade em dias
};

const illuminationFromAge = (ageDays) => 0.5 * (1 - Math.cos((2 * Math.PI * ageDays) / SYNODIC_MONTH));

const labelPhase = (ageDays) => {
  if (ageDays < 1.5 || ageDays > SYNODIC_MONTH - 1.5) return "luaNova";
  if (ageDays < SYNODIC_MONTH / 2 - 1.2) return "luaCrescente";
  if (ageDays < SYNODIC_MONTH / 2 + 1.2) return "luaCheia";
  return "luaMinguante";
};

const describePhase = (norm) => {
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

const approximateSign = (date) => {
  const dayOfMonth = date.getUTCDate();
  const monthIndex = date.getUTCMonth();
  const cutoff = zodiacCutoffs[monthIndex][1];
  return dayOfMonth < cutoff ? zodiacCutoffs[monthIndex === 0 ? 11 : monthIndex - 1][0] : zodiacCutoffs[monthIndex][0];
};

const formatIsoDate = (date) => date.toISOString().slice(0, 10);

const generateYear = (year) => {
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));
  const days = [];
  let cursor = new Date(start);

  while (cursor <= end) {
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
  }

  return {
    days,
    generatedAt: new Date().toISOString(),
    source: "scripts/generate-moon-calendar (aproximação interna)",
    tz: "UTC",
    range: { start: formatIsoDate(start), end: formatIsoDate(end) },
  };
};

const yearArg = Number(process.argv[2]);
const year = Number.isFinite(yearArg) ? yearArg : new Date().getUTCFullYear();
const outputArg = process.argv[3] || path.join(process.cwd(), "public", "moons.json");

const payload = generateYear(year);

fs.mkdirSync(path.dirname(outputArg), { recursive: true });
fs.writeFileSync(outputArg, JSON.stringify(payload, null, 2), "utf8");

console.log(`Calendário lunar gerado para ${year}: ${outputArg}`);
console.log(`Dias: ${payload.days.length}, gerado em ${payload.generatedAt}`);

module.exports = { generateYear };
