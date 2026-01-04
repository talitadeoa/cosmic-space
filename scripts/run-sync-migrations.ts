import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

// Ler .env.local manualmente
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const envVars = envContent
  .split('\n')
  .filter(line => line.includes('=') && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...valueParts] = line.split('=');
    acc[key] = valueParts.join('=');
    return acc;
  }, {} as Record<string, string>);

process.env = { ...process.env, ...envVars };

const rawDatabaseUrl = process.env.DATABASE_URL || '';
// Remover parâmetros problemáticos que causam conflito SNI
const DATABASE_URL = rawDatabaseUrl
  .replace('&channel_binding=require', '')
  .replace('&options=endpoint%3Ddevelopment', '');

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada em .env.local');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function runMigrations() {
  try {
    const dbPath = join(process.cwd(), 'infra', 'db');

    const script09 = readFileSync(join(dbPath, '09-sync-changes.sql'), 'utf8');
    const script10 = readFileSync(join(dbPath, '10-planet-sync-alter.sql'), 'utf8');
    const script11 = readFileSync(join(dbPath, '11-island-sync-alter.sql'), 'utf8');
    const script12 = readFileSync(join(dbPath, '12-planet-todos-indexes.sql'), 'utf8');
    const script13 = readFileSync(join(dbPath, '13-island-version-fix.sql'), 'utf8');

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

    console.log('🎉 Todos os scripts executados com sucesso!');
    await sql.end();
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

runMigrations();
