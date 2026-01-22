import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

const scripts = [
  '01-base-tables.sql',
  '02-lunar-phases.sql',
  '03-islands.sql',
  '04-lunations.sql',
  '05-phase-inputs.sql',
  '06-community.sql',
  '07-planet-todos.sql',
  '08-planet-state.sql',
  '09-sync-changes.sql',
  '10-planet-sync-alter.sql',
  '11-island-sync-alter.sql',
  '12-planet-todos-indexes.sql',
  '16-planet-todos-parent-id.sql',
];

async function runAllMigrations() {
  try {
    const dbPath = join(process.cwd(), 'infra', 'db');

    for (const script of scripts) {
      const filePath = join(dbPath, script);
      const content = readFileSync(filePath, 'utf8');
      
      console.log(`⏳ Executando ${script}...`);
      await sql.unsafe(content);
      console.log(`✅ ${script} concluído\n`);
    }

    console.log('🎉 Todos os 13 scripts executados com sucesso!');
    await sql.end();
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

runAllMigrations();
