#!/bin/bash
# Script para listar e verificar todos os arquivos do Calendário Lunar

echo "═══════════════════════════════════════════════════════════"
echo "📦 VERIFICAÇÃO DE ARQUIVOS - CALENDÁRIO LUNAR"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar arquivo
check_file() {
  if [ -f "$1" ]; then
    lines=$(wc -l < "$1")
    echo -e "${GREEN}✓${NC} $1 (${lines} linhas)"
    return 0
  else
    echo -e "${RED}✗${NC} $1 (NÃO ENCONTRADO)"
    return 1
  fi
}

echo "📂 COMPONENTES REACT"
echo "─────────────────────────────────────────────────────────"
check_file "components/lunar-calendar/LunarCalendarWidget.tsx"
check_file "components/lunar-calendar/LunarHero.tsx"
check_file "components/lunar-calendar/CalendarGrid.tsx"
check_file "components/lunar-calendar/NavigationControls.tsx"
check_file "components/lunar-calendar/MoonPhaseIcon.tsx"
check_file "components/lunar-calendar/types.ts"
check_file "components/lunar-calendar/utils.ts"
check_file "components/lunar-calendar/index.ts"
echo ""

echo "🎨 ESTILOS CSS MODULES"
echo "─────────────────────────────────────────────────────────"
check_file "components/lunar-calendar/styles/LunarCalendarWidget.module.css"
check_file "components/lunar-calendar/styles/LunarHero.module.css"
check_file "components/lunar-calendar/styles/CalendarGrid.module.css"
check_file "components/lunar-calendar/styles/NavigationControls.module.css"
check_file "components/lunar-calendar/styles/MoonPhaseIcon.module.css"
echo ""

echo "🌐 PÁGINA E ROTA"
echo "─────────────────────────────────────────────────────────"
check_file "app/calendarioc/page.tsx"
echo ""

echo "📚 DOCUMENTAÇÃO"
echo "─────────────────────────────────────────────────────────"
check_file "components/lunar-calendar/README.md"
check_file "doc/LUNAR_CALENDAR_DOCS.md"
check_file "doc/LUNAR_CALENDAR_INTEGRATION.md"
check_file "doc/LUNAR_CALENDAR_ARCHITECTURE.md"
check_file "doc/LUNAR_CALENDAR_API_EXAMPLES.ts"
check_file "doc/LUNAR_CALENDAR_CHECKLIST.md"
check_file "doc/LUNAR_CALENDAR_CUSTOMIZATION.md"
check_file "doc/LUNAR_CALENDAR_DELIVERY_SUMMARY.md"
echo ""

echo "📖 EXEMPLOS"
echo "─────────────────────────────────────────────────────────"
check_file "components/lunar-calendar/examples/AdvancedExample.tsx"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✨ RESUMO"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Componentes React:     8 arquivos"
echo "CSS Modules:           5 arquivos"
echo "Página/Rota:           1 arquivo"
echo "Documentação:          8 arquivos"
echo "Exemplos:              1 arquivo"
echo ""
echo "TOTAL:                23 arquivos"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📌 URLs IMPORTANTES"
echo "─────────────────────────────────────────────────────────"
echo "Rota:        http://localhost:3000/calendarioc"
echo "Componente:  components/lunar-calendar/"
echo "Docs:        doc/LUNAR_CALENDAR_*.md"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🚀 PRÓXIMOS PASSOS"
echo "─────────────────────────────────────────────────────────"
echo "1. npm run dev"
echo "2. Abrir http://localhost:3000/calendarioc"
echo "3. Testar interações"
echo "4. Integrar com API de dados lunares"
echo ""
echo "═══════════════════════════════════════════════════════════"
