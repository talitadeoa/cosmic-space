# 🏗️ Proposta de Arquitetura - Cosmic Space

## Índice
1. [Análise dos Problemas Atuais](#análise-dos-problemas-atuais)
2. [Nova Estrutura de Pastas](#nova-estrutura-de-pastas)
3. [Convenções de Nome](#convenções-de-nome)
4. [Regras de Boundary (Domínios)](#regras-de-boundary)
5. [Resumo: O que vai aonde](#resumo-o-que-vai-aonde)
6. [Exemplo Prático: Refatoração de um Domínio](#exemplo-prático-refatoração-de-um-domínio)
7. [Guia de Importações](#guia-de-importações)
8. [Plano de Migração](#plano-de-migração)

---

## Análise dos Problemas Atuais

### 🔴 Problemas Identificados

| Problema | Impacto | Exemplo |
|----------|--------|---------|
| **Card.tsx duplicado** | Manutenção difícil, inconsistência | `components/shared/cosmos/Card.tsx` vs `app/cosmos/components/Card.tsx` |
| **Types espalhados** | Difícil encontrar tipos, duplicação | Types em `types/`, `app/cosmos/types/`, `app/cosmos/utils/` |
| **Lib vs Utils sem critério** | Confusão na organização | `lib/lunar-cycle-utils.ts`, `app/cosmos/utils/moonPhases.ts` |
| **Rotas sem padrão claro** | Difícil entender a estrutura | Rotas espalhadas em `app/`, `app/cosmos/`, `app/comunidade/` |
| **Imports relativos longos** | Código ilegível | `import { X } from '../../../lib/utils/validators'` |
| **Ownership difuso** | Responsabilidades não claras | Quem é responsável por domínio lunar? |

### 📊 Estrutura Atual (Caótica)
```
components/
├── shared/          ← Compartilhado, mas...
│   └── cosmos/      ← Por que cosmos aqui?
│       └── Card.tsx ← Duplicado!
├── home/
├── timeline/
├── auth/
└── ...

app/
├── cosmos/          ← Feature completa aqui também?
│   ├── components/  ← Card.tsx aqui também!
│   ├── types/       ← Types locais
│   ├── utils/       ← Utils específicas
│   └── hooks/       ← Hooks locais

lib/
├── lunar-cycle-utils.ts    ← Utils lunar
├── moon-calculations.ts    ← Cálculos lunar
├── astro.ts               ← Astro utils
└── ...                    ← Sem organização clara

types/
├── moon.ts          ← Moon types
├── timeline.ts      ← Timeline types
└── ...              ← Sem relação entre domínios
```

---

## Nova Estrutura de Pastas

### Princípios

✅ **Organização por Domínio (Domain-Driven Design)**
- Cada domínio é auto-contido
- Conhecimentos compartilhados em folders centrais

✅ **Ownership Claro**
- Cada pasta tem um propósito bem definido
- Facilita delegação de responsabilidades

✅ **Imports Previsíveis**
- Rotas de import bem definidas
- Menos `../../../` no código

✅ **Escalabilidade**
- Fácil adicionar novos domínios
- Fácil remover ou refatorar existentes

### Árvore Completa Proposta

```
cosmic-space/
├── app/
│   ├── (root)/                 # Layout raiz
│   ├── api/                    # Route handlers (API)
│   ├── landing/                # Página pública
│   │
│   ├── [domains]/              # Domínios principais (features)
│   ├── cosmos/                 # Feature: Cosmos (Sistema Solar)
│   ├── comunidade/             # Feature: Comunidade
│   ├── timeline/               # Feature: Timeline de Insights
│   ├── perfil/                 # Feature: Perfil de Usuário
│   │
│   ├── layout.tsx              # Layout raiz
│   ├── page.tsx                # Home page
│   └── globals.css
│
├── domains/                    # 📦 DOMÍNIOS CENTRAIS (organizados por negócio)
│   │
│   ├── astro/                  # Domínio: Astrologia
│   │   ├── components/         # Componentes visuais (Card, MoonPhase, etc)
│   │   ├── hooks/              # useAstroCycle, useSignEmoji
│   │   ├── services/           # Funções de negócio (calc, fetch, transform)
│   │   ├── types/              # Tipos específicos (MoonPhase, SignType)
│   │   ├── constants.ts        # Constantes (SIGNS, PHASES)
│   │   ├── index.ts            # Barrel export
│   │   └── README.md           # Documentação do domínio
│   │
│   ├── lunar-cycle/            # Domínio: Ciclo Lunar
│   │   ├── components/         # LunarCalendar, LunarTimeline
│   │   ├── hooks/              # useLunarCycle, useLunations
│   │   ├── services/           # Cálculos lunares
│   │   ├── types/              # LunationData, MoonEvent
│   │   ├── constants.ts
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── todo/                   # Domínio: Tarefas & Ilhas
│   │   ├── components/         # TodoInput, TodoItem, IslandList
│   │   ├── hooks/              # usePlanetTodos, useFilteredTodos
│   │   ├── services/           # CRUD, sync, storage
│   │   ├── types/              # TodoItem, IslandId, SavedTodo
│   │   ├── utils/              # Helpers (validators, formatters)
│   │   ├── constants.ts        # ISLAND_IDS, TODO_STATUS
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── insights/               # Domínio: Insights (Mensal, Trimestral, Anual)
│   │   ├── components/         # InsightCard, InsightDisplay
│   │   ├── hooks/              # useMonthlyInsights, useQuarterlyInsights
│   │   ├── services/           # Geração de insights
│   │   ├── types/              # InsightData, InsightType
│   │   ├── constants.ts
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── community/              # Domínio: Comunidade
│   │   ├── components/         # PostCard, StreamCard, FeaturedCard
│   │   ├── hooks/              # useCommunityPosts
│   │   ├── services/           # Fetch posts, comments
│   │   ├── types/              # CommunityPost, Comment
│   │   ├── constants.ts
│   │   ├── index.ts
│   │   └── README.md
│   │
│   └── auth/                   # Domínio: Autenticação
│       ├── components/         # AuthFlow, LoginForm
│       ├── hooks/              # useAuth, useAuthChatFlow
│       ├── services/           # Token management, validation
│       ├── types/              # AuthToken, User
│       ├── constants.ts
│       ├── index.ts
│       └── README.md
│
├── shared/                     # 🎁 COMPARTILHADO (infraestrutura comum)
│   │
│   ├── ui/                     # Componentes UI genéricos (reutilizáveis)
│   │   ├── primitives/         # Botões, inputs, cards básicos
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx        # ✅ UMA única Card reutilizável
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layouts/            # Layouts genéricos
│   │   │   ├── PageLayout.tsx
│   │   │   ├── SidebarLayout.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── feedback/           # Feedback visual
│   │   │   ├── Loading.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── hooks/                  # Hooks genéricos
│   │   ├── useAsync.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePagination.ts
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   └── index.ts
│   │
│   ├── utils/                  # Utilitários genéricos
│   │   ├── string.ts           # trim, capitalize, slugify
│   │   ├── array.ts            # flatten, uniq, chunk
│   │   ├── date.ts             # format, parse, diff
│   │   ├── validators.ts       # email, phone, url
│   │   ├── formatters.ts       # Formatadores gerais
│   │   ├── errors.ts           # Error handling
│   │   └── index.ts
│   │
│   ├── api/                    # API client genérico
│   │   ├── client.ts           # HTTP client base
│   │   ├── interceptors.ts     # Auth, error handling
│   │   ├── types.ts            # ApiResponse, ApiError
│   │   └── index.ts
│   │
│   ├── storage/                # Persistência (localStorage, storage adapters)
│   │   ├── StorageAdapter.ts
│   │   ├── WebStorageAdapter.ts
│   │   ├── PersistenceHub.ts
│   │   └── index.ts
│   │
│   ├── providers/              # Context & Providers
│   │   ├── AuthProvider.tsx
│   │   ├── SyncProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── index.ts
│   │
│   ├── types/                  # Tipos compartilhados globais
│   │   ├── common.ts           # Tipos que transcendem domínios
│   │   ├── api.ts              # Tipos genéricos de API
│   │   ├── index.ts
│   │   └── README.md
│   │
│   └── constants.ts            # Constantes globais
│
├── features/                   # 🎬 FEATURES COMPOSTAS (múltiplos domínios)
│   │
│   ├── sync/                   # Feature: Sincronização (usa auth, todo, storage)
│   │   ├── components/
│   │   ├── hooks/              # useGlobalSync, usePeriodicalSync
│   │   ├── services/           # Sync engine
│   │   ├── types/
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── lunar-planner/          # Feature: Planejador Lunar (usa astro + lunar-cycle + todo)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── index.ts
│   │   └── README.md
│   │
│   └── emotional-tracking/     # Feature: Rastreamento Emocional
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       ├── index.ts
│       └── README.md
│
├── lib/                        # 📚 COMPATIBILIDADE (arquivos legados mapeados)
│   ├── astro.ts               → `domains/astro/services/`
│   ├── lunar-cycle-utils.ts   → `domains/lunar-cycle/services/`
│   ├── moon-calculations.ts   → `domains/lunar-cycle/services/`
│   ├── planetTodos.ts         → `domains/todo/services/`
│   ├── planetState.ts         → `shared/storage/`
│   └── [outros]               → Mover para local apropriado
│
├── types/                      # 📦 COMPATIBILIDADE (tipos legados mapeados)
│   ├── moon.ts                → `domains/astro/types/`
│   ├── todo.ts                → `domains/todo/types/`
│   ├── timeline.ts            → `domains/insights/types/`
│   └── [outros]               → Mover para local apropriado
│
├── hooks/                      # 🪝 COMPATIBILIDADE (hooks legados mapeados)
│   ├── useAstroCycle.ts       → `domains/astro/hooks/`
│   ├── useLunations.ts        → `domains/lunar-cycle/hooks/`
│   ├── usePlanetTodos.ts      → `domains/todo/hooks/`
│   └── [outros]               → Mover para local apropriado
│
├── public/
├── scripts/
├── infra/
├── android/
├── ios/
│
├── tsconfig.json              # Atualize path aliases
├── package.json
└── README.md
```

---

## Convenções de Nome

### Pastas

| Padrão | Caso | Exemplo | Propósito |
|--------|------|---------|-----------|
| **domains** | `kebab-case` | `lunar-cycle`, `lunar-planner` | Domínios de negócio (singular ou com hífen) |
| **features** | `kebab-case` | `emotional-tracking`, `sync-engine` | Features que combinam múltiplos domínios |
| **Subpastas** | `kebab-case` | `components/`, `services/`, `hooks/` | Categorização clara |
| **components** | `PascalCase` (arquivos) | `MoonPhaseCard.tsx` | Componentes React |
| **hooks** | `camelCase` | `useLunarCycle.ts` | Custom hooks |
| **services** | `camelCase` | `lunarCalculations.ts` | Lógica de negócio |
| **types** | `camelCase` (arquivo) | `moonPhase.ts` | Definições de tipo |
| **utils** | `camelCase` | `validators.ts`, `formatters.ts` | Funções utilitárias |
| **constants** | `constants.ts` | `MOON_PHASES`, `ISLAND_IDS` | Constantes (SCREAMING_SNAKE_CASE) |

### Arquivos

```typescript
// Componentes (PascalCase)
MoonPhaseCard.tsx
TodoInputPanel.tsx

// Hooks (use + CamelCase)
useLunarCycle.ts
useFilteredTodos.ts
useLocalStorage.ts

// Tipos (camelCase + .ts)
moonPhase.ts
todoItem.ts
apiResponse.ts

// Services (camelCase + .ts)
lunarCalculations.ts
todoStorage.ts
authService.ts

// Utils (camelCase + .ts)
validators.ts
formatters.ts
dateHelpers.ts

// Constantes (constants.ts)
constants.ts  ← Dentro contém SCREAMING_SNAKE_CASE

// Index/Barrels (index.ts)
index.ts  ← Exporta tudo do domínio/pasta
```

### Imports nos Index (Barrel Exports)

```typescript
// domains/lunar-cycle/index.ts
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
export * from './constants';

// domains/lunar-cycle/components/index.ts
export { LunarCalendar } from './LunarCalendar';
export { MoonPhaseRail } from './MoonPhaseRail';
export { MoonPhaseDisplay } from './MoonPhaseDisplay';
```

---

## Regras de Boundary (Domínios)

### ✅ Regra 1: Organização por Domínio

**Estrutura mínima de um domínio:**

```
domains/[domínio]/
├── components/        # UI do domínio
├── hooks/             # Lógica reutilizável do domínio
├── services/          # Lógica de negócio (API, DB, transformação)
├── types/             # Tipos específicos do domínio
├── constants.ts       # Constantes do domínio
├── index.ts           # Barrel export
└── README.md          # Documentação
```

**O que pode ter:**
- Subpastas em `components/` para organizar (ex: `components/presentation/`, `components/inputs/`)
- Subpastas em `services/` para organizar (ex: `services/api/`, `services/storage/`)

**O que NÃO pode ter:**
- ❌ Pasta `utils/` (use `services/` para lógica, `shared/utils/` para helpers genéricos)
- ❌ Pasta separada `types/` E `constants/` (coloque em uma ou use `index.ts`)

---

### ✅ Regra 2: Imports Permitidos (Dependency Flow)

```
Imports permitidos por camada (do menos ao mais específico):

┌─────────────────────────────────────┐
│         shared/                      │  ← Pode importar: nada (isolado)
├─────────────────────────────────────┤
│         domains/[x]/                 │  ← Pode importar: shared/
├─────────────────────────────────────┤
│         features/[x]/                │  ← Pode importar: shared/, domains/
├─────────────────────────────────────┤
│         app/[pages]/                 │  ← Pode importar: shared/, domains/, features/
└─────────────────────────────────────┘

REGRA DE OURO:
Nunca importe de cima para baixo!
  - shared/  NÃO importa de domains/
  - domains/ NÃO importa de features/
  - domains/ NÃO importa de app/
```

**Exemplos Corretos:**

```typescript
// ✅ app/cosmos/page.tsx pode importar de domains/
import { LunarCalendar } from '@/domains/lunar-cycle';
import { TodoInput } from '@/domains/todo';

// ✅ features/sync/ pode importar de domains/
import { saveTodos } from '@/domains/todo/services';
import { syncInsights } from '@/domains/insights/services';

// ✅ domains/todo/ pode importar de shared/
import { Card } from '@/shared/ui/primitives';
import { useLocalStorage } from '@/shared/hooks';
```

**Exemplos ERRADOS:**

```typescript
// ❌ shared/ não pode importar de domains/
import { TodoItem } from '@/domains/todo';  // ERRADO!

// ❌ domains/todo/ não pode importar de features/
import { SyncEngine } from '@/features/sync';  // ERRADO!

// ❌ Imports relativos longos (use path aliases)
import { Card } from '../../../shared/ui/primitives';  // EVITAR!
```

---

### ✅ Regra 3: Responsabilidades Claras

| Localização | Responsabilidade | Exemplo |
|-------------|------------------|---------|
| `domains/[x]/components/` | **Apenas** UI do domínio | `MoonPhaseCard`, `TodoInputForm` |
| `domains/[x]/hooks/` | Estado & efeitos do domínio | `useLunarCycle`, `useFilteredTodos` |
| `domains/[x]/services/` | Lógica de negócio | Cálculos, API calls, transformações |
| `domains/[x]/types/` | Tipos específicos | `MoonPhase`, `TodoItem` |
| `shared/ui/` | Componentes genéricos/reutilizáveis | `Button`, `Card`, `Modal` |
| `shared/hooks/` | Hooks genéricos | `useAsync`, `useLocalStorage` |
| `shared/utils/` | Funções helpers genéricas | `formatDate`, `validateEmail` |
| `features/[x]/` | Composição de múltiplos domínios | `SyncEngine` (usa auth + todo + storage) |

---

### ✅ Regra 4: Quando Usar `services/` vs `utils/`

**Use `services/`:**
- ✅ Lógica de negócio específica do domínio
- ✅ Integração com API/DB
- ✅ Transformações de dados complexas
- ✅ Processamento que pode ser testado isoladamente

```typescript
// domains/lunar-cycle/services/lunarCalculations.ts
export function getMoonPhaseForDate(date: Date): MoonPhase {
  // Lógica complexa de negócio
}

export async function fetchLunations(year: number): Promise<LunationData[]> {
  // API integration
}
```

**Use `utils/` (em `shared/`):**
- ✅ Funções genéricas e reutilizáveis
- ✅ Helpers puros (sem efeitos colaterais)
- ✅ Transformações simples de dados
- ✅ Formatação/parsing

```typescript
// shared/utils/formatters.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

---

## Resumo: O que vai aonde

### 🌙 Astro (Astrologia)
```
domains/astro/
├── components/              # MoonPhaseCard, SignDisplay
├── hooks/                   # useSignEmoji, useAstroCycle
├── services/                # signCalculations.ts, astroAPI.ts
├── types/                   # MoonPhase, Zodiac, Sign
└── constants.ts             # SIGNS, EMOJIS
```

### 🌑 Lunar Cycle (Ciclo Lunar)
```
domains/lunar-cycle/
├── components/              # LunarCalendar, MoonPhasesRail
├── hooks/                   # useLunarCycle, useLunations
├── services/                # lunarCalculations.ts, lunationAPI.ts
├── types/                   # LunationData, MoonEvent
└── constants.ts             # PHASES, LABELS
```

### ✅ Todo (Tarefas & Ilhas)
```
domains/todo/
├── components/              # TodoInput, TodoItem, IslandsList
├── hooks/                   # usePlanetTodos, useFilteredTodos
├── services/                # todoStorage.ts, todoAPI.ts
├── types/                   # TodoItem, IslandId, SavedTodo
├── utils/                   # validators.ts, islandHelpers.ts
└── constants.ts             # ISLAND_IDS, STATUS_FILTERS
```

### 💡 Insights (Insights Temporais)
```
domains/insights/
├── components/              # InsightCard, InsightDisplay
├── hooks/                   # useMonthlyInsights, useQuarterlyInsights
├── services/                # insightGeneration.ts, insightAPI.ts
├── types/                   # GenericInsight, MonthlyInsight
└── constants.ts             # INSIGHT_TYPES
```

### 👥 Community (Comunidade)
```
domains/community/
├── components/              # PostCard, CommentList, StreamCard
├── hooks/                   # useCommunityPosts, useComments
├── services/                # communityAPI.ts, postService.ts
├── types/                   # CommunityPost, Comment, Stream
└── constants.ts
```

### 🔐 Auth (Autenticação)
```
domains/auth/
├── components/              # AuthFlow, LoginForm, LogoutButton
├── hooks/                   # useAuth, useAuthChatFlow
├── services/                # tokenManagement.ts, authAPI.ts
├── types/                   # AuthToken, User, Session
└── constants.ts
```

---

## Exemplo Prático: Refatoração de um Domínio

### Antes (Estrutura Caótica)

```
Arquivos espalhados por:
- app/cosmos/components/Card.tsx
- app/cosmos/components/TodoInput.tsx
- app/cosmos/utils/todoStorage.ts
- app/cosmos/utils/islandNames.ts
- lib/planetTodos.ts
- types/todo.ts
- hooks/usePlanetTodos.ts
- components/timeline/TimelineItemCard.tsx (duplicado?)
```

**Problema:** Difícil saber onde está o quê, imports longas, duplicação.

### Depois (Estrutura Organizada)

```
domains/todo/
├── components/
│   ├── TodoInput.tsx          (antes: app/cosmos/components/)
│   ├── TodoItem.tsx
│   ├── IslandsList.tsx        (antes: app/cosmos/components/)
│   ├── presentation/          (agrupa componentes de apresentação)
│   │   ├── TodoCard.tsx
│   │   ├── IslandCard.tsx
│   │   └── index.ts
│   └── index.ts
│
├── hooks/
│   ├── usePlanetTodos.ts      (antes: hooks/)
│   ├── useFilteredTodos.ts    (antes: hooks/)
│   ├── useIslandNames.ts      (antes: app/cosmos/hooks/)
│   └── index.ts
│
├── services/
│   ├── todoStorage.ts         (antes: app/cosmos/utils/)
│   ├── todoAPI.ts             (antes: lib/planetTodos.ts)
│   ├── islandHelpers.ts       (antes: app/cosmos/utils/islandNames.ts)
│   └── index.ts
│
├── types/
│   ├── todo.ts                (antes: types/todo.ts)
│   ├── island.ts              (antes: app/cosmos/types/)
│   └── index.ts
│
├── constants.ts               (ISLAND_IDS, STATUS_FILTERS)
├── index.ts                   (Barrel export)
└── README.md                  # Documentação do domínio
```

**Código do Barrel Export (`domains/todo/index.ts`):**

```typescript
// Components
export * from './components';

// Hooks
export * from './hooks';

// Services
export * from './services';

// Types
export * from './types';

// Constants
export { ISLAND_IDS, TODO_STATUS_FILTERS } from './constants';
```

**Novo Padrão de Import:**

```typescript
// Antes (confuso)
import { TodoInput } from '@/app/cosmos/components';
import { usePlanetTodos } from '@/hooks/usePlanetTodos';
import { saveTodo, loadTodos } from '@/app/cosmos/utils/todoStorage';
import type { SavedTodo } from '@/types/todo';

// Depois (claro e consistente)
import {
  TodoInput,
  usePlanetTodos,
  saveTodo,
  loadTodos,
  type SavedTodo,
  ISLAND_IDS,
} from '@/domains/todo';
```

---

## Guia de Importações

### Path Aliases Necessárias (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/shared/*": ["./shared/*"],
      "@/domains/*": ["./domains/*"],
      "@/features/*": ["./features/*"],
      "@/app/*": ["./app/*"],
      "@/types": ["./shared/types/index"]
    }
  }
}
```

### Padrões de Import

```typescript
// ✅ Do próprio domínio (sem prefix)
import { TodoItem } from '../types';
import { saveTodo } from '../services';
import { usePlanetTodos } from '../hooks';

// ✅ De outro domínio (sempre com @/domains/)
import { MoonPhase, getMoonPhaseForDate } from '@/domains/astro';
import { LunarCalendar } from '@/domains/lunar-cycle/components';

// ✅ De shared (sempre com @/shared/)
import { Card, Button } from '@/shared/ui/primitives';
import { useLocalStorage } from '@/shared/hooks';
import { formatDate } from '@/shared/utils/formatters';

// ✅ De features (sempre com @/features/)
import { useSyncEngine } from '@/features/sync';

// ✅ De app (para páginas e layouts)
import { CosmoosPage } from '@/app/cosmos';

// ❌ NUNCA façam imports relativos longos
import { X } from '../../../shared/ui';  // ❌ Evitar!

// ❌ NUNCA importem de cima pra baixo
import { useSyncEngine } from '@/features/sync';  // ❌ Em um domínio!
```

### Re-exports (Barrel Pattern)

**Dentro de cada pasta com múltiplos arquivos:**

```typescript
// domains/todo/components/index.ts
export { TodoInput } from './TodoInput';
export { TodoItem } from './TodoItem';
export { IslandsList } from './IslandsList';

// domains/todo/hooks/index.ts
export { usePlanetTodos } from './usePlanetTodos';
export { useFilteredTodos } from './useFilteredTodos';

// domains/todo/services/index.ts
export { saveTodo, loadTodos } from './todoStorage';
export { getIslandLabel } from './islandHelpers';

// domains/todo/types/index.ts
export type { TodoItem, SavedTodo, IslandId };
export { isSavedTodo, isValidIsland } from './validators';

// domains/todo/index.ts (Barrel final)
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
export { ISLAND_IDS, TODO_STATUS_FILTERS } from './constants';
```

---

## Plano de Migração

### Fase 1: Setup (Preparação)

**Duração: 30 min**

1. Criar estrutura de pastas em `domains/` e `shared/`
2. Criar `README.md` para cada domínio
3. Atualizar `tsconfig.json` com path aliases

```bash
mkdir -p domains/{astro,lunar-cycle,todo,insights,community,auth}
mkdir -p shared/{ui/primitives,ui/layouts,ui/feedback,hooks,utils,storage,api,providers,types}
```

### Fase 2: Mover Código Compartilhado (1-2 dias)

**Duração: 2-3 horas**

1. **Mover `shared/ui/primitives/Card.tsx`**
   - Deletar `components/shared/cosmos/Card.tsx`
   - Deletar `app/cosmos/components/Card.tsx`
   - Criar versão unificada em `shared/ui/primitives/Card.tsx`

2. **Mover hooks genéricos**
   - Mover para `shared/hooks/`

3. **Mover utils genéricos**
   - Mover para `shared/utils/`

4. **Criar providers globais**
   - Mover para `shared/providers/`

### Fase 3: Refatorar Domínios (3-5 dias)

**Por domínio:**

1. **Create `domains/[domain]/` structure**
2. **Move components** from `app/` + `components/`
3. **Move hooks** from `hooks/`
4. **Move services** from `lib/` + `app/[domain]/utils/`
5. **Move types** from `types/` + `app/[domain]/types/`
6. **Create `constants.ts`**
7. **Create barrel exports** (`index.ts`)
8. **Create `README.md`**

### Fase 4: Refatorar Features Compostas (1-2 dias)

**Por feature:**

1. Create `features/[feature]/` structure
2. Move componentes que usam múltiplos domínios
3. Move hooks compostos
4. Move services compostos
5. Create barrel exports
6. Create `README.md`

### Fase 5: Atualizar Imports (1-2 dias)

**Global search & replace:**

```typescript
// Find & Replace patterns
"@/app/cosmos/components" → "@/domains/todo/components"
"@/lib/planets" → "@/domains/todo/services"
"@/types/moon" → "@/domains/astro/types"
```

### Fase 6: Testing & Cleanup (1 dia)

1. Verificar que tudo compila
2. Verificar que tudo roda
3. Deletar `lib/` legado (após migração)
4. Deletar `types/` legado (após migração)
5. Deletar `app/cosmos/types` legado
6. Cleanup de imports

---

## Checklist Final

- [ ] Estrutura de pastas criada
- [ ] Path aliases atualizadas no `tsconfig.json`
- [ ] Componentes duplicados removidos
- [ ] Types centralizados em domínios
- [ ] `lib/` e `utils/` reorganizados
- [ ] Barrel exports criados
- [ ] README.md criado para cada domínio
- [ ] Imports atualizados globalmente
- [ ] Testes passando
- [ ] Build funciona
- [ ] Documentação atualizada

---

## Próximos Passos

1. **Revisar esta proposta** com o time
2. **Validar com casos de uso reais**
3. **Começar migraçãoPor domínio** (recomendado: `todo` → `astro` → `lunar-cycle`)
4. **Atualizar ESLint rules** para enforçar o padrão
5. **Documentar na wiki** do projeto
