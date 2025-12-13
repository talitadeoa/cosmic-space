#!/usr/bin/env node

/**
 * Script para criar todas as tabelas do schema.sql no Neon
 * Usage: node scripts/create-tables.js
 */

const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

// Carregar .env.local manualmente
function loadEnv() {
  try {
    const envPath = path.join(__dirname, "..", ".env.local");
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    });
  } catch (error) {
    // .env.local não existe
  }
}

loadEnv();

async function createTables() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL não configurada no .env.local");
    console.log("\n💡 Configure sua URL do Neon:");
    console.log("   1. Abra: https://console.neon.tech/");
    console.log("   2. Vá em: Connection Details");
    console.log("   3. Copie a connection string");
    console.log("   4. Cole no arquivo .env.local");
    process.exit(1);
  }

  console.log("🔌 Conectando ao Neon...\n");

  const sql = neon(DATABASE_URL);

  // Ler o schema.sql
  const schemaPath = path.join(__dirname, "..", "infra", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  console.log("📋 Executando schema.sql...\n");

  try {
    // Dividir o schema em comandos individuais
    const commands = schema
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0 && !cmd.startsWith("--"));

    // Executar cada comando
    for (const command of commands) {
      await sql.query(command + ";", []);
    }

    console.log("✅ Schema executado com sucesso!\n");

    // Verificar tabelas criadas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log("📊 Tabelas criadas:");
    tables.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.table_name}`);
    });

    console.log("\n🎉 Banco de dados pronto para uso!");
    console.log("\n💡 Acesse: https://console.neon.tech/ para visualizar");

  } catch (error) {
    console.error("❌ Erro ao criar tabelas:", error.message);
    console.error("\n🔍 Detalhes:", error);
    process.exit(1);
  }
}

createTables();
