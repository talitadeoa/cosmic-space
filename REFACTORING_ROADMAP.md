# Flua Architecture Refactoring Roadmap

## Status: 🎉 ALL PHASES COMPLETE

### Phase 1: ilha → tarefas ✅
- **Status**: COMPLETE
- **Objetivo**: Migrar componentes de teste para estrutura permanente
- **Mudanças**:
  - Moveu `app/ilha/` para `components/tarefas/`
  - Atualizou imports em `app/(app)/tarefas/page.tsx`
  - Deletou pasta vazia `app/ilha/`

### Phase 2: perfil → usuario ✅
- **Status**: COMPLETE
- **Objetivo**: Reorganizar rota de perfil de usuário
- **Mudanças**:
  - Moveu `app/perfil/` para `app/(app)/usuario/`
  - Atualizou navegação em NavMenu, CommunityHeader, galaxia, LuaCycleMenu
  - Manteve funcionalidade idêntica em nova localização

### Phase 3: Extract Storage ✅
- **Status**: COMPLETE
- **Objetivo**: Centralizar lógica de persistência de cliente
- **Mudanças**:
  - ✅ Criou `client/storage/` com módulo centralizado
  - ✅ Migrou 9 arquivos de utils e hooks
  - ✅ Atualizou imports em 35+ arquivos
  - ✅ Removed circular dependencies
  - ✅ Build passa com sucesso

**Estrutura criada:**
```
client/storage/
├── use-local-storage.ts      # Hook genérico de localStorage
├── device-id.ts             # Identificação do dispositivo
├── sync-outbox.ts           # Fila de sincronização (IndexedDB)
├── islands.ts               # Tipos das ilhas
├── island-names.ts          # Storage de nomes
├── island-meta.ts           # Metadados das ilhas
├── todos.ts                 # Storage de tarefas
├── planet-state.ts          # Estado do planeta
├── planet-state-meta.ts     # Metadados do estado
└── index.ts                 # Barrel export
```

### Phase 4: Extract Types ✅
- **Status**: COMPLETE
- **Objetivo**: Centralizar tipos compartilhados
- **Mudanças**:
  - ✅ Criou `shared/types/planetState.ts` com tipos consolidados
  - ✅ Atualizou `shared/types/index.ts` para exportar novos tipos
  - ✅ Atualizou `/types/planetState.ts` como re-export deprecado
  - ✅ Atualizou `/types/todo.ts` como re-export deprecado
  - ✅ `/types/moon.ts` já estava como re-export de `@/domains/lunar-cycle`
  - ✅ `/types/inputs.ts` já estava como re-export de `@/shared/types`
  - ✅ Build passa com sucesso

**Estrutura atualizada:**
```
shared/types/
├── api.ts           # ApiResponse, ApiError, FetchState
├── gestures.ts      # Gesture types
├── inputs.ts        # FormEntryType, PhaseInputType, TodoInputType
├── planetState.ts   # PlanetUiState, PlanetFiltersState, IslandId (NOVO)
├── timeline.ts      # Timeline types
└── index.ts         # Barrel export

types/                # (deprecados - re-exports)
├── moon.ts          → @/domains/lunar-cycle/types/moon
├── inputs.ts        → @/shared/types/inputs
├── planetState.ts   → @/shared/types/planetState
├── todo.ts          → re-exports com deprecated markers
└── index.ts         # Barrel export
```

**Benefício**: Tipos centralizados em `shared/types` e `domains/*/types`, com backwards compatibility via re-exports deprecados.

---

## Próximas Fases

### Phase 5: Create Server Directory ✅
- **Status**: COMPLETE
- **Objetivo**: Separar lógica server-only
- **Mudanças**:
  - ✅ Criou `server/` com módulo centralizado
  - ✅ Moveu 10 arquivos server-only de `lib/` para `server/`
  - ✅ Criou `server/index.ts` como barrel export
  - ✅ Atualizou `lib/db.ts` e `lib/auth.ts` para re-exports deprecados
  - ✅ Build passa com sucesso

**Estrutura criada:**
```
server/
├── index.ts            # Barrel export centralizado
├── db.ts               # Database connection (Neon)
├── auth.ts             # Auth tokens & passwords
├── forms.ts            # Form processing & insights
├── sheets.ts           # Google Sheets integration
├── timeline.ts         # Timeline data
├── phaseInputs.ts      # Phase input logic
├── planetTodos.ts      # Planet todos server logic
├── planetState.ts      # Planet state server logic
├── logger.ts           # Centralized logging
└── validators.ts       # Server-side validators
```

**Uso:**
```typescript
// Antes (deprecado)
import { getDb } from '@/lib/db';
import { saveFormEntry } from '@/lib/forms';

// Agora
import { getDb, saveFormEntry, logger } from '@/server';
```

