#!/bin/bash

# 🔧 Script de Diagnóstico - Sincronização de Planeta
# Uso: ./scripts/diagnose-sync.sh

set -e

echo "🔍 Iniciando diagnóstico de sincronização..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
  local status=$1
  local message=$2
  
  if [ "$status" = "ok" ]; then
    echo -e "${GREEN}✅${NC} $message"
  elif [ "$status" = "warn" ]; then
    echo -e "${YELLOW}⚠️ ${NC} $message"
  elif [ "$status" = "error" ]; then
    echo -e "${RED}❌${NC} $message"
  elif [ "$status" = "info" ]; then
    echo -e "${BLUE}ℹ️ ${NC} $message"
  fi
}

# 1. Verificar Node e npm
echo "📦 Verificando dependências..."
echo "================================"

if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  print_status "ok" "Node.js: $NODE_VERSION"
else
  print_status "error" "Node.js não encontrado"
  exit 1
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  print_status "ok" "npm: $NPM_VERSION"
else
  print_status "error" "npm não encontrado"
  exit 1
fi

echo ""

# 2. Verificar arquivos essenciais
echo "📂 Verificando arquivos essenciais..."
echo "================================"

check_file() {
  local file=$1
  if [ -f "$file" ]; then
    print_status "ok" "$file encontrado"
  else
    print_status "error" "$file NÃO encontrado"
  fi
}

check_file ".env.local"
check_file "hooks/usePlanetState.ts"
check_file "hooks/usePlanetTodos.ts"
check_file "app/api/planet-state/route.ts"
check_file "app/api/planet-todos/route.ts"
check_file "app/layout.tsx"

echo ""

# 3. Verificar .env.local
echo "🔑 Verificando variáveis de ambiente..."
echo "================================"

if [ -f ".env.local" ]; then
  if grep -q "DATABASE_URL" .env.local; then
    print_status "ok" "DATABASE_URL configurado"
    # Não mostrar a senha, só confirmar que existe
    DB_HOST=$(grep "DATABASE_URL" .env.local | cut -d'@' -f2 | cut -d':' -f1)
    print_status "info" "Database host: $DB_HOST"
  else
    print_status "error" "DATABASE_URL não configurado em .env.local"
  fi
  
  if grep -q "AUTH_PASSWORD" .env.local; then
    print_status "ok" "AUTH_PASSWORD configurado"
  else
    print_status "warn" "AUTH_PASSWORD não configurado (pode usar padrão)"
  fi
else
  print_status "error" ".env.local não existe"
  print_status "info" "Copie .env.local.example para .env.local e configure"
fi

echo ""

# 4. Verificar build
echo "🔨 Verificando build..."
echo "================================"

if [ -d ".next" ]; then
  print_status "ok" "Build anterior encontrado (.next)"
else
  print_status "warn" "Sem build anterior (.next) - será gerado ao rodar dev"
fi

echo ""

# 5. Verificar hooks de sincronização
echo "🔄 Verificando hooks de sincronização..."
echo "================================"

if grep -q "SYNC_INTERVAL_MS = 10000" hooks/usePlanetState.ts; then
  print_status "ok" "usePlanetState.ts: Polling a cada 10 segundos"
else
  print_status "warn" "usePlanetState.ts: Intervalo diferente de 10s"
fi

if grep -q "credentials: 'include'" hooks/usePlanetState.ts; then
  print_status "ok" "usePlanetState.ts: credentials incluídas"
else
  print_status "error" "usePlanetState.ts: credentials NÃO incluídas"
fi

if grep -q "SYNC_INTERVAL_MS = 10000" hooks/usePlanetTodos.ts; then
  print_status "ok" "usePlanetTodos.ts: Polling a cada 10 segundos"
else
  print_status "warn" "usePlanetTodos.ts: Intervalo diferente de 10s"
fi

if grep -q "credentials: 'include'" hooks/usePlanetTodos.ts; then
  print_status "ok" "usePlanetTodos.ts: credentials incluídas"
else
  print_status "error" "usePlanetTodos.ts: credentials NÃO incluídas"
fi

echo ""

# 6. Verificar APIs
echo "🌐 Verificando endpoints de API..."
echo "================================"

if grep -q "validateToken" app/api/planet-state/route.ts; then
  print_status "ok" "planet-state/route.ts: Autenticação presente"
else
  print_status "warn" "planet-state/route.ts: Autenticação pode estar faltando"
fi

if grep -q "validateToken" app/api/planet-todos/route.ts; then
  print_status "ok" "planet-todos/route.ts: Autenticação presente"
else
  print_status "warn" "planet-todos/route.ts: Autenticação pode estar faltando"
fi

echo ""

# 7. Verificar Layout
echo "📄 Verificando app/layout.tsx..."
echo "================================"

if grep -q "AutoSyncLunar" app/layout.tsx; then
  print_status "ok" "AutoSyncLunar ativo"
else
  print_status "warn" "AutoSyncLunar não encontrado"
fi

if grep -q "GalaxySunsSync" app/layout.tsx; then
  print_status "ok" "GalaxySunsSync ativo"
else
  print_status "warn" "GalaxySunsSync não encontrado"
fi

echo ""

# 8. Resumo
echo "📊 Resumo..."
echo "================================"

READY=true

if [ ! -f ".env.local" ]; then
  print_status "error" "Configure .env.local antes de continuar"
  READY=false
fi

if grep -q "credentials: 'include'" hooks/usePlanetState.ts && \
   grep -q "credentials: 'include'" hooks/usePlanetTodos.ts && \
   grep -q "SYNC_INTERVAL_MS = 10000" hooks/usePlanetState.ts && \
   grep -q "SYNC_INTERVAL_MS = 10000" hooks/usePlanetTodos.ts; then
  print_status "ok" "Hooks de sincronização configurados corretamente"
else
  print_status "error" "Hooks de sincronização com problemas"
  READY=false
fi

echo ""

if [ "$READY" = true ]; then
  print_status "ok" "Tudo pronto! Execute: npm run dev"
  echo ""
  echo "📝 Próximas passos:"
  echo "  1. npm run dev"
  echo "  2. Abra http://localhost:3000/cosmos/planeta em 2 abas"
  echo "  3. Faça login em ambas"
  echo "  4. F12 → Network → Filtre 'planet-state'"
  echo "  5. Mude algo na Aba A, aguarde 10s, veja em Aba B"
  echo ""
  echo "📖 Guia completo: doc/TROUBLESHOOTING_SYNC.md"
else
  print_status "error" "Problemas encontrados. Veja acima para resolver."
  exit 1
fi
