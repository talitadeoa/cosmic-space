import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

// URL de production (sem channel_binding que causa problema)
const DATABASE_URL = 'postgresql://neondb_owner:npg_d28GLcnPuZYO@ep-raspy-unit-ac2ftblq-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = postgres(DATABASE_URL);

async function runMigrations() {
  try {
    const dbPath = join(process.cwd(), 'infra', 'db');

    const script09 = readFileSync(join(dbPath, '09-sync-changes.sql'), 'utf8');
    const script10 = readFileSync(join(dbPath, '10-planet-sync-alter.sql'), 'utf8');
    const script11 = readFileSync(join(dbPath, '11-island-sync-alter.sql'), 'utf8');
    const script12 = readFileSync(join(dbPath, '12-planet-todos-indexes.sql'), 'utf8');
    const script13 = readFileSync(join(dbPath, '13-island-version-fix.sql'), 'utf8');
    const script14 = readFileSync(join(dbPath, '14-user-emotions.sql'), 'utf8');
    const script15 = readFileSync(join(dbPath, '15-user-cycles.sql'), 'utf8');
    const script16 = readFileSync(join(dbPath, '16-planet-todos-parent-id.sql'), 'utf8');

    console.log('⏳ Executando script 09: sync-changes...');
    await sql.unsafe(script09);
    console.log('✅ Script 09 concluído\n');

    console.log('⏳ Executando script 10: planet-sync-alter...');
    await sql.unsafe(script10);
    console.log('✅ Script 10 concluído\n');

    console.log('⏳ Executando script 11: island-sync-alter...');
    await sql.unsafe(script11);
    console.log('✅ Script 11 concluído\n');

    console.log('⏳ Executando script 12: planet-todos-indexes...');
    await sql.unsafe(script12);
    console.log('✅ Script 12 concluído\n');

    console.log('⏳ Executando script 13: island-version-fix...');
    await sql.unsafe(script13);
    console.log('✅ Script 13 concluído\n');

    console.log('⏳ Executando script 14: user-emotions...');
    await sql.unsafe(script14);
    console.log('✅ Script 14 concluído\n');

    console.log('⏳ Executando script 15: user-cycles...');
    await sql.unsafe(script15);
    console.log('✅ Script 15 concluído\n');

    console.log('⏳ Executando script 16: planet-todos-parent-id...');
    await sql.unsafe(script16);
    console.log('✅ Script 16 concluído\n');

    console.log('🎉 Todos os scripts executados com sucesso!');
    await sql.end();
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    await sql.end();
    process.exit(1);
  }
}

runMigrations();