### Phase 6: Consolidate Hooks ✅
- **Status**: COMPLETE
- **Objetivo**: Organizar hooks por domínio
- **Mudanças**:
  - ✅ Criou `client/hooks/` com 9 subpastas por domínio
  - ✅ Moveu 24 hooks de `hooks/` e `lib/hooks/`
  - ✅ Criou `client/hooks/index.ts` como barrel export
  - ✅ Corrigidos imports relativos entre hooks
  - ✅ Build passa com sucesso

**Estrutura criada:**
```
client/hooks/
├── index.ts              # Barrel export
├── auth/
│   └── useAuth.ts
├── state/
│   ├── usePlanetState.ts
│   ├── usePlanetTodos.ts
│   ├── useIslandNames.ts
│   └── useFilteredTodos.ts
├── data/
│   ├── useLunationCache.ts
│   ├── usePhaseInputs.ts
│   ├── useInsightsCache.ts
│   ├── useAnnualInsights.ts
│   ├── useMonthlyInsights.ts
│   ├── useQuarterlyInsights.ts
│   └── useGenericInsights.ts
├── gestures/
│   ├── useNativeGestures.ts
│   ├── useHaptics.ts
│   └── useMotion.ts
├── ui/
│   ├── useKeyboardNavigation.ts
│   ├── useMediaQuery.ts
│   └── useDebounce.ts
├── cycle/
│   ├── useCycle.ts
│   ├── useMenstrualCycle.ts
│   ├── useCurrentWeekPhase.ts
│   └── useLunarPhaseUSNO.ts
├── community/
│   └── useCommunityCache.ts
├── sync/
│   └── useGalaxySunsSync.ts
└── other/
    ├── useBrainstormSession.ts
    └── useEmotionalInput.ts
```

**Uso:**
```typescript
// Antes
import { usePlanetState } from '@/hooks/usePlanetState';
import { useNativeGestures } from '@/hooks/useNativeGestures';

// Agora
import { usePlanetState, useNativeGestures } from '@/client/hooks';
// ou importação específica
import { usePlanetState } from '@/client/hooks/state/usePlanetState';
```

### Phase 7: Cleanup Scaffolds ✅
- **Status**: COMPLETE
- **Objetivo**: Remover estrutura vazia e obsoleta
- **Mudanças**:
  - ✅ Analisou `domains/` - **EM USO** (tipos e serviços ativos)
  - ✅ Deletou `features/` - scaffolds vazios, sem código ativo
  - ✅ Manteve `app/cosmos/utils/` - ainda em uso por componentes
  - ✅ Build passa com sucesso

**Resultado:**
- `features/` removido (era scaffold vazio com exports `{}`)
- `domains/` mantido (contém tipos ativos usados por `@/shared/types`)
- `app/cosmos/utils/` mantido (ainda usado por componentes de sync)

---

## 🎉 REFACTORING COMPLETO!

Todas as 7 fases foram concluídas com sucesso!

## Métricas de Progresso

| Phase | Status | Arquivos | Build | Tests |
|-------|--------|----------|-------|-------|
| 1     | ✅     | 5        | ✅    | N/A   |
| 2     | ✅     | 4        | ✅    | N/A   |
| 3     | ✅     | 35+      | ✅    | N/A   |
| 4     | ✅     | 6        | ✅    | N/A   |
| 5     | ✅     | 10       | ✅    | N/A   |
| 6     | ✅     | 24       | ✅    | N/A   |
| 7     | ✅     | 1        | ✅    | N/A   |

---

## Notas Importantes

### Estrutura Final
```
apps/web/
├── client/
│   ├── storage/     # Persistência local (Phase 3)
│   └── hooks/       # Hooks organizados por domínio (Phase 6)
├── server/          # Lógica server-only (Phase 5)
├── hooks/           # Re-exports deprecados
└── lib/             # Re-exports deprecados

shared/types/        # Tipos centralizados (Phase 4)
domains/             # Domínios de negócio (em uso)
types/               # Re-exports deprecados
```

### Imports Recomendados
```typescript
// Tipos
import type { MoonPhase } from '@/shared/types';
import type { SavedTodo } from '@/client/storage';

// Hooks
import { usePlanetState, usePlanetTodos } from '@/client/hooks';

// Server
import { getDb, logger } from '@/server';
```

### Observações
- Arquivos em `/types/`, `/hooks/`, `/lib/` agora são re-exports deprecados
- Novos códigos devem importar de `@/shared/types`, `@/client/hooks`, `@/server`
- Documentação em `doc/` mantém imports antigos (exemplos)

---

## Comandos Úteis

```bash
# Build de teste
npm run build

# TypeScript check
npx tsc --noEmit

# Procurar imports de paths antigos
grep -r "@/types/planetState" --include="*.ts" --include="*.tsx" apps/web/

# Procurar arquivos órfãos
find domains/ features/ -type f 2>/dev/null
```

---

**Last Updated**: 28 de janeiro de 2026
**Commits**: Phase 7 - Cleanup scaffolds (FINAL)
