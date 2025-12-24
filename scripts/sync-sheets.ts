/**
 * Script para sincronizar lunações do Google Sheets para o banco de dados
 * Uso: npm run sync:sheets
 */

// Carregar variáveis de ambiente (.env.local)
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        process.env[key.trim()] = valueParts.join('=');
      }
    }
  });
  console.log('✅ Variáveis de ambiente carregadas do .env.local\n');
}

import { getLunationsFromSheets } from '@/lib/sheets-lunations';
import { saveLunations } from '@/lib/forms';

async function syncSheetsToDatabase() {
  try {
    console.log('🌙 Iniciando sincronização de lunações do Google Sheets...\n');

    // 1. Ler lunações do Sheets
    console.log('📖 Lendo lunações do Google Sheets...');
    const lunations = await getLunationsFromSheets();

    if (lunations.length === 0) {
      console.error('❌ Nenhuma lunação foi lida. Verifique as credenciais do Google.');
      process.exit(1);
    }

    console.log(`✅ ${lunations.length} lunações carregadas do Sheets\n`);

    // 2. Exibir amostra
    console.log('📝 Primeiras 3 lunações:');
    lunations.slice(0, 3).forEach((l) => {
      console.log(
        `  • ${l.lunation_date} - ${l.moon_phase} ${l.moon_emoji} (${l.zodiac_sign} ${l.zodiac_emoji})`
      );
    });
    console.log();

    // 3. Salvar no banco
    console.log('💾 Salvando no banco de dados...');
    const result = await saveLunations(lunations);

    console.log(`\n✅ Sincronização concluída com sucesso!`);
    console.log(`   ${result.length} lunações foram salvas/atualizadas`);
    console.log(`\n🎉 Próxima atualização: daqui a um ano! 🌙`);
  } catch (error) {
    console.error('❌ Erro ao sincronizar:', error);
    process.exit(1);
  }
}

// Executar
syncSheetsToDatabase();
