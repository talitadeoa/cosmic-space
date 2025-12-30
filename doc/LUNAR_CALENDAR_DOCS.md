# Calendário Lunar - Documentação Completa

## 📋 Visão Geral

Componente React de calendário lunar minimalista com layout astronômico 2 colunas (hero lunar + grid mensal). Design dark com alto contraste, acessibilidade completa e animações suaves.

## 🏗️ Arquitetura de Componentes

```
lunar-calendar/
├── index.ts                          (exportações públicas)
├── types.ts                          (interfaces TypeScript)
├── utils.ts                          (utilitários e helpers)
├── LunarCalendarWidget.tsx          (componente principal)
├── LunarHero.tsx                    (visualização lunar à esquerda)
├── CalendarGrid.tsx                 (grid mensal à direita)
├── NavigationControls.tsx           (navegação de meses)
├── MoonPhaseIcon.tsx                (ícone SVG da fase lunar)
└── styles/
    ├── LunarCalendarWidget.module.css
    ├── LunarHero.module.css
    ├── CalendarGrid.module.css
    ├── NavigationControls.module.css
    └── MoonPhaseIcon.module.css
```

## 📱 Layout

### Desktop (>1024px)

- **Grid 2 colunas**: 1fr 1.2fr (hero maior na esquerda)
- Hero: 200x200px círculo lunar com dados
- Grid: 7 colunas (dias semana) × N linhas

### Tablet (768-1024px)

- **Grid 1 coluna**: hero e calendário empilhados
- Hero reduzido para 150x150px

### Mobile (<768px)

- Altura dos dias: min-height 44px (acessibilidade)
- Fontes responsivas com `clamp()`

## 🎨 Paleta de Cores

```
Fundos:
  - Primário: #0a0e14 (muito escuro)
  - Secundário: #0f1419, #0d1117
  - Card: rgba(20, 30, 45, 0.4) com backdrop-filter blur(10px)

Texto:
  - Primário: #e8e8ff (branco com leve azul)
  - Secundário: #cbd5e1 (cinza claro)
  - Terciário: #94a3b8 (cinza médio)
  - Disabled: #64748b (cinza escuro)

Acentos:
  - Destaque: rgba(100, 116, 139, ...) (cinza azulado)
  - Hoje: rgba(100, 116, 139, 0.2) fundo + border
  - Seleção: rgba(148, 163, 184, 0.25) pill

Lua:
  - Cheia: #f5f5dc (creme)
  - Escura: #2a3a4a (cinza azulado escuro)
  - Borda: #64748b
```

## 🎯 Tokens de Design

### Spacing

```css
rem base-line: 16px
sm:  0.5rem  (8px)
md:  1rem    (16px)
lg:  1.5rem  (24px)
xl:  2rem    (32px)
```

### Border Radius

```css
sm:  0.5rem   (8px)  - botões pequenos
md:  0.75rem  (12px) - cards, inputs
lg:  1.5rem   (24px) - hero widget
xl:  2rem     (32px) - luna circle
```

### Typography

```css
h1/title: clamp(1.5rem, 4vw, 2rem) weight: 400
h2/month: clamp(1rem, 3vw, 1.25rem) weight: 300
body:     0.875-0.95rem weight: 300-400
label:    0.75-0.8rem weight: 500
```

### Shadows

```css
sm:    0 4px 6px rgba(0, 0, 0, 0.1)
md:    0 8px 16px rgba(0, 0, 0, 0.15)
lg:    0 8px 32px rgba(0, 0, 0, 0.3)
glow:  0 0 40px rgba(100, 116, 139, 0.2)
```

## 📦 Props e Interfaces

### LunarCalendarProps

```typescript
interface LunarCalendarProps {
  month: number; // 0-11
  year: number;
  selectedDate?: Date; // padrão: hoje
  onSelectDate?: (date: Date) => void;
  lunarDataByDate: LunarDataByDate; // dados lunares por data
  onMonthChange?: (month: number, year: number) => void;
  locale?: 'pt-BR' | 'en-US';
  ariaLabel?: string;
}
```

### LunarData

```typescript
interface LunarData {
  phase: MoonPhase; // enum com 8 fases
  illumination: number; // 0-100%
  phaseName: string; // "Lua Cheia", "Crescente", etc
  daysInPhase?: number;
  nextPhaseDate?: Date;
}
```

### LunarDataByDate

```typescript
// Chave: "YYYY-MM-DD"
{
  "2025-12-28": {
    phase: "full",
    illumination: 95.5,
    phaseName: "Lua Cheia",
    daysInPhase: 3
  },
  "2025-12-29": { ... }
}
```

## 🌙 Fases Lunares (MoonPhase enum)

```typescript
NEW = 'new'; // 0% iluminação
WAXING_CRESCENT = 'waxing_crescent'; // 1-49%
FIRST_QUARTER = 'first_quarter'; // ~50%
WAXING_GIBBOUS = 'waxing_gibbous'; // 51-99%
FULL = 'full'; // 100%
WANING_GIBBOUS = 'waning_gibbous'; // 99-51%
LAST_QUARTER = 'last_quarter'; // ~50%
WANING_CRESCENT = 'waning_crescent'; // 49-1%
```

