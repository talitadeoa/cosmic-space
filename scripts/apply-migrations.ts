import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

const loadDatabaseUrl = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = path.resolve(process.cwd(), '.env.local');
  const raw = fs.readFileSync(envPath, 'utf8');
  const match = raw.match(/^DATABASE_URL=(.*)$/m);
  if (!match) {
    throw new Error('DATABASE_URL nao encontrado em .env.local');
  }
  return match[1].trim();
};

const db = neon(loadDatabaseUrl());

const applySql = async (filePath: string) => {
  const sql = fs.readFileSync(filePath, 'utf8');
  // Separar comandos por ponto e vírgula
  const commands = sql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0);
  
  for (const command of commands) {
    try {
      await db.query(command);
    } catch (error: any) {
      // Ignorar erros de "already exists"
      if (error.code !== '42P07' && error.code !== '42P06') {
        throw error;
      }
      console.log(`  → já existe: ${command.substring(0, 50)}...`);
    }
  }
  console.log(`✓ aplicado: ${filePath}`);
};

const files = [
  'infra/db/01-base-tables.sql',
  'infra/db/02-lunar-phases.sql',
  'infra/db/03-islands.sql',
  'infra/db/04-lunations.sql',
  'infra/db/05-phase-inputs.sql',
  'infra/db/06-community.sql',
  'infra/db/07-planet-todos.sql',
  'infra/db/08-planet-state.sql',
  'infra/db/09-sync-changes.sql',
  'infra/db/10-planet-sync-alter.sql',
  'infra/db/11-island-sync-alter.sql',
  'infra/db/12-planet-todos-indexes.sql',
];

(async () => {
  for (const file of files) {
    await applySql(file);
  }
})().catch((error) => {
  console.error('Erro ao aplicar migrations:', error);
  process.exit(1);
});
