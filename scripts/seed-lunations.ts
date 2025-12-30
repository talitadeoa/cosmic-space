/**
 * Script para popular a tabela lunations com os dados fornecidos
 * Execute: npx tsx scripts/seed-lunations.ts
 */

import { saveLunations } from '@/lib/forms';
import type { LunationData } from '@/types/lunation';

const lunationsData: LunationData[] = [
  {
    lunation_date: '2025-10-21',
    moon_phase: 'Nova',
    moon_emoji: '🌑',
    zodiac_sign: 'Libra',
    zodiac_emoji: '⚖️',
    source: 'manual',
  },
  {
    lunation_date: '2025-10-29',
    moon_phase: 'Crescente',
    moon_emoji: '🌓',
    zodiac_sign: 'Aquário',
    zodiac_emoji: '🧊',
    source: 'manual',
  },
  {
    lunation_date: '2025-11-05',
    moon_phase: 'Cheia',
    moon_emoji: '🌕',
    zodiac_sign: 'Touro',
    zodiac_emoji: '🐂',
    source: 'manual',
  },
  {
    lunation_date: '2025-11-12',
    moon_phase: 'Minguante',
    moon_emoji: '🌗',
    zodiac_sign: 'Leão',
    zodiac_emoji: '🦁',
    source: 'manual',
  },
];

async function seed() {
  try {
    console.warn('🌙 Iniciando seed de lunações...');
    console.warn(`📊 Total de registros: ${lunationsData.length}`);

    const results = await saveLunations(lunationsData);

    console.warn('✅ Lunações salvas com sucesso!');
    console.warn(`✨ Registros processados: ${results.length}`);

    results.forEach((r: any) => {
      console.warn(
        `  → ${r.lunation_date}: ${r.moon_emoji} ${r.moon_phase} em ${r.zodiac_emoji} ${r.zodiac_sign}`
      );
    });
  } catch (error) {
    console.error('❌ Erro ao fazer seed das lunações:', error);
    process.exit(1);
  }
}

seed();
