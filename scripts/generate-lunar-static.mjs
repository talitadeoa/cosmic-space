#!/usr/bin/env node

/**
 * Gera dados lunares estáticos usando o serviço Python
 * Muito mais rápido e preciso que o script anterior
 * 
 * Uso:
 *   node scripts/generate-lunar-static.mjs [ano] [outputPath]
 *   Exemplo: node scripts/generate-lunar-static.mjs 2025 public/lunar-data.json
 * 
 * Com Docker:
 *   docker-compose up lunar-compute
 *   node scripts/generate-lunar-static.mjs 2025
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LUNAR_COMPUTE_URL = process.env.LUNAR_COMPUTE_URL || 'http://localhost:8000';
const DEFAULT_OUTPUT = path.join(__dirname, '../public/lunar-data.json');

/**
 * Buscar lunações do serviço Python
 */
async function fetchLunationsFromPython(year) {
  console.log(`📥 Buscando dados de ${year} do Lunar Compute Service...`);
  
  const response = await fetch(`${LUNAR_COMPUTE_URL}/api/lunations-year?year=${year}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar lunações: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Gerar dados para múltiplos anos
 */
async function generateYears(startYear, count = 3) {
  const results = {};
  
  for (let i = 0; i < count; i++) {
    const year = startYear + i;
    console.log(`\n📅 Processando ${year}...`);
    
    try {
      const data = await fetchLunationsFromPython(year);
      results[year] = data;
      console.log(`   ✅ ${data.count} lunações encontradas`);
    } catch (error) {
      console.error(`   ❌ Erro ao processar ${year}: ${error.message}`);
    }
  }

  return results;
}

/**
 * Salvar dados em arquivo
 */
function saveToFile(data, outputPath) {
  const dir = path.dirname(outputPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(
    outputPath,
    JSON.stringify(data, null, 2),
    'utf-8'
  );

  console.log(`✅ Dados salvos em: ${outputPath}`);
  console.log(`   Tamanho: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
}

/**
 * Main
 */
async function main() {
  try {
    // Parse argumentos
    const args = process.argv.slice(2);
    const year = parseInt(args[0] || new Date().getFullYear());
    const outputPath = args[1] || DEFAULT_OUTPUT;
    const yearsToGenerate = parseInt(args[2] || 3);

    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  🌙 Gerador de Dados Lunares Estáticos             ║');
    console.log('║  Usando Lunar Compute Service (Python)             ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Verificar se serviço está online
    console.log('🔍 Verificando Lunar Compute Service...');
    try {
      const health = await fetch(`${LUNAR_COMPUTE_URL}/health`);
      if (!health.ok) {
        throw new Error('Serviço indisponível');
      }
      const healthData = await health.json();
      console.log(`✅ Serviço online: ${healthData.service} v${healthData.version}\n`);
    } catch (error) {
      console.error(`\n❌ Lunar Compute Service não está disponível em ${LUNAR_COMPUTE_URL}`);
      console.error('   Inicie com: docker-compose up lunar-compute\n');
      process.exit(1);
    }

    // Gerar dados
    console.log(`📊 Gerando dados para ${yearsToGenerate} ano(s)...`);
    const allData = await generateYears(year, yearsToGenerate);

    if (Object.keys(allData).length === 0) {
      throw new Error('Nenhum dado foi gerado');
    }

    // Salvar
    console.log('\n💾 Salvando dados...');
    saveToFile(allData, outputPath);

    // Resumo
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  ✅ Geração Concluída!                            ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    const totalLunations = Object.values(allData).reduce(
      (sum, data) => sum + (data.count || 0),
      0
    );

    console.log(`📈 Resumo:`);
    console.log(`   Anos processados: ${Object.keys(allData).length}`);
    console.log(`   Total de lunações: ${totalLunations}`);
    console.log(`   Arquivo: ${outputPath}`);
    console.log(`\n✨ Pronto para usar em production!\n`);

  } catch (error) {
    console.error(`\n❌ Erro: ${error.message}`);
    process.exit(1);
  }
}

main();
