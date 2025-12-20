require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('Executando migração do unique constraint...');
    
    // Criar constraint se não existir
    await sql`
      ALTER TABLE monthly_insights 
      ADD CONSTRAINT IF NOT EXISTS unique_monthly_per_phase_month 
      UNIQUE (user_id, moon_phase, month_number)
    `;
    
    console.log('✅ Migração executada com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  }
}

runMigration();