## 🎬 Animações

### moonGlow (hero circle)

- Duração: 6s
- Tipo: ease-in-out infinito
- Efeito: variação sutil de sombra (glow)

### twinkle (background stars)

- Duração: 8s
- Tipo: ease-in-out infinito
- Efeito: piscada muito sutil (0.05 → 0.08)

### float (decorative stars)

- Duração: 6s
- Tipo: ease-in-out infinito
- Efeito: flutuação vertical (-10px)

### Transições gerais

- All: 0.2s ease (botões, hover states)
- Scale: 0.98 ao clicar (feedback)

## ♿ Acessibilidade

### Aria Labels

```tsx
// Cada dia tem label descritivo
aria-label="segunda, 28 de dezembro de 2025, Lua Cheia, 95%, selecionado"

// Grid e seções semânticas
<div role="grid" aria-label="Calendário mensal">
<div role="gridcell">
<button aria-pressed={isSelected} tabIndex={isSelected ? 0 : -1}>
```

### Teclado

- Tab: navegação entre dias
- Enter/Space: selecionar dia
- Selected day: tabIndex 0, outros: -1

### Semântica HTML

```tsx
<main> (widget principal)
<h1>, <h2>, <h3> (hierarquia de títulos)
<button> (dias, controles)
role="region" (seções nomeadas)
role="toolbar" (controles de navegação)
role="img" (ícones SVG)
```

### Contraste

- Texto primário: #e8e8ff em #0a0e14 → ratio ~12:1 ✅
- Dia selecionado: destacado com pill + borda
- Foco visível: outline 2px #64b5f6

## 🛠️ Como Usar

### Instalação

```bash
# Os componentes estão em:
/components/lunar-calendar/

# Importar:
import { LunarCalendarWidget, generateMockLunarData } from '@/components/lunar-calendar';
```

### Exemplo Básico

```tsx
import { useState } from 'react';
import { LunarCalendarWidget, generateMockLunarData } from '@/components/lunar-calendar';

export default function MyCalendar() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // Dados lunares (simulados ou de API)
  const lunarData = generateMockLunarData(year, month);

  return (
    <LunarCalendarWidget
      month={month}
      year={year}
      selectedDate={selectedDate}
      onSelectDate={setSelectedDate}
      lunarDataByDate={lunarData}
      onMonthChange={(m, y) => {
        setMonth(m);
        setYear(y);
      }}
      locale="pt-BR"
    />
  );
}
```

### Com Dados Reais de API

```tsx
import { useEffect, useState } from 'react';
import { LunarCalendarWidget } from '@/components/lunar-calendar';
import type { LunarDataByDate } from '@/components/lunar-calendar';

export default function Calendar() {
  const [lunarData, setLunarData] = useState<LunarDataByDate>({});
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Fetch de /api/lunar-data?month=12&year=2025
    fetch(`/api/lunar-data?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) => setLunarData(data.byDate));
  }, [month, year]);

  return (
    <LunarCalendarWidget
      month={month}
      year={year}
      lunarDataByDate={lunarData}
      onMonthChange={(m, y) => {
        setMonth(m);
        setYear(y);
      }}
    />
  );
}
```

## 📡 Exemplo de Payload API

```json
{
  "month": 12,
  "year": 2025,
  "byDate": {
    "2025-12-01": {
      "phase": "waning_gibbous",
      "illumination": 87.3,
      "phaseName": "Gibosa Minguante",
      "daysInPhase": 2,
      "nextPhaseDate": "2025-12-04"
    },
    "2025-12-04": {
      "phase": "last_quarter",
      "illumination": 50.2,
      "phaseName": "Quarto Minguante",
      "daysInPhase": 1,
      "nextPhaseDate": "2025-12-11"
    },
    "2025-12-11": {
      "phase": "waning_crescent",
      "illumination": 12.5,
      "phaseName": "Minguante",
      "daysInPhase": 3,
      "nextPhaseDate": "2025-12-14"
    },
    "2025-12-14": {
      "phase": "new",
      "illumination": 0.1,
      "phaseName": "Lua Nova",
      "daysInPhase": 2,
      "nextPhaseDate": "2025-12-22"
    },
    "2025-12-22": {
      "phase": "waxing_crescent",
      "illumination": 35.7,
      "phaseName": "Crescente",
      "daysInPhase": 5,
      "nextPhaseDate": "2025-12-28"
    },
    "2025-12-28": {
      "phase": "full",
      "illumination": 99.8,
      "phaseName": "Lua Cheia",
      "daysInPhase": 1,
      "nextPhaseDate": "2026-01-04"
    }
  }
}
```

## 🎨 Renderização de Fases Lunares

O componente `MoonPhaseIcon` renderiza a lua em **SVG nativo** com:

### Lua Nova (0%)

- Círculo muito escuro com borda sutil
- Opacidade 0.5

### Lua Cheia (100%)

- Círculo creme (#f5f5dc) com borda dourada
- Sombra brilhante

### Fases Intermediárias

- **Crescente**: área iluminada no lado direito cresce
- **Minguante**: área iluminada no lado esquerdo diminui
- Usa `<clipPath>` SVG para recorte suave

### Tamanhos

- **small**: 16x16px (calendário grid)
- **medium**: 24x24px (tooltips)
- **large**: 48x48px (hero section)

### Variantes

- **icon**: renderização completa com detalhes
- **circle**: versão simplificada (opacidade)

## 🔄 Fluxo de Atualização

```
Seleção de Data
↓
onSelectDate(date) callback
↓
Estado local atualiza selectedDate
↓
effetivoSelectedDate recompila
↓
selectedLunarData busca dados
↓
LunarHero re-renderiza com nova fase
↓
CalendarGrid marca novo dia como selected (pill)
```

## 🎯 Estados Visuais dos Dias

| Estado   | Visual                | Notas                |
| -------- | --------------------- | -------------------- |
| Normal   | Texto branco          | Dias do mês          |
| Today    | Fundo cinza + borda   | Apenas o dia de hoje |
| Selected | Pill cinza + destaque | Dia clicado          |
| Hover    | Fundo cinza claro     | Desktop              |
| Disabled | Opacidade 30%         | Dias de outros meses |
| Weekend  | Cor cinza (CBD5E1)    | Sábado e domingo     |

## 🚀 Performance

- **CSS Modules**: zero conflito de estilos
- **React.memo**: subcomponentes otimizados (opcional)
- **useMemo**: grid gerado apenas se dados mudarem
- **useCallback**: callbacks estáveis para evitar re-renders
- SVG nativo: sem canvas ou imagens externas

## 📝 Utilitários (utils.ts)

```typescript
// Geração de grid
generateCalendarGrid(year, month) → CalendarDay[][]

