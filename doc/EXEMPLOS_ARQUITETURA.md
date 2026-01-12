# 📝 Exemplos Reais: Refatoração Aplicada

## Índice
1. [Exemplo 1: Consolidar Card.tsx](#exemplo-1-consolidar-cardtsx-duplicado)
2. [Exemplo 2: Reorganizar Domínio Todo](#exemplo-2-reorganizar-domínio-todo)
3. [Exemplo 3: Consolidar Astro & Lunar](#exemplo-3-consolidar-astro--lunar)
4. [Exemplo 4: Refatorar Imports](#exemplo-4-refatorar-imports)
5. [Exemplo 5: Criar Feature Composita](#exemplo-5-criar-feature-composita)

---

## Exemplo 1: Consolidar Card.tsx (Duplicado)

### Situação Atual (CAÓTICA)

Existem pelo menos 2 versões idênticas:

```
components/shared/cosmos/Card.tsx   ← Qual usar?
app/cosmos/components/Card.tsx      ← Qual usar?
components/timeline/TimelineItemCard.tsx  ← Especialização
app/comunidade/components/StreamCard.tsx   ← Especialização
```

### Depois da Refatoração (ORGANIZADO)

```
shared/ui/primitives/
├── Card.tsx              # ✅ UMA ÚNICA Card genérica/reutilizável
├── Button.tsx
├── Modal.tsx
├── Input.tsx
├── index.ts
└── Card.stories.tsx      # Storybook (opcional)

domains/todo/components/
└── TodoCard.tsx          # ✅ Especialização de Card para Todo

domains/insights/components/
└── InsightCard.tsx       # ✅ Especialização de Card para Insights

domains/community/components/
├── PostCard.tsx          # ✅ Especialização para posts
├── StreamCard.tsx        # ✅ Especialização para streams
└── index.ts
```

### Código: Card Genérica

**File: `shared/ui/primitives/Card.tsx`**

```typescript
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  className?: string;
  children?: React.ReactNode;
  interactive?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className = '',
  children,
  interactive = false,
  onClick,
  variant = 'default',
  hoverEffect = true,
}) => {
  const variants = {
    default: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_0_40px_rgba(148,163,184,0.45)]',
    outlined: 'bg-transparent border-2 border-white/30',
    elevated: 'bg-white/15 backdrop-blur-xl border border-white/40 shadow-lg',
  };

  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      whileHover={hoverEffect && interactive ? { scale: 1.02 } : {}}
      className={[
        'rounded-3xl p-6',
        variants[variant],
        interactive && 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </motion.div>
  );
};
```

### Código: Card Especializada (TodoCard)

**File: `domains/todo/components/TodoCard.tsx`**

```typescript
'use client';

import React from 'react';
import { Card } from '@/shared/ui/primitives';
import type { SavedTodo } from '@/domains/todo/types';

interface TodoCardProps {
  todo: SavedTodo;
  onEdit?: (todo: SavedTodo) => void;
  onDelete?: (todoId: string) => void;
  onToggle?: (todoId: string, completed: boolean) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onEdit,
  onDelete,
  onToggle,
}) => {
  return (
    <Card interactive hoverEffect variant="elevated">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => onToggle?.(todo.id, e.target.checked)}
            className="mr-3"
          />
          <span className={todo.completed ? 'line-through opacity-50' : ''}>
            {todo.title}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit?.(todo)}>✏️</button>
          <button onClick={() => onDelete?.(todo.id)}>🗑️</button>
        </div>
      </div>
    </Card>
  );
};
```

### Barrel Exports

**File: `shared/ui/primitives/index.ts`**

```typescript
export { Card } from './Card';
export { Button } from './Button';
export { Modal } from './Modal';
export { Input } from './Input';

export type { CardProps } from './Card';
export type { ButtonProps } from './Button';
// ... etc
```

### Atualizando Imports

**Antes:**

```typescript
import { Card } from '@/components/shared/cosmos/Card';
import { Card } from '@/app/cosmos/components/Card';  // ❌ Conflito!
```

**Depois:**

```typescript
// Para usar Card genérica
import { Card } from '@/shared/ui/primitives';

// Para usar Card especializada
import { TodoCard } from '@/domains/todo/components';
```

---

## Exemplo 2: Reorganizar Domínio Todo

### Antes (Espalhado por 5 arquivos)

```typescript
// app/cosmos/components/TodoInput.tsx
export const TodoInput = () => { ... }

// app/cosmos/components/Card.tsx
export const Card = () => { ... }  // ❌ Duplicado

// lib/planetTodos.ts
export async function listPlanetTodos(userId) { ... }

// hooks/usePlanetTodos.ts
export function usePlanetTodos() { ... }

// types/todo.ts
export type SavedTodo = { ... }

// app/cosmos/utils/todoStorage.ts
export function saveTodo(todo) { ... }
```

**Problema:** Imports complexos, difícil manutenção:

```typescript
import { TodoInput } from '@/app/cosmos/components';
import { usePlanetTodos } from '@/hooks';
import { saveTodo } from '@/app/cosmos/utils/todoStorage';
import type { SavedTodo } from '@/types/todo';
```

### Depois (Organizado em `domains/todo/`)

```
domains/todo/
├── components/
│   ├── TodoInput.tsx
│   ├── TodoCard.tsx
│   ├── IslandsList.tsx
│   ├── TodoItem.tsx
│   └── index.ts
│
├── hooks/
│   ├── usePlanetTodos.ts
│   ├── useFilteredTodos.ts
│   ├── useIslandNames.ts
│   └── index.ts
│
├── services/
│   ├── todoStorage.ts
│   ├── todoAPI.ts
│   ├── islandHelpers.ts
│   └── index.ts
│
├── types/
│   ├── todo.ts
│   ├── island.ts
│   └── index.ts
│
├── constants.ts
├── index.ts
├── README.md
└── __tests__/
```

### Código Estruturado

**File: `domains/todo/types/todo.ts`**

```typescript
export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  islandId: IslandId;
  phaseDate: string;
  recordedAt: string;
  emotionalState?: string;
}

export interface SavedTodo extends TodoItem {
  userId: string;
  syncedAt?: string;
}

export type TodoStatusFilter = 'all' | 'completed' | 'open';
export type InputTypeFilter = 'all' | 'text' | 'checkbox';
```

**File: `domains/todo/types/island.ts`**

```typescript
export type IslandId =
  | 'terra'
  | 'agua'
  | 'ar'
  | 'fogo'
  | 'eter'
  | 'corpo'
  | 'mente'
  | 'espírito'
  | 'coração';

export interface IslandMetadata {
  id: IslandId;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export function isValidIsland(value: unknown): value is IslandId {
  const islands: IslandId[] = [
    'terra', 'agua', 'ar', 'fogo', 'eter',
    'corpo', 'mente', 'espírito', 'coração',
  ];
  return typeof value === 'string' && islands.includes(value as IslandId);
}
```

**File: `domains/todo/types/index.ts`**

```typescript
export type { TodoItem, SavedTodo, TodoStatusFilter, InputTypeFilter } from './todo';
export type { IslandId, IslandMetadata } from './island';
export { isValidIsland } from './island';
```

**File: `domains/todo/services/todoStorage.ts`**

```typescript
import { getDb } from '@/shared/api/db';
import type { SavedTodo } from '@/domains/todo/types';

const STORAGE_KEY = 'flua_todos_salvos';

export async function saveTodo(userId: string, todo: SavedTodo): Promise<void> {
  const db = getDb();
  await db.todos.insert({
    ...todo,
    userId,
    syncedAt: new Date().toISOString(),
  });
}

export async function loadTodos(userId: string): Promise<SavedTodo[]> {
  const db = getDb();
  return db.todos.where({ userId }).toArray();
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  const db = getDb();
  await db.todos.where({ userId, id: todoId }).delete();
}

export async function updateTodo(userId: string, todo: SavedTodo): Promise<void> {
  const db = getDb();
  await db.todos.update(todo.id, {
    ...todo,
    syncedAt: new Date().toISOString(),
  });
}
```

**File: `domains/todo/hooks/usePlanetTodos.ts`**

```typescript
import { useEffect, useState, useCallback } from 'react';
import { loadTodos, saveTodo, deleteTodo, updateTodo } from '@/domains/todo/services';
import type { SavedTodo } from '@/domains/todo/types';
import { useAuth } from '@/domains/auth/hooks';

export function usePlanetTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<SavedTodo[]>([]);
  const [loading, setLoading] = useState(true);

  // Load todos on mount
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const data = await loadTodos(user.id);
        setTodos(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const addTodo = useCallback(
    async (todo: SavedTodo) => {
      if (!user) return;
      await saveTodo(user.id, todo);
      setTodos((prev) => [...prev, todo]);
    },
    [user]
  );

  const removeTodo = useCallback(
    async (todoId: string) => {
      if (!user) return;
      await deleteTodo(user.id, todoId);
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
    },
    [user]
  );

  const updateTodoItem = useCallback(
    async (todo: SavedTodo) => {
      if (!user) return;
      await updateTodo(user.id, todo);
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? todo : t))
      );
    },
    [user]
  );

  return {
    todos,
    loading,
    addTodo,
    removeTodo,
    updateTodoItem,
  };
}
```

**File: `domains/todo/components/index.ts`**

```typescript
export { TodoInput } from './TodoInput';
export { TodoCard } from './TodoCard';
export { TodoItem } from './TodoItem';
export { IslandsList } from './IslandsList';
```

**File: `domains/todo/index.ts`** (Barrel final)

```typescript
// Components
export * from './components';

// Hooks
export * from './hooks';

// Services
export { saveTodo, loadTodos, deleteTodo, updateTodo } from './services';

// Types
export type { SavedTodo, TodoItem, IslandId } from './types';

// Constants
export { ISLAND_IDS, ISLAND_NAMES, TODO_STATUS_FILTERS } from './constants';
```

### Novo Padrão de Uso

**Antes (confuso):**

```typescript
import { TodoInput } from '@/app/cosmos/components';
import { usePlanetTodos } from '@/hooks/usePlanetTodos';
import { saveTodo } from '@/app/cosmos/utils/todoStorage';
import type { SavedTodo } from '@/types/todo';
```

**Depois (claro):**

```typescript
import {
  TodoInput,
  TodoCard,
  usePlanetTodos,
  saveTodo,
  type SavedTodo,
  ISLAND_IDS,
} from '@/domains/todo';
```

---

## Exemplo 3: Consolidar Astro & Lunar

### Situação Atual

```
Espalhado em:
- lib/astro.ts              → SIGNS, getSignEmoji()
- lib/moon-calculations.ts  → Cálculos lunares
- types/moon.ts             → MoonPhase type
- app/cosmos/utils/moonPhases.ts  → MOON_PHASE_LABELS
- lib/lunation-utils.ts     → Lunations
- hooks/useLunarCycle.ts    → Hook lunar
```

### Depois: Dois Domínios Claros

```
domains/astro/
├── components/MoonPhaseDisplay.tsx
├── hooks/useSignEmoji.ts
├── services/signCalculations.ts
├── types/sign.ts
└── constants.ts           # SIGNS, EMOJIS

domains/lunar-cycle/
├── components/LunarCalendar.tsx
├── hooks/useLunarCycle.ts
├── services/lunarCalculations.ts
├── types/lunation.ts
└── constants.ts           # MOON_PHASES, LABELS
```

### Código: Consolidar Astro

**File: `domains/astro/types/sign.ts`**

```typescript
export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export interface AstroData {
  sign: ZodiacSign;
  emoji: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  modality: 'cardinal' | 'fixed' | 'mutable';
}
```

**File: `domains/astro/constants.ts`**

```typescript
import type { ZodiacSign, AstroData } from './types/sign';

export const ZODIAC_SIGNS: readonly ZodiacSign[] = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

export const SIGN_DATA: Record<ZodiacSign, AstroData> = {
  aries: {
    sign: 'aries',
    emoji: '♈',
    element: 'fire',
    modality: 'cardinal',
  },
  taurus: {
    sign: 'taurus',
    emoji: '♉',
    element: 'earth',
    modality: 'fixed',
  },
  // ... etc
};

export const SIGN_EMOJIS: Record<ZodiacSign, string> = {
  aries: '♈',
  taurus: '♉',
  // ... etc
};
```

**File: `domains/astro/services/signCalculations.ts`**

```typescript
import type { ZodiacSign } from '@/domains/astro/types/sign';

/**
 * Calcula o signo zodiacal baseado na data
 */
export function getZodiacSign(date: Date): ZodiacSign {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
    return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
    return 'taurus';
  // ... etc

  return 'aries'; // default
}

export function getSignEmoji(sign: ZodiacSign): string {
  const emojis: Record<ZodiacSign, string> = {
    aries: '♈',
    taurus: '♉',
    // ... etc
  };
  return emojis[sign];
}
```

### Código: Consolidar Lunar

**File: `domains/lunar-cycle/types/lunation.ts`**

```typescript
export type MoonPhase = 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';

export interface LunationData {
  id: string;
  date: string;
  phase: MoonPhase;
  illumination: number;
  description: string;
}

export interface MoonEvent {
  date: string;
  type: MoonPhase;
  significance: 'novo' | 'cheia' | 'quarto';
}
```

**File: `domains/lunar-cycle/constants.ts`**

```typescript
import type { MoonPhase } from './types/lunation';

export const MOON_PHASES: readonly MoonPhase[] = [
  'luaNova',
  'luaCrescente',
  'luaCheia',
  'luaMinguante',
] as const;

export const MOON_PHASE_LABELS: Record<MoonPhase, string> = {
  luaNova: 'Lua Nova',
  luaCrescente: 'Lua Crescente',
  luaCheia: 'Lua Cheia',
  luaMinguante: 'Lua Minguante',
};

export const MOON_PHASE_EMOJIS: Record<MoonPhase, string> = {
  luaNova: '🌑',
  luaCrescente: '🌒',
  luaCheia: '🌕',
  luaMinguante: '🌘',
};
```

**File: `domains/lunar-cycle/services/lunarCalculations.ts`**

```typescript
import type { MoonPhase, LunationData } from '@/domains/lunar-cycle/types';

/**
 * Calcula a fase lunar para uma data específica
 * Baseado em algoritmo astronômico
 */
export function getMoonPhaseForDate(date: Date): MoonPhase {
  // Implementação astronômica real aqui
  // Este é um stub simplificado
  const days = Math.floor(
    (date.getTime() - new Date(2000, 0, 6).getTime()) / (24 * 60 * 60 * 1000)
  );
  const phase = (days % 29.5) / 29.5;

  if (phase < 0.25) return 'luaNova';
  if (phase < 0.5) return 'luaCrescente';
  if (phase < 0.75) return 'luaCheia';
  return 'luaMinguante';
}

/**
 * Calcula a iluminação lunar (0-100%)
 */
export function getMoonIllumination(date: Date): number {
  const phase = getMoonPhaseForDate(date);
  const days = Math.floor(
    (date.getTime() - new Date(2000, 0, 6).getTime()) / (24 * 60 * 60 * 1000)
  );
  const cycleDay = days % 29.5;

  if (phase === 'luaNova') return (cycleDay / 7.375) * 100;
  if (phase === 'luaCrescente') return 50 + ((cycleDay - 7.375) / 7.375) * 50;
  if (phase === 'luaCheia') return 100 - ((cycleDay - 14.75) / 7.375) * 50;
  return ((cycleDay - 22.125) / 7.375) * 50;
}
```

---

## Exemplo 4: Refatorar Imports

### Cenário: Página Cosmos

**Antes (Confuso e Longo):**

```typescript
// app/cosmos/page.tsx
import { LunarCalendar } from '@/app/cosmos/components/calendariog';
import { TodoInput } from '@/app/cosmos/components';
import { Card } from '@/components/shared/cosmos/Card';  // Duplicado
import { MoonPhaseDisplay } from '@/app/cosmos/components';
import { usePlanetTodos } from '@/hooks/usePlanetTodos';
import { useGlobalSync } from '@/hooks/useGlobalSync';
import { useLunations } from '@/hooks/useLunations';
import type { SavedTodo } from '@/types/todo';
import { ISLAND_IDS } from '@/app/cosmos/utils/islandNames';
import { MoonPhase } from '@/types/moon';
```

**Depois (Claro e Conciso):**

```typescript
// app/cosmos/page.tsx
'use client';

import {
  LunarCalendar,
  TodoInput,
  usePlanetTodos,
  type SavedTodo,
  ISLAND_IDS,
} from '@/domains/todo';

import {
  MoonPhaseDisplay,
  useSignEmoji,
} from '@/domains/astro';

import {
  useLunarCycle,
  type MoonPhase,
} from '@/domains/lunar-cycle';

import { useGlobalSync } from '@/features/sync';

import { Card, Button } from '@/shared/ui/primitives';

export default function CosmoPage() {
  const { todos, addTodo } = usePlanetTodos();
  const moonPhase = useLunarCycle();
  const getSignEmoji = useSignEmoji();

  return (
    <Card>
      <LunarCalendar />
      <MoonPhaseDisplay phase={moonPhase} />
      <TodoInput onSubmit={addTodo} />
      {todos.map((todo) => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </Card>
  );
}
```

### ESLint Rule para Enforçar

**File: `.eslintrc.json`**

```json
{
  "rules": {
    "import/no-restricted-paths": [
      "error",
      {
        "zones": [
          {
            "target": "./shared",
            "from": "./domains",
            "message": "shared/ não pode importar de domains/"
          },
          {
            "target": "./domains",
            "from": "./features",
            "message": "domains/ não pode importar de features/"
          },
          {
            "target": "./domains",
            "from": "./app",
            "message": "domains/ não pode importar de app/"
          }
        ]
      }
    ],
    "import/no-relative-parent-imports": [
      "error",
      {
        "maxDepth": 1
      }
    ]
  }
}
```

---

## Exemplo 5: Criar Feature Composita

### Use Case: Sync Engine

A sincronização usa:
- `domains/auth/` (tokens, usuários)
- `domains/todo/` (todos para sync)
- `domains/insights/` (insights para sync)
- `shared/storage/` (persistência)

### Estrutura

**File: `features/sync/README.md`**

```markdown
# Sync Engine

Orquestra a sincronização entre:
- Autenticação (tokens, usuário)
- Todos (tarefas e ilhas)
- Insights (insights gerados)
- Storage local

## Responsabilidades

- Detectar mudanças
- Fazer batch upload
- Lidar com conflitos
- Manter cache local

## Dependências

- `@/domains/auth`
- `@/domains/todo`
- `@/domains/insights`
- `@/shared/storage`
- `@/shared/api`

## Uso

```typescript
const { sync, syncStatus } = useSyncEngine();
await sync();
```
```

**File: `features/sync/services/syncEngine.ts`**

```typescript
import { loadTodos } from '@/domains/todo/services';
import { getAuthToken } from '@/domains/auth/services';
import { syncInsights } from '@/domains/insights/services';
import { getPersistenceHub } from '@/shared/storage';
import { apiClient } from '@/shared/api';

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  errors: string[];
}

export async function performFullSync(userId: string): Promise<SyncResult> {
  const errors: string[] = [];
  let itemsSynced = 0;

  try {
    // 1. Verificar autenticação
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        itemsSynced: 0,
        errors: ['Não autenticado'],
      };
    }

    // 2. Sincronizar todos
    const todos = await loadTodos(userId);
    const todosResult = await apiClient.post('/sync/todos', { todos });
    itemsSynced += todosResult.synced || 0;

    // 3. Sincronizar insights
    const insightsResult = await syncInsights(userId);
    itemsSynced += insightsResult.synced || 0;

    // 4. Atualizar timestamps de sync
    const hub = getPersistenceHub();
    await hub.set('lastSyncAt', new Date().toISOString());

    return { success: true, itemsSynced, errors };
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : 'Erro desconhecido'
    );
    return { success: false, itemsSynced, errors };
  }
}

export async function detectChanges(userId: string) {
  const todos = await loadTodos(userId);
  const unsynced = todos.filter((t) => !t.syncedAt);
  return {
    unsyncedTodos: unsynced.length,
    lastSync: localStorage.getItem('lastSyncAt'),
  };
}
```

**File: `features/sync/hooks/useSyncEngine.ts`**

```typescript
import { useState, useCallback } from 'react';
import { performFullSync, detectChanges } from '@/features/sync/services';
import { useAuth } from '@/domains/auth/hooks';
import type { SyncResult } from '@/features/sync/services';

export function useSyncEngine() {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>(
    'idle'
  );
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);

  const sync = useCallback(async () => {
    if (!user) return;

    setSyncStatus('syncing');
    try {
      const result = await performFullSync(user.id);
      setLastResult(result);
      setSyncStatus(result.success ? 'idle' : 'error');
      return result;
    } catch (error) {
      setSyncStatus('error');
      throw error;
    }
  }, [user]);

  const hasChanges = useCallback(async () => {
    if (!user) return false;
    const changes = await detectChanges(user.id);
    return changes.unsyncedTodos > 0;
  }, [user]);

  return { sync, syncStatus, lastResult, hasChanges };
}
```

**File: `features/sync/index.ts`**

```typescript
export { useSyncEngine } from './hooks/useSyncEngine';
export { performFullSync, detectChanges } from './services/syncEngine';
export type { SyncResult } from './services/syncEngine';
```

### Uso na Aplicação

```typescript
import { useSyncEngine } from '@/features/sync';
import { usePlanetTodos } from '@/domains/todo';
import { useAuth } from '@/domains/auth';

export default function CosmoPage() {
  const { user } = useAuth();
  const { sync, syncStatus } = useSyncEngine();
  const { todos } = usePlanetTodos();

  const handleSync = async () => {
    const result = await sync();
    if (result.success) {
      console.log(`✅ Sincronizados ${result.itemsSynced} itens`);
    } else {
      console.error('Erros de sync:', result.errors);
    }
  };

  return (
    <div>
      <button onClick={handleSync} disabled={syncStatus === 'syncing'}>
        {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar'}
      </button>
      <div>{todos.length} tarefas locais</div>
    </div>
  );
}
```

---

## Resumo de Benefícios

### Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Imports** | `@/app/cosmos/components`, `@/hooks`, `@/lib`, `@/types` | `@/domains/todo`, `@/shared/ui` |
| **Duplicação** | Card.tsx em 2+ locais | 1 Card em `shared/ui/primitives` |
| **Organização** | Caótica, sem padrão | Estruturada por domínio |
| **Escalabilidade** | Difícil adicionar features | Fácil criar novo domínio |
| **Ownership** | Difuso | Claro por domínio |
| **Dependências** | Circulares e confusas | Unidirecionais e claras |
| **Documentação** | Nenhuma | README.md por domínio |

---

## Checklist de Implementação

- [ ] Criar estrutura de pastas
- [ ] Mover `shared/ui/primitives/Card.tsx`
- [ ] Consolidar tipos em `domains/`
- [ ] Mover `domains/todo/`
- [ ] Mover `domains/astro/`
- [ ] Mover `domains/lunar-cycle/`
- [ ] Criar barrel exports
- [ ] Atualizar imports globalmente
- [ ] Atualizar `tsconfig.json`
- [ ] Configurar ESLint rules
- [ ] Testar build
- [ ] Testar aplicação
