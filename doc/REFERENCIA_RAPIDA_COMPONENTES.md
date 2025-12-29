# 💻 Referência Rápida - Componentes e Padrões

## 1. EmptyState - Quando não há tarefas

```tsx
import { EmptyState } from '@/app/cosmos/components/EmptyState';

<EmptyState
  title="Nenhum to-do salvo"
  description="Crie uma tarefa ou selecione uma fase lunar."
  icon="✨"
/>;
```

**Props:**

```typescript
interface EmptyStateProps {
  title?: string; // "Nenhum to-do salvo"
  description?: string; // "Crie uma tarefa..."
  icon?: React.ReactNode; // "✨" ou <Icon />
  className?: string; // Classes CSS adicionais
}
```

**Classes CSS principais:**

```tailwind
border-dashed border-slate-700/40 bg-slate-900/30 opacity-60 transition-opacity
```

---

## 2. AccessibleTabs - Navegação por abas (WAI-ARIA)

```tsx
import { AccessibleTabs } from '@/app/cosmos/components/AccessibleTabs';

const [activeTab, setActiveTab] = useState('inbox');

<AccessibleTabs
  id="main-tabs"
  items={[
    { id: 'inbox-tab', label: 'Inbox', value: 'inbox' },
    { id: 'moon-tab', label: 'Lua Atual', value: 'moon' },
  ]}
  value={activeTab}
  onChange={setActiveTab}
/>;
```

**Props:**

```typescript
interface AccessibleTabsProps {
  items: TabItem[]; // Lista de abas
  value: string; // Valor selecionado
  onChange: (value: string) => void;
  id?: string; // ID único (para aria-*)
  containerClassName?: string; // Classes do container
  activeClassName?: string; // Classes da aba ativa
  inactiveClassName?: string; // Classes da aba inativa
}
```

**Keyboard Navigation:**

- Arrow Right/Down: Próxima aba
- Arrow Left/Up: Aba anterior
- Home: Primeira aba
- End: Última aba

---

## 3. IslandsList - Seleção de ilhas (Ilha 1..4)

```tsx
import { IslandsList } from '@/app/cosmos/components/IslandsList';

const [selectedIsland, setSelectedIsland] = useState<IslandId | null>(null);

<IslandsList selectedIsland={selectedIsland} onSelectIsland={setSelectedIsland} />;
```

**Props:**

```typescript
interface IslandsListProps {
  selectedIsland: IslandId | null;
  onSelectIsland: (island: IslandId | null) => void;
  containerClassName?: string;
  activeItemClassName?: string;
  inactiveItemClassName?: string;
}
```

**Estado ativo:**

```tailwind
border-indigo-300/80 bg-indigo-500/20 text-indigo-100 shadow-md shadow-indigo-500/20
```

---

## 4. MoonPhasesRail - Fases lunares selecionáveis

```tsx
import { MoonPhasesRail } from '@/app/cosmos/components/MoonPhasesRail';

const [selectedPhase, setSelectedPhase] = useState<MoonPhase | null>(null);
const [moonCounts, setMoonCounts] = useState<Record<MoonPhase, number>>({
  luaNova: 2,
  luaCrescente: 1,
  luaCheia: 3,
  luaMinguante: 1,
});

<MoonPhasesRail
  selectedPhase={selectedPhase}
  onSelectPhase={setSelectedPhase}
  phaseCounts={moonCounts}
  orientation="vertical"
/>;
```

**Props:**

```typescript
interface MoonPhasesRailProps {
  selectedPhase: MoonPhase | null;
  onSelectPhase: (phase: MoonPhase | null) => void;
  phaseCounts?: Record<MoonPhase, number>; // Badges
  containerClassName?: string;
  activeButtonClassName?: string;
  inactiveButtonClassName?: string;
  orientation?: 'vertical' | 'horizontal';
}
```

**Estado selecionado:**

```tailwind
border-indigo-400 bg-indigo-500/30 text-indigo-100 shadow-lg shadow-indigo-500/30 scale-105
```

---

## 5. SavedTodosPanel - Lista de tarefas com EmptyState

```tsx
import { SavedTodosPanel } from '@/app/cosmos/components/SavedTodosPanel';

<SavedTodosPanel
  savedTodos={filteredTodos}
  onDragStart={(todoId) => (e) => {
    /* ... */
  }}
  onDragEnd={() => {
    /* ... */
  }}
  onToggleComplete={(todoId) => {
    /* ... */
  }}
  onAssignPhase={(todoId, phase) => {
    /* ... */
  }}
  selectedPhase={selectedPhase}
  filterLabel="Flua"
/>;
```

**Props:**

```typescript
interface SavedTodosPanelProps {
  savedTodos: SavedTodo[];
  onDragStart: (todoId: string) => (event: React.DragEvent) => void;
  onDragEnd: () => void;
  onToggleComplete: (todoId: string) => void;
  onAssignPhase?: (todoId: string, phase: MoonPhase) => void;
  filterLabel?: string;
  selectedPhase?: MoonPhase | null;
}
```

**Lógica de filtragem:**