// Enriquecimento com dados lunares
enrichCalendarWithLunarData(weeks, lunarData, selectedDate) → CalendarDay[][]

// Formatação
formatDateKey(date) → "2025-12-28"
formatDate(date, locale) → "domingo, dez. 28, 2025"
getMonthName(month, locale) → "dezembro"
getWeekDayInitials(locale) → ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

// Checagens
isToday(date) → boolean
isSameDay(date1, date2) → boolean
isWeekend(date) → boolean

// Mock data
generateMockLunarData(year, month) → LunarDataByDate
```

## 🔧 Customização

### Trocar Cor de Fundo

Edite `LunarCalendarWidget.module.css`:

```css
.lunarCalendarWidget {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}
```

### Mudar Tamanho da Lua

Em `LunarHero.module.css`:

```css
.moonCircle {
  width: 250px; /* era 200px */
  height: 250px;
}
```

### Adicionar Mais Informações Lunares

Expanda `LunarData` interface em `types.ts` e renderize em `LunarHero.tsx`.

### Integração com Banco de Dados

Substitua `generateMockLunarData` por uma chamada a `/api/lunar-data`.

## 📚 Estrutura de Pastas Recomendada

```
app/
  calendarioc/
    page.tsx          (página da rota)
    layout.tsx        (layout específico, opcional)

components/
  lunar-calendar/
    index.ts
    types.ts
    utils.ts
    LunarCalendarWidget.tsx
    LunarHero.tsx
    CalendarGrid.tsx
    NavigationControls.tsx
    MoonPhaseIcon.tsx
    styles/
      *.module.css
```

## 🧪 Testes (Recomendações)

```typescript
// Teste de geração de grid
describe('generateCalendarGrid', () => {
  it('deve gerar 5-6 semanas por mês');
  it('deve incluir dias do mês anterior/próximo');
  it('offset correto baseado no dia da semana');
});

// Teste de callback
describe('LunarCalendarWidget', () => {
  it('deve chamar onSelectDate ao clicar em dia');
  it('deve chamar onMonthChange ao navegar meses');
});

// Teste de acessibilidade
describe('Accessibility', () => {
  it('todos os dias têm aria-label');
  it('foco visível é claro');
  it('navegação por teclado funciona');
});
```

## 📱 Checklist de Responsividade

- [x] Desktop (>1024px): 2 colunas
- [x] Tablet (768-1024px): 1 coluna, hero reduzido
- [x] Mobile (<768px): Stack vertical, botões 44px min
- [x] Fontes com clamp()
- [x] Gaps e padding adaptáveis
- [x] Touch-friendly (tap targets)

## 🎯 Sugestões Futuras

1. **Drag-to-select**: arrastar entre dias para selecionar intervalo
2. **Eventos**: adicionar pontos/badges para eventos lunares (eclipses, etc)
3. **Modo Light**: toggle light/dark
4. **Notificações**: lembrete de próxima lua cheia
5. **Exportar**: calendário em PDF/iCal
6. **Multi-ano**: visualização de múltiplos anos
7. **Histórico**: gráfico de iluminação ao longo do tempo

---

**Versão**: 1.0.0  
**Última atualização**: 28/12/2025  
**Status**: ✅ Pronto para produção
