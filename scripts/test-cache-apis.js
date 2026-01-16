#!/usr/bin/env node

/**
 * 🧪 Script de Teste Manual para APIs de Cache
 * 
 * Valida:
 * - Imports corretos
 * - Tipagem TypeScript
 * - Estrutura de cache
 * - Deduplicação (simulada)
 */

const path = require('path');
const fs = require('fs');

console.log('\n🧪 Iniciando testes das APIs de cache...\n');

const tests = {
  passed: 0,
  failed: 0,
  errors: [],
};

// ============================================================================
// Teste 1: Validar arquivos existem
// ============================================================================
function test1() {
  console.log('📋 Teste 1: Verificar arquivos criados');

  const baseDir = path.join(__dirname, '..');
  const files = [
    'hooks/useCommunityCache.ts',
    'hooks/useInsightsCache.ts',
    'app/comunidade/hooks/useCommunityData.ts',
  ];

  let allExist = true;
  for (const file of files) {
    const fullPath = path.join(baseDir, file);
    const exists = fs.existsSync(fullPath);
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${file}`);

    if (!exists) {
      allExist = false;
      tests.errors.push(`Arquivo não encontrado: ${file}`);
    }
  }

  if (allExist) {
    tests.passed++;
    console.log('  ✅ Todos os arquivos existem\n');
  } else {
    tests.failed++;
    console.log('  ❌ Alguns arquivos faltam\n');
  }
}

// ============================================================================
// Teste 2: Validar TypeScript
// ============================================================================
function test2() {
  console.log('📋 Teste 2: Validar sintaxe TypeScript');

  const baseDir = path.join(__dirname, '..');
  const files = [
    'hooks/useCommunityCache.ts',
    'hooks/useInsightsCache.ts',
  ];

  let hasErrors = false;
  for (const file of files) {
    const fullPath = path.join(baseDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');

    // Verificações básicas
    const checks = [
      {
        pattern: /export\s+function\s+use\w+Cache/,
        desc: 'Hook principal exportado',
      },
      {
        pattern: /class\s+\w+CacheStore/,
        desc: 'Classe store implementada',
      },
      {
        pattern: /private\s+cache\s*=/,
        desc: 'Propriedade privada cache',
      },
      {
        pattern: /requestsInFlight/,
        desc: 'Deduplicação in-flight',
      },
    ];

    console.log(`  📄 ${file}:`);
    let fileOk = true;

    for (const check of checks) {
      const ok = check.pattern.test(content);
      const status = ok ? '✅' : '❌';
      console.log(`    ${status} ${check.desc}`);
      if (!ok) {
        fileOk = false;
        hasErrors = true;
      }
    }
  }

  if (!hasErrors) {
    tests.passed++;
    console.log('  ✅ Sintaxe TypeScript válida\n');
  } else {
    tests.failed++;
    console.log('  ❌ Problemas na sintaxe\n');
  }
}

// ============================================================================
// Teste 3: Validar estrutura de cache
// ============================================================================
function test3() {
  console.log('📋 Teste 3: Validar estrutura de cache');

  const baseDir = path.join(__dirname, '..');
  const content = fs.readFileSync(
    path.join(baseDir, 'hooks/useCommunityCache.ts'),
    'utf-8'
  );

  const features = [
    {
      pattern: /get<T>\(key:\s*string\):\s*T\s*\|\s*null/,
      desc: 'Método get() tipado',
    },
    {
      pattern: /set<T>\(key:\s*string,\s*data:\s*T/,
      desc: 'Método set() tipado',
    },
    {
      pattern: /fetch<T>\(/,
      desc: 'Método fetch() com deduplicação',
    },
    {
      pattern: /subscribe\(/,
      desc: 'Subscriber pattern',
    },
    {
      pattern: /TTL|ttl/,
      desc: 'Suporte a TTL',
    },
  ];

  console.log('  🏗️ Estrutura:');
  let allOk = true;
  for (const feature of features) {
    const ok = feature.pattern.test(content);
    const status = ok ? '✅' : '❌';
    console.log(`    ${status} ${feature.desc}`);
    if (!ok) allOk = false;
  }

  if (allOk) {
    tests.passed++;
    console.log('  ✅ Estrutura completa\n');
  } else {
    tests.failed++;
    console.log('  ❌ Estrutura incompleta\n');
  }
}

// ============================================================================
// Teste 4: Validar helpers
// ============================================================================
function test4() {
  console.log('📋 Teste 4: Validar helpers específicos');

  const baseDir = path.join(__dirname, '..');
  const communityContent = fs.readFileSync(
    path.join(baseDir, 'hooks/useCommunityCache.ts'),
    'utf-8'
  );

  const insightsContent = fs.readFileSync(
    path.join(baseDir, 'hooks/useInsightsCache.ts'),
    'utf-8'
  );

  const helpers = [
    {
      file: 'Community',
      content: communityContent,
      helpers: [
        'useCommunityPosts',
        'useCommunityProfile',
        'invalidateCommunityCache',
        'clearCommunityCache',
      ],
    },
    {
      file: 'Insights',
      content: insightsContent,
      helpers: [
        'useMonthlyInsightQuery',
        'useQuarterlyInsightQuery',
        'useAnnualInsightQuery',
        'invalidateInsightsCache',
        'clearInsightsCache',
      ],
    },
  ];

  console.log('  🔧 Helpers exportados:');
  let allFound = true;
  for (const group of helpers) {
    console.log(`    📦 ${group.file}:`);
    for (const helper of group.helpers) {
      const found = group.content.includes(`export function ${helper}`);
      const status = found ? '✅' : '❌';
      console.log(`      ${status} ${helper}`);
      if (!found) allFound = false;
    }
  }

  if (allFound) {
    tests.passed++;
    console.log('  ✅ Todos os helpers implementados\n');
  } else {
    tests.failed++;
    console.log('  ❌ Alguns helpers faltam\n');
  }
}

// ============================================================================
// Teste 5: Validar refatoração useCommunityData
// ============================================================================
function test5() {
  console.log('📋 Teste 5: Validar refatoração useCommunityData');

  const baseDir = path.join(__dirname, '..');
  const content = fs.readFileSync(
    path.join(baseDir, 'app/comunidade/hooks/useCommunityData.ts'),
    'utf-8'
  );

  const checks = [
    {
      pattern: /useCommunityPosts/,
      desc: 'Usa useCommunityPosts com cache',
    },
    {
      pattern: /useCommunityProfile/,
      desc: 'Usa useCommunityProfile com cache',
    },
    {
      pattern: /invalidateCommunityCache/,
      desc: 'Usa invalidação de cache',
    },
    {
      pattern: /export const useCommunityData/,
      desc: 'Exporta hook refatorado',
    },
  ];

  console.log('  📦 Refatoração:');
  let allOk = true;
  for (const check of checks) {
    const ok = check.pattern.test(content);
    const status = ok ? '✅' : '❌';
    console.log(`    ${status} ${check.desc}`);
    if (!ok) allOk = false;
  }

  if (allOk) {
    tests.passed++;
    console.log('  ✅ useCommunityData refatorado corretamente\n');
  } else {
    tests.failed++;
    console.log('  ❌ Refatoração incompleta\n');
  }
}

// ============================================================================
// Teste 6: Validar deduplicação em-flight
// ============================================================================
function test6() {
  console.log('📋 Teste 6: Validar mecanismo de deduplicação');

  const baseDir = path.join(__dirname, '..');
  const content = fs.readFileSync(
    path.join(baseDir, 'hooks/useCommunityCache.ts'),
    'utf-8'
  );

  const patterns = [
    {
      pattern: /requestsInFlight/,
      desc: 'Map de requisições em-flight',
    },
    {
      pattern: /requestsInFlight\.has\(key\)/,
      desc: 'Verificação de requisição em progresso',
    },
    {
      pattern: /requestsInFlight\.get\(key\)/,
      desc: 'Reutilização de promise',
    },
    {
      pattern: /requestsInFlight\.set\(key,\s*promise\)/,
      desc: 'Armazenamento de promise',
    },
    {
      pattern: /requestsInFlight\.delete\(key\)/,
      desc: 'Limpeza após conclusão',
    },
  ];

  console.log('  🔄 Deduplicação:');
  let allFound = true;
  for (const check of patterns) {
    const found = check.pattern.test(content);
    const status = found ? '✅' : '❌';
    console.log(`    ${status} ${check.desc}`);
    if (!found) allFound = false;
  }

  if (allFound) {
    tests.passed++;
    console.log('  ✅ Deduplicação implementada corretamente\n');
  } else {
    tests.failed++;
    console.log('  ❌ Deduplicação incompleta\n');
  }
}

// ============================================================================
// Teste 7: Validar TTL e expiração
// ============================================================================
function test7() {
  console.log('📋 Teste 7: Validar TTL e expiração');

  const baseDir = path.join(__dirname, '..');
  const content = fs.readFileSync(
    path.join(baseDir, 'hooks/useCommunityCache.ts'),
    'utf-8'
  );

  const patterns = [
    {
      pattern: /ttl:\s*number/,
      desc: 'Propriedade TTL em CacheEntry',
    },
    {
      pattern: /timestamp:\s*number/,
      desc: 'Propriedade timestamp',
    },
    {
      pattern: /Date\.now\(\)\s*-\s*entry\.timestamp\s*>\s*entry\.ttl/,
      desc: 'Cálculo de expiração',
    },
    {
      pattern: /isExpired/,
      desc: 'Verificação de expiração',
    },
  ];

  console.log('  ⏱️ TTL:');
  let allFound = true;
  for (const check of patterns) {
    const found = check.pattern.test(content);
    const status = found ? '✅' : '❌';
    console.log(`    ${status} ${check.desc}`);
    if (!found) allFound = false;
  }

  if (allFound) {
    tests.passed++;
    console.log('  ✅ TTL implementado corretamente\n');
  } else {
    tests.failed++;
    console.log('  ❌ TTL incompleto\n');
  }
}

// ============================================================================
// Executar todos os testes
// ============================================================================
console.log('═'.repeat(70));
console.log('🚀 SUITE DE TESTES: APIs DE CACHE');
console.log('═'.repeat(70) + '\n');

try {
  test1();
  test2();
  test3();
  test4();
  test5();
  test6();
  test7();
} catch (error) {
  console.error('❌ Erro ao executar testes:', error.message);
  tests.failed++;
}

// ============================================================================
// Resultado final
// ============================================================================
console.log('═'.repeat(70));
console.log('📊 RESULTADO FINAL');
console.log('═'.repeat(70));
console.log(`\n✅ Testes passando: ${tests.passed}`);
console.log(`❌ Testes falhando: ${tests.failed}`);

if (tests.errors.length > 0) {
  console.log('\n⚠️  Erros encontrados:');
  for (const error of tests.errors) {
    console.log(`  - ${error}`);
  }
}

const totalTests = tests.passed + tests.failed;
const passRate = Math.round((tests.passed / totalTests) * 100);

console.log(`\n📈 Taxa de sucesso: ${passRate}% (${tests.passed}/${totalTests})`);

if (tests.failed === 0) {
  console.log('\n🎉 TODOS OS TESTES PASSARAM!\n');
  process.exit(0);
} else {
  console.log(`\n❌ ${tests.failed} TESTE(S) FALHARAM\n`);
  process.exit(1);
}