```typescript
const displayedTodos = selectedPhase
  ? savedTodos.filter((todo) => todo.phase === selectedPhase)
  : savedTodos;
```

---

## 6. SidePlanetCardScreen - Integração Completa

```tsx
const SidePlanetCardScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  // Estados
  const [savedTodos, setSavedTodos] = useState<SavedTodo[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedIsland, setSelectedIsland] = useState<IslandId | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<MoonPhase | null>(null);

  // Lógica de filtragem
  const filteredTodos = useMemo(() => {
    let result = savedTodos;

    if (selectedProject.trim()) {
      result = result.filter(
        (todo) => (todo.project ?? "").toLowerCase() === selectedProject.toLowerCase()
      );
    }

    if (selectedPhase) {
      result = result.filter((todo) => todo.phase === selectedPhase);
    }

    return result;
  }, [savedTodos, selectedProject, selectedPhase]);

  // Handler para atribuir tarefa a uma fase
  const assignTodoToPhase = (todoId: string, phase: MoonPhase) => {
    const target = savedTodos.find((todo) => todo.id === todoId);
    if (!target || target.phase === phase) return;

    setSavedTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, phase } : todo
      )
    );

    saveInput({
      moonPhase: phase,
      inputType: "tarefa",
      sourceId: target.id,
      content: target.text,
      vibe: PHASE_VIBES[phase].label,
    });
  };

  return (
    <div className="relative flex w-full items-start justify-center px-4 sm:px-8 pt-4 sm:pt-6">
      <div className="relative flex w-full max-w-7xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">

        {/* Coluna Esquerda */}
        <div className="flex w-full flex-col gap-6 lg:w-auto lg:max-w-xs">
          <MoonCluster { /* ... */ } />
          <IslandsList
            selectedIsland={selectedIsland}
            onSelectIsland={setSelectedIsland}
          />
        </div>

        {/* Coluna Central */}
        <div className="relative w-full lg:flex-1">
          <SavedTodosPanel
            savedTodos={filteredTodos}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onToggleComplete={handleToggleComplete}
            onAssignPhase={assignTodoToPhase}
            selectedPhase={selectedPhase}
          />
        </div>

        {/* Coluna Direita */}
        <div className="w-full lg:w-auto lg:max-w-xs">
          <MoonPhasesRail
            selectedPhase={selectedPhase}
            onSelectPhase={setSelectedPhase}
            phaseCounts={moonCounts}
            orientation="vertical"
          />
        </div>
      </div>
    </div>
  );
};
```

---

## 7. Tipos Estendidos

```typescript
// app/cosmos/types/screen.ts

export type IslandId = 'ilha1' | 'ilha2' | 'ilha3' | 'ilha4';

export type TaskWithState = SavedTodo & {
  islandId?: IslandId;
};

export interface ScreenSelectionState {
  selectedIsland: IslandId | null;
  selectedPhase: MoonPhase | null;
  selectedProject: string;
}

export interface TaskHandlers {
  onToggleComplete: (todoId: string) => void;
  onAssignPhase: (todoId: string, phase: MoonPhase) => void;
  onRemovePhase: (todoId: string) => void;
}
```

---

## 8. Tailwind Classes Cheat Sheet

### Estados Ativos

```tailwind
border-indigo-400
bg-indigo-500/20
text-indigo-100
shadow-md shadow-indigo-500/20
```

### Estados Inativos

```tailwind
border-slate-700
bg-slate-900/70
text-slate-300
hover:border-indigo-400/60
```

### Focus Ring

```tailwind
focus:outline-none
focus-visible:ring-2 focus-visible:ring-indigo-500
focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
```

### Empty State

```tailwind
border-dashed border-slate-700/40
bg-slate-900/30 opacity-60
transition-opacity
```

### Badges

```tailwind
rounded-full bg-indigo-600
px-2 py-1 text-[0.6rem] font-bold text-white
```

---

## 9. Padrões de Teclado

```typescript
// Navegação em array com setas
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault();
      nextIndex = (index + 1) % items.length;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      nextIndex = (index - 1 + items.length) % items.length;
      break;
    case 'Home':
      e.preventDefault();
      nextIndex = 0;
      break;
    case 'End':
      e.preventDefault();
      nextIndex = items.length - 1;
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      // Ação (toggle, select, etc)
      break;
  }
};
```

---

## 10. Imports Necessários

```typescript
import React from 'react';
import { SavedTodosPanel } from '@/app/cosmos/components/SavedTodosPanel';
import { MoonPhasesRail } from '@/app/cosmos/components/MoonPhasesRail';
import { IslandsList } from '@/app/cosmos/components/IslandsList';
import { AccessibleTabs } from '@/app/cosmos/components/AccessibleTabs';
import { EmptyState } from '@/app/cosmos/components/EmptyState';
import type { SavedTodo, MoonPhase } from '@/app/cosmos/utils/todoStorage';
import type { IslandId } from '@/app/cosmos/types/screen';
import { phaseLabels } from '@/app/cosmos/utils/todoStorage';
```
