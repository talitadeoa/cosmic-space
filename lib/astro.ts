// utilitário simples para calcular fase lunar e signo (aproximação)

export const SIGN_EMOJIS: Record<string, string> = {
  Capricórnio: '♑',
  Aquário: '♒',
  Peixes: '♓',
  Áries: '♈',
  Touro: '♉',
  Gêmeos: '♊',
  Câncer: '♋',
  Leão: '♌',
  Virgem: '♍',
  Libra: '♎',
  Escorpião: '♏',
  Sagitário: '♐',
};

export function getSignEmoji(sign: string): string {
  return SIGN_EMOJIS[sign] || '✨';
}

export function getLunarPhaseAndSign(date = new Date()) {
  // Cálculo simples da idade da lua em dias (algoritmo aproximado)
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12
  const day = date.getUTCDate();

  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;
  const k = Math.floor((year - 1900) * 12.3685);

  // simplified moon age - usando 19 de dezembro de 2025 como Lua Nova (referência do seu CSV)
  const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day - 1524.5;
  const newMoonRef = new Date('2025-12-19');
  const refJd =
    Math.floor(365.25 * (newMoonRef.getUTCFullYear() + 4716)) +
    Math.floor(30.6001 * (newMoonRef.getUTCMonth() + 2)) +
    newMoonRef.getUTCDate() -
    1524.5;
  const daysSinceRef = jd - refJd;
  const cycles = daysSinceRef / 29.53058867;
  const frac = cycles - Math.floor(cycles);
  const age = Math.round(frac * 29.53);

  // Classificação correta das fases lunares
  // Usa o mesmo algoritmo que app/api/moons/route.ts
  const SYNODIC_MONTH = 29.53058867;
  let fase = 'Nova';
  if (age < 1.5 || age > SYNODIC_MONTH - 1.5) fase = 'Nova';
  else if (age < SYNODIC_MONTH / 2 - 1.2) fase = 'Crescente';
  else if (age < SYNODIC_MONTH / 2 + 1.2) fase = 'Cheia';
  else fase = 'Minguante';

  // Signo pelo sol (apenas aproximação por data)
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const zodiacRanges: [number, number, string][] = [
    [1, 20, 'Capricórnio'],
    [1, 31, 'Aquário'],
  ];

  // Simples tabela por dias (mapa aproximado)
  const zodiac: [string, number][] = [
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

  let signo = 'Áries';
  const dayOfMonth = date.getUTCDate();
  const monthIndex = date.getUTCMonth();
  const cutoff = zodiac[monthIndex][1];
  signo =
    dayOfMonth < cutoff ? zodiac[monthIndex === 0 ? 11 : monthIndex - 1][0] : zodiac[monthIndex][0];

  return {
    data: date.toISOString().slice(0, 10),
    faseLua: fase,
    signo,
    age,
  };
}
