#!/usr/bin/env node

/**
 * Script para sincronizar lunações do banco de dados
 * 
 * Uso:
 *   node scripts/sync-lunations.js [--years=2024,2025] [--replace]
 * 
 * Exemplos:
 *   node scripts/sync-lunations.js
 *   node scripts/sync-lunations.js --years=2024,2025
 *   node scripts/sync-lunations.js --years=2024,2025 --replace
 */

const https = require('https');
const http = require('http');

const SYNODIC_MONTH = 29.53058867;
const MAX_DAYS = 550;

function toJulianDay(date) {
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
}

function calcMoonAge(date) {
  const jd = toJulianDay(date) + (date.getUTCHours() - 12) / 24 + date.getUTCMinutes() / 1440;
  const daysSinceNew = jd - 2451549.5;
  const newMoons = daysSinceNew / SYNODIC_MONTH;
  const frac = newMoons - Math.floor(newMoons);
  return frac * SYNODIC_MONTH;
}

function illuminationFromAge(ageDays) {
  return 0.5 * (1 - Math.cos((2 * Math.PI * ageDays) / SYNODIC_MONTH));
}

function labelPhase(ageDays) {
  if (ageDays < 1.5 || ageDays > SYNODIC_MONTH - 1.5) return 'luaNova';
  if (ageDays < SYNODIC_MONTH / 2 - 1.2) return 'luaCrescente';
  if (ageDays < SYNODIC_MONTH / 2 + 1.2) return 'luaCheia';
  return 'luaMinguante';
}

function describePhase(norm) {
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
}

const zodiacCutoffs = [
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

function approximateSign(date) {
  const dayOfMonth = date.getUTCDate();
  const monthIndex = date.getUTCMonth();
  const cutoff = zodiacCutoffs[monthIndex][1];
  const sign =
    dayOfMonth < cutoff
      ? zodiacCutoffs[monthIndex === 0 ? 11 : monthIndex - 1][0]
      : zodiacCutoffs[monthIndex][0];
  return sign;
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function generateRange(start, end) {
  const days = [];
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
      illumination: Number(illumination.toFixed(2)),
      ageDays: Number(ageDays.toFixed(3)),
    });

    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    counter += 1;
  }

  return days;
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const isHttps = process.env.API_URL?.startsWith('https');
    const client = isHttps ? https : http;
    
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const url = new URL(path, baseUrl);

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.error || data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          } else {
            resolve(data);
          }
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function syncLunations() {
  const args = process.argv.slice(2);
  const yearsArg = args.find((a) => a.startsWith('--years='));
  const replace = args.includes('--replace');

  let years = [];
  if (yearsArg) {
    const yearStr = yearsArg.replace('--years=', '');
    years = yearStr.split(',').map((y) => parseInt(y, 10));
  } else {
    const now = new Date();
    const currentYear = now.getFullYear();
    years = [currentYear - 1, currentYear, currentYear + 1];
  }

  console.log(`📅 Sincronizando lunações para os anos: ${years.join(', ')}`);
  if (replace) {
    console.log('🔄 Modo REPLACE: deletando dados existentes antes de sincronizar');
  }

  for (const year of years) {
    try {
      const startDate = new Date(`${year}-01-01T00:00:00Z`);
      const endDate = new Date(`${year}-12-31T23:59:59Z`);

      console.log(
        `\n⏳ Gerando lunações para ${year}... (${startDate.toISOString().slice(0, 10)} até ${endDate.toISOString().slice(0, 10)})`
      );

      const days = generateRange(startDate, endDate);
      console.log(`✨ ${days.length} dias gerados`);

      const payload = {
        days,
        action: replace ? 'replace' : 'append',
      };

      console.log(`📤 Enviando para API...`);
      const result = await makeRequest('POST', '/api/moons/lunations', payload);

      if (result.success) {
        console.log(`✅ ${result.message}`);
      } else {
        console.error(`❌ Erro ao salvar:`, result);
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${year}:`, error.message);
    }
  }

  console.log('\n✨ Sincronização concluída!');
  console.log('💡 Dica: Acesse /cosmos para visualizar os dados sincronizados.');
}

syncLunations().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
