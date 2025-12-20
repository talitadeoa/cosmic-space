import fs from 'fs';
import { neon } from '@neondatabase/serverless';

// Carregar .env.local manualmente
const envContent = fs.readFileSync('.env.local', 'utf-8');
const databaseUrl = envContent
  .split('\n')
  .find((line) => line.startsWith('DATABASE_URL='))
  ?.split('=')[1];

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não encontrada em .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runMigration() {
  try {
    console.log('Executando migração do unique constraint...');
    
    // Primeiro tenta remover o constraint se existir
    try {
      await sql`ALTER TABLE monthly_insights DROP CONSTRAINT unique_monthly_per_phase_month`;
      console.log('Constraint anterior removido');
    } catch (e) {
      // Ignora erro se não existir
    }
    
    // Agora cria o novo constraint
    const result = await sql`
      ALTER TABLE monthly_insights 
      ADD CONSTRAINT unique_monthly_per_phase_month 
      UNIQUE (user_id, moon_phase, month_number)
    `;
    
    console.log('✅ Migração executada com sucesso!');
  } catch (error: any) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  }
}

runMigration();
