# Flua Architecture Refactoring Roadmap

## Status: Phase 4 ✅ Complete

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

### Phase 5: Create Server Directory 🔄
- **Objetivo**: Separar lógica server-only
- **Escopo**: Criar estrutura de servidor no `server/`

**Estrutura proposta:**
```
server/
├── db.ts               # Database connection (from lib/db.ts)
├── auth.ts             # Auth logic (from lib/auth.ts)
├── forms.ts            # Form processing (from lib/forms.ts)
├── sheets.ts           # Google Sheets integration
├── timeline.ts         # Timeline data
├── phaseInputs.ts      # Phase input logic
├── planetTodos.ts      # Planet todos server logic
├── planetState.ts      # Planet state server logic
└── sync/               # Sync endpoints
    ├── island.ts
    ├── planet-todos.ts
    └── planet-state.ts
```

- **Mudanças**:
  - Mover arquivos `server-only` de `lib/` para `server/`
  - Atualizar imports em `app/api/**`
  - Manter padrão `import 'server-only'`

### Phase 6: Consolidate Hooks 🔄
- **Objetivo**: Organizar hooks por domínio
- **Escopo**: Mover e reorganizar em `client/hooks/`

**Estrutura proposta:**
```
client/hooks/
├── auth/
│   ├── useAuth.ts
│   └── useAuthGuard.ts
├── state/
│   ├── usePlanetState.ts
│   ├── usePlanetTodos.ts
│   └── useIslandNames.ts
├── data/
│   ├── useLunations.ts
│   ├── usePhaseInputs.ts
│   └── useLunationCache.ts
├── gestures/
│   └── useTodoGestures.ts
└── index.ts
```

- **Mudanças**: ~15 hooks para reorganizar
- **Benefício**: Melhor descobertabilidade e manutenção

### Phase 7: Cleanup Scaffolds 🔄
- **Objetivo**: Remover estrutura vazia e obsoleta
- **Mudanças**:
  - ❌ Deletar `domains/` (vazio)
  - ❌ Deletar `features/` (vazio)
  - ❌ Revisar e deletar componentes obsoletos em `app/cosmos/utils/`
  - ✅ Validar que nenhum arquivo importa desses diretórios

---

## Métricas de Progresso

| Phase | Status | Arquivos | Build | Tests |
|-------|--------|----------|-------|-------|
| 1     | ✅     | 5        | ✅    | N/A   |
| 2     | ✅     | 4        | ✅    | N/A   |
| 3     | ✅     | 35+      | ✅    | N/A   |
| 4     | ✅     | 6        | ✅    | N/A   |
| 5     | ⏳     | ~10      | TBD   | TBD   |
| 6     | ⏳     | ~15      | TBD   | TBD   |
| 7     | ⏳     | N/A      | TBD   | TBD   |

---

## Notas Importantes

### Circular Dependencies Resolvidas
- `hooks/` → `app/cosmos/utils/` (RESOLVIDO pela Phase 3)
  - Hooks agora importam de `@/client/storage` em vez de `@/app/cosmos/utils`

### Próximos Passos Críticos
1. **Phase 5** requer testes de API antes de mesclar
2. **Phase 6** é refactoring puro, pode ser feito em paralelo
3. **Phase 7** é limpeza final

### Observações
- Arquivos em `/types/` agora são re-exports deprecados
- Novos códigos devem importar de `@/shared/types` ou `@/domains/*/types`
- `@/client/storage` é a fonte para tipos de storage do cliente
- Documentação em `doc/` ficará com imports antigos (exemplos)

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
**Commits**: Phase 4 - Consolidate types to shared/types
