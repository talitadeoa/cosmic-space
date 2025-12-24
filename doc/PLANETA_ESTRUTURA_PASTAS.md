# Estrutura de Pastas - Rota Planeta

## 📁 Árvore Completa de Dependências

```
app/
├── planeta/                                  ← NOVA ROTA CRIADA
│   ├── layout.tsx                           (Metadata + wrapper)
│   └── page.tsx                             (Página principal)
│
├── cosmos/
│   ├── context/
│   │   └── YearContext.tsx                  ✓ (Contexto de ano lunar)
│   │
│   ├── components/
│   │   ├── SpaceBackground.tsx              ✓ (Background)
│   │   ├── Card.tsx                         ✓ (Container)
│   │   ├── CelestialObject.tsx              ✓ (Luas, Planeta, Sol)
│   │   ├── TodoInput.tsx                    ✓ (Entrada de tarefa)
│   │   ├── SavedTodosPanel.tsx              ✓ (Painel de tarefas)
│   │   ├── IslandsList.tsx                  ✓ (Lista de ilhas)
│   │   ├── AccessibleTabs.tsx               ✓ (Abas)
│   │   ├── EmptyState.tsx                   ✓ (Estado vazio)
│   │   ├── InputWindow.tsx                  ✓ (Janela de input)
│   │   ├── CosmosChatModal.tsx              ✓ (Modal de chat)
│   │   ├── MoonPhase.tsx                    ✓ (Exibição de fase)
│   │   ├── MoonPhaseDisplay.tsx             ✓ (Display de fase)
│   │   ├── MoonPhasesRail.tsx               ✓ (Rail de fases)
│   │   ├── PhaseTag.tsx                     ✓ (Tag de fase)
│   │   ├── GalaxyInnerView.tsx              ✓ (Visualização galáxia)
│   │   ├── LuminousTrail.tsx                ✓ (Trilha luminosa)
│   │   ├── StarfieldBackground.tsx          ✓ (Campo de estrelas)
│   │   └── lua-list/                        ✓ (Componentes de lista)
│   │
│   ├── screens/
│   │   ├── planet.tsx                       ← NOVO - PlanetScreen
│   │   ├── SidePlanetCardScreen.tsx         ✓ (Original)
│   │   ├── HomeScreen.tsx                   ✓ (Tela home)
│   │   ├── SolOrbitScreen.tsx               ✓ (Órbita do sol)
│   │   ├── LuaListScreen.tsx                ✓ (Lista de luas)
│   │   ├── PlanetCardBelowSunScreen.tsx     ✓ (Card abaixo do sol)
│   │   ├── PlanetCardStandaloneScreen.tsx   ✓ (Card standalone)
│   │   ├── GalaxySunsScreen.tsx             ✓ (Galáxia de sóis)
│   │   ├── RingGalaxyScreen.tsx             ✓ (Galáxia em anel)
│   │   ├── ColumnSolLuaPlanetaScreen.tsx    ✓ (Coluna Sol-Lua-Planeta)
│   │   └── EclipseProductivityScreen.tsx    ✓ (Produtividade eclipse)
│   │
│   ├── types/
│   │   ├── index.ts                         ✓ (Exports de tipos)
│   │   ├── screen.ts                        ✓ (Tipos de tela)
│   │   └── ...outros tipos
│   │
│   ├── utils/
│   │   ├── todoStorage.ts                   ✓ (Armazenamento de tarefas)
│   │   ├── phaseVibes.ts                    ✓ (Vibes de fases)
│   │   ├── islandNames.ts                   ✓ (Nomes de ilhas)
│   │   ├── moonPhases.ts                    ✓ (Dados de fases)
│   │   ├── luaList.ts                       ✓ (Utilitários de lista)
│   │   └── insightChatPresets.ts            ✓ (Presets de chat)
│   │
│   ├── hooks/
│   │   └── ...hooks locais
│   │
│   ├── auth/
│   │   └── ...autenticação
│   │
│   ├── page.tsx                             ✓ (Página cosmos)
│   └── types.ts                             ✓ (Tipos cosmos)
│
└── hooks/                                   ✓ (Hooks globais)
    ├── usePhaseInputs.ts                    ✓ (Inputs de fase)
    ├── useFilteredTodos.ts                  ✓ (Filtro de tarefas)
    ├── useIslandNames.ts                    ✓ (Nomes de ilhas)
    ├── useYear.ts                           ✓ (Ano lunar)
    └── ...outros hooks

doc/
├── PLANETA_README.md                        ← NOVO - Resumo
├── PLANETA_INTEGRACAO.md                    ← NOVO - Guia integração
├── PLANETA_ROTA_ESTRUTURA.md                ← NOVO - Estrutura detalhada
├── PLANETA_MAPA_VISUAL.md                   ← NOVO - Diagrama visual
├── PLANETA_CHECKLIST.md                     ← NOVO - Validação
└── ...outros docs
```

## 🎯 Mapa de Importações

