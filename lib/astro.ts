// utilitário simples para calcular fase lunar e signo (aproximação)

export function getLunarPhaseAndSign(date = new Date()) {
  // Cálculo simples da idade da lua em dias (algoritmo aproximado)
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12
  const day = date.getUTCDate();

  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;
  const k = Math.floor((year - 1900) * 12.3685);

  // simplified moon age
  const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day - 1524.5;
  const daysSinceNew = jd - 2451549.5;
  const newMoons = daysSinceNew / 29.53058867;
  const frac = newMoons - Math.floor(newMoons);
  const age = Math.round(frac * 29.53);

  let fase = 'Nova';
  if (age < 7) fase = 'Crescente';
  if (age >= 7 && age < 15) fase = 'Primeiro Quarto';
  if (age >= 15 && age < 22) fase = 'Minguante';
  if (age >= 22) fase = 'Cheia';

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
