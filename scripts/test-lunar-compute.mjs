#!/usr/bin/env node

/**
 * Script de teste do Lunar Compute Service
 * Valida que o serviço Python está funcionando corretamente
 * 
 * Uso: node scripts/test-lunar-compute.mjs
 */

import fetch from 'node-fetch';

const LUNAR_COMPUTE_URL = process.env.LUNAR_COMPUTE_URL || 'http://localhost:8000';
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3000/api/compute';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    console.log(`\n🧪 Testando: ${name}`);
    await fn();
    console.log(`✅ PASSOU`);
    passed++;
  } catch (error) {
    console.error(`❌ FALHOU: ${error.message}`);
    failed++;
  }
}

async function testHealthCheck() {
  const response = await fetch(`${LUNAR_COMPUTE_URL}/health`);
  if (!response.ok) throw new Error(`Status ${response.status}`);
  
  const data = await response.json();
  if (data.status !== 'ok') throw new Error('Status não é OK');
  console.log(`   Serviço: ${data.service} v${data.version}`);
}

async function testLunarPhase() {
  const response = await fetch(`${LUNAR_COMPUTE_URL}/api/lunar-phase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: '2025-01-14T10:30:00Z',
      include_zodiac: true,
    }),
  });

  if (!response.ok) throw new Error(`Status ${response.status}`);

  const data = await response.json();
  if (!data.phase) throw new Error('Resposta sem phase');
  if (data.illumination === undefined) throw new Error('Resposta sem illumination');
  if (!data.zodiac_sign) throw new Error('Resposta sem zodiac_sign');

  console.log(`   Phase: ${data.phase}`);
  console.log(`   Illumination: ${Math.round(data.illumination * 100)}%`);
  console.log(`   Zodiac: ${data.zodiac_emoji} ${data.zodiac_sign}`);
}

async function testLunarBatch() {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date('2025-01-14');
    d.setDate(d.getDate() + i);
    return d.toISOString();
  });

  const response = await fetch(`${LUNAR_COMPUTE_URL}/api/lunar-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dates,
      include_zodiac: true,
    }),
  });

  if (!response.ok) throw new Error(`Status ${response.status}`);

  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Resposta não é array');
  if (data.length !== 30) throw new Error(`Esperava 30 itens, got ${data.length}`);

  console.log(`   Processadas ${data.length} datas em batch`);
}

async function testLunationsYear() {
  const response = await fetch(`${LUNAR_COMPUTE_URL}/api/lunations-year?year=2025`, {
    method: 'POST',
  });

  if (!response.ok) throw new Error(`Status ${response.status}`);

  const data = await response.json();
  if (!data.lunations) throw new Error('Resposta sem lunations');
  if (!Array.isArray(data.lunations)) throw new Error('Lunations não é array');

  console.log(`   Ano ${data.year}: ${data.count} lunações encontradas`);
  if (data.lunations.length > 0) {
    const first = data.lunations[0];
    console.log(`   Primeira: ${new Date(first.lunation_date).toLocaleDateString('pt-BR')} - ${first.zodiac_emoji} ${first.zodiac_sign}`);
  }
}

async function testViaNextAPI() {
  console.log('\n   Testando via API do Next.js...');
  
  const response = await fetch(`${API_ENDPOINT}/lunar-phase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: '2025-01-14T10:30:00Z',
      includeZodiac: true,
    }),
  });

  if (!response.ok) {
    console.warn(`   ⚠️  Next.js API retornou ${response.status}`);
    console.warn('   (Esperado se o app não está rodando em port 3000)');
    return;
  }

  const data = await response.json();
  if (!data.phase) throw new Error('Resposta sem phase');
  console.log(`   ✅ API adapter funciona!`);
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  🌙 Teste do Lunar Compute Service                 ║');
  console.log('╚════════════════════════════════════════════════════╝');

  console.log(`\n📍 Conectando a: ${LUNAR_COMPUTE_URL}`);

  await test('Health Check', testHealthCheck);
  await test('Lunar Phase (Simples)', testLunarPhase);
  await test('Lunar Batch (30 datas)', testLunarBatch);
  await test('Lunations Year (2025)', testLunationsYear);

  // Teste opcional da API do Next.js
  try {
    await testViaNextAPI();
  } catch (error) {
    console.error(`   ⚠️  Teste da API do Next.js falhou: ${error.message}`);
  }

  // Resumo
  console.log('\n' + '═'.repeat(54));
  console.log(`\n📊 Resumo dos Testes:`);
  console.log(`   ✅ Passaram: ${passed}`);
  console.log(`   ❌ Falharam: ${failed}`);
  console.log(`\n${failed === 0 ? '🎉 Todos os testes passaram!' : '⚠️ Alguns testes falharam'}`);
  console.log('\n' + '═'.repeat(54));

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('Erro ao rodar testes:', error);
  process.exit(1);
});