### Em `/app/planeta/page.tsx`
```tsx
import React from 'react';
import { YearProvider } from '@/app/cosmos/context/YearContext';
import { SpaceBackground } from '@/app/cosmos/components/SpaceBackground';
import PlanetScreen from '@/app/cosmos/screens/planet';
import type { ScreenProps } from '@/app/cosmos/types';
```

### Em `/app/cosmos/screens/planet.tsx`
```tsx
// React
import React, { useEffect, useMemo, useRef, useState } from 'react';

// Componentes locais
import { CelestialObject } from '../components/CelestialObject';
import { Card } from '../components/Card';
import TodoInput from '../components/TodoInput';
import { SavedTodosPanel } from '../components/SavedTodosPanel';
import { IslandsList } from '../components/IslandsList';

// Tipos
import type { ScreenProps } from '../types';
import type { IslandId } from '../types/screen';

// Utils
import {
  loadSavedTodos,
  phaseLabels,
  saveSavedTodos,
  type MoonPhase,
  type SavedTodo,
} from '../utils/todoStorage';
import { PHASE_VIBES } from '../utils/phaseVibes';
import { getIslandLabel, type IslandNames } from '../utils/islandNames';

// Hooks globais
import { usePhaseInputs } from '@/hooks/usePhaseInputs';
import { useFilteredTodos, type FilterState } from '@/hooks/useFilteredTodos';
import { useIslandNames } from '@/hooks/useIslandNames';
```

## 🔗 Grafo de Dependências

```
/app/planeta/page.tsx
  ├── YearProvider
  │   └── (Context React)
  ├── SpaceBackground
  │   └── CSS + Animations
  ├── PlanetScreen
  │   ├── CelestialObject
  │   │   └── Framer Motion + CSS
  │   ├── Card
  │   │   └── CSS
  │   ├── TodoInput
  │   │   ├── React hooks
  │   │   └── Utils
  │   ├── SavedTodosPanel
  │   │   ├── useFilteredTodos
  │   │   ├── todoStorage
  │   │   └── Components
  │   ├── IslandsList
  │   │   ├── useIslandNames
  │   │   ├── islandNames utils
  │   │   └── CelestialObject
  │   └── FiltersPanel
  │       └── UI components
  └── ScreenProps type
```

## 📊 Matriz de Responsabilidades

| Arquivo | Responsabilidade | Camada |
|---------|------------------|--------|
| /app/planeta/page.tsx | Integrar tela com contexto | 1 (Rota) |
| /app/planeta/layout.tsx | Metadata e styling base | 1 (Rota) |
| planet.tsx | Lógica e UI da tela | 4 (Screen) |
| CelestialObject.tsx | Renderizar celestiais | 5 (Component) |
| Card.tsx | Container com estilo | 5 (Component) |
| TodoInput.tsx | Input de nova tarefa | 5 (Component) |
| SavedTodosPanel.tsx | Exibir tarefas salvas | 5 (Component) |
| IslandsList.tsx | Exibir e gerenciar ilhas | 5 (Component) |
| usePhaseInputs | Salvar inputs em fases | 6 (Hook) |
| useFilteredTodos | Filtrar tarefas | 6 (Hook) |
| useIslandNames | Gerenciar nomes de ilhas | 6 (Hook) |
| Types | Definições de tipos | 7 (Type) |
| todoStorage | Persistência de tarefas | 8 (Util) |
| phaseVibes | Dados de vibes | 8 (Util) |
| islandNames | Dados de ilhas | 8 (Util) |

## 📦 Pacotes Externos Usados

```json
{
  "dependencies": {
    "react": "^18+",
    "next": "^15+",
    "framer-motion": "^latest",
    "tailwindcss": "^latest"
  }
}
```

## 🔐 Caminhos Relativos vs Absolutos

### Relativos (../):
- Usado dentro de `/app/cosmos/` para importar de mesma pasta
- Exemplo: `import { Card } from '../components/Card'`

### Absolutos (@/):
- Usado para importar de fora de `/app/cosmos/`
- Exemplo: `import { usePhaseInputs } from '@/hooks/usePhaseInputs'`

## 📍 URLs de Acesso

```
/                           → Home page
/cosmos                     → Cosmos hub (original)
/planeta                    → NOVA ROTA (tela planeta)
/planeta                    → Mesma coisa que acima
```

## 🚀 Inicialização da Rota

1. User acessa: `http://localhost:3000/planeta`
2. Next.js carrega `/app/planeta/layout.tsx`
3. Next.js carrega `/app/planeta/page.tsx`
4. PlanetaPage renderiza:
   - YearProvider (contexto)
   - SpaceBackground (bg)
   - PlanetScreen (tela)
5. PlanetScreen renderiza:
   - MoonCluster, Planet, Islands, Card com tarefas
   - Toda a interatividade (drag&drop, filtros, etc)

---

**Todas as dependências estão presentes no projeto!** ✨
