import postgres from 'postgres';

async function checkTables() {
  const sql = postgres(process.env.DATABASE_URL || '');
  try {
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
    console.log('📋 Tabelas no banco:');
    tables.forEach(t => console.log('  -', t.table_name));
  } finally {
    await sql.end();
  }
}

checkTables();
