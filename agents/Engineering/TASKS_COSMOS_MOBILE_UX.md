# 🎯 Tasks: Responsividade e UX Mobile - /cosmos

> Arquivo de tracking de tasks para implementação mobile-first

---

## Status Legend
- ⬜ Not Started
- 🔄 In Progress
- ✅ Completed
- 🚫 Blocked

---

## FASE 1: Auditoria e Diagnóstico

### Task 1.1: Auditoria de Gestos por Rota
**Status**: ⬜ Not Started
**Prioridade**: 🔴 Alta
**Estimativa**: 2h

**Objetivo**: Mapear gestos implementados em cada rota

**Arquivos a Analisar**:
- `app/cosmos/**/page.tsx`
- `app/cosmos/**/components/**`
- `app/cosmos/screens/**`

**Entregáveis**:
- [ ] Tabela de gestos por rota
- [ ] Lista de inconsistências
- [ ] Recomendações

---

### Task 1.2: Auditoria de Responsividade
**Status**: ⬜ Not Started
**Prioridade**: 🔴 Alta
**Estimativa**: 2h

**Objetivo**: Identificar problemas de responsividade

**Buscar**:
```bash
grep -r "w-\[" app/cosmos/
grep -r "h-\[" app/cosmos/
grep -r "grid-cols-" app/cosmos/ | grep -v "sm:\|md:\|lg:"
```

**Entregáveis**:
- [ ] Mapa de problemas com severidade
- [ ] Arquivo e linha de cada issue

---

### Task 1.3: Definição de Breakpoints Padrão
**Status**: ⬜ Not Started
**Prioridade**: 🟡 Média
**Estimativa**: 1h

**Objetivo**: Criar padrões de breakpoints

**Criar**:
- `doc/COSMOS_RESPONSIVE_STANDARDS.md`

**Breakpoints**:
- mobile-portrait: 0-480px
- mobile-landscape: 481-768px
- tablet: 769-1024px
- desktop: 1025px+

---

### Task 1.4: Mapeamento de Touch Targets
**Status**: ⬜ Not Started
**Prioridade**: 🟡 Média
**Estimativa**: 2h

**Objetivo**: Garantir touch targets ≥ 44x44px

**Verificar**:
- Botões
- Links
- Elementos com onClick
- Ícones de navegação

---

## FASE 2: Padronização de Gestos

### Task 2.1: Migrar para useUniverseNavigation
**Status**: ⬜ Not Started
**Prioridade**: 🔴 Alta
**Estimativa**: 3h

**Objetivo**: Padronizar navegação

**Buscar e substituir**:
```typescript
// ANTES
const router = useRouter();
router.push('/cosmos/X');

// DEPOIS
const { navigateTo } = useUniverseNavigation();
navigateTo('X');
```

**Arquivos conhecidos com router direto**:
- `app/cosmos/home/page.tsx`
- `app/cosmos/galaxia/page.tsx`
- Outros a identificar

---

### Task 2.2: Implementar Swipe Navigation
**Status**: ⬜ Not Started
**Prioridade**: 🟡 Média
**Estimativa**: 3h

**Objetivo**: Navegação horizontal por swipe

**Criar**:
- `app/cosmos/hooks/useCosmosSwipeNavigation.ts`

**Ordem de navegação**:
```
home ↔ galaxia ↔ lua ↔ sol ↔ planeta ↔ eclipse
```

**Configuração**:
- Threshold: 50px
- Não interferir com scroll vertical

---

### Task 2.3: Implementar Pull-to-Refresh
**Status**: ⬜ Not Started
**Prioridade**: 🟢 Normal
**Estimativa**: 2h

**Objetivo**: Refresh em rotas com dados dinâmicos

**Criar**:
- `app/cosmos/components/PullToRefresh.tsx`

**Rotas**:
- `/lua`
- `/planeta`

---

### Task 2.4: Padronizar Long Press
**Status**: ⬜ Not Started
**Prioridade**: 🟢 Normal
**Estimativa**: 3h

**Objetivo**: Menu de contexto via long press

**Criar**:
- `app/cosmos/components/ContextMenu.tsx`
- `app/cosmos/hooks/useLongPressMenu.ts`

---

### Task 2.5: Implementar Pinch-to-Zoom
**Status**: ⬜ Not Started
**Prioridade**: 🟢 Normal
**Estimativa**: 3h

**Objetivo**: Zoom em visualizações complexas

**Criar**:
- `app/cosmos/hooks/usePinchZoom.ts`

**Aplicar em**:
- `/galaxia`
- `/calendariog`
- `/lua/timeline`

---

## FASE 3: Responsividade Mobile-First

### Task 3.1: Refatorar /home
**Status**: ⬜ Not Started
**Prioridade**: 🔴 Alta
**Estimativa**: 2h

**Arquivos**:
- `app/cosmos/home/page.tsx`
- `app/cosmos/screens/HomeScreen.tsx`

**Checklist**:
- [ ] min-h-[100dvh]
- [ ] Padding responsivo
- [ ] Touch targets adequados
- [ ] Layout stack em mobile

---

### Task 3.2: Refatorar /lua
**Status**: ⬜ Not Started
**Prioridade**: 🟡 Média
**Estimativa**: 3h

**Arquivos**:
- `app/cosmos/lua/page.tsx`
- `app/cosmos/lua/screen/LuaScreen.tsx`
- `app/cosmos/lua/timeline/**`

**Checklist**:
- [ ] Lista de luas touch-friendly
- [ ] Timeline responsiva
- [ ] Scroll horizontal com snap

---

### Task 3.3: Refatorar /planeta
**Status**: ⬜ Not Started
**Prioridade**: 🔴 Alta
**Estimativa**: 4h

**Arquivos**:
- `app/cosmos/planeta/page.tsx`
- `app/cosmos/planeta/components/PlanetScreen.tsx`

**Checklist**:
- [ ] Drag & drop touch funcional
- [ ] Layout 3 colunas → stack
- [ ] Swipe actions em cards
- [ ] Long press para menu

---

### Task 3.4: Refatorar /galaxia
**Status**: ⬜ Not Started
**Prioridade**: 🟢 Normal
**Estimativa**: 3h

**Arquivos**:
- `app/cosmos/galaxia/page.tsx`
- `app/cosmos/galaxia/RingGalaxyExperience.tsx`

**Checklist**:
- [ ] Performance 60fps
- [ ] Pan e zoom
- [ ] Reduzir efeitos em mobile

---

### Task 3.5: Refatorar /eclipse e /sol
**Status**: ⬜ Not Started
**Prioridade**: 🟡 Média
**Estimativa**: 3h

**Arquivos**:
- `app/cosmos/eclipse/**`
- `app/cosmos/sol/**`

**Checklist**:
- [ ] Fullscreen responsivo
- [ ] Controles acessíveis
- [ ] Performance otimizada

---

### Task 3.6: Refatorar Calendários
**Status**: ⬜ Not Started
**Prioridade**: 🟢 Normal
**Estimativa**: 3h

**Arquivos**:
- `app/cosmos/calendarioc/**`
- `app/cosmos/calendariog/**`

**Checklist**:
- [ ] Grid de dias touch-friendly
- [ ] Swipe para meses
- [ ] Stack em mobile

---

## FASE 4: Integração e Testes

### Task 4.1: Documentação de Gestos
**Status**: ⬜ Not Started
**Prioridade**: 🔵 Baixa
**Estimativa**: 2h

**Criar**:
- `doc/EXEMPLOS_GESTOS_COSMOS.tsx`
- Página de demo opcional

---

### Task 4.2: Safe Areas e Notch
**Status**: ⬜ Not Started
**Prioridade**: 🟡 Média
**Estimativa**: 2h

**Implementar**:
- Classes utilitárias safe-*
- Verificar capacitor.config.ts

---

### Task 4.3: Otimizar Animações
**Status**: ⬜ Not Started
**Prioridade**: 🟢 Normal
**Estimativa**: 2h

**Criar**:
- `app/cosmos/hooks/useReducedMotion.ts`

**Implementar**:
- prefers-reduced-motion support
- GPU-accelerated transforms

---

### Task 4.4: Loading e Offline States
**Status**: ⬜ Not Started
**Prioridade**: 🟢 Normal
**Estimativa**: 3h

**Criar**:
- `app/cosmos/components/skeletons/CelestialSkeleton.tsx`
- `app/cosmos/components/skeletons/CardSkeleton.tsx`

---

### Task 4.5: QA Checklist e Testes
**Status**: ⬜ Not Started
**Prioridade**: 🔵 Baixa
**Estimativa**: 2h

**Criar**:
- `doc/QA_CHECKLIST_COSMOS_MOBILE.md`
- Testes E2E se aplicável

---

## 📊 Resumo de Estimativas

| Fase | Tasks | Estimativa Total |
|------|-------|-----------------|
| Fase 1 | 4 | ~7h |
| Fase 2 | 5 | ~14h |
| Fase 3 | 6 | ~18h |
| Fase 4 | 5 | ~11h |
| **Total** | **20** | **~50h** |

---

## 🚀 Ordem de Execução Sugerida

**Sprint 1 (Alta Prioridade)**:
1. Task 1.1 - Auditoria de Gestos
2. Task 1.2 - Auditoria de Responsividade
3. Task 2.1 - Migrar useUniverseNavigation
4. Task 3.1 - Refatorar /home
5. Task 3.3 - Refatorar /planeta

**Sprint 2 (Média Prioridade)**:
6. Task 1.3 - Breakpoints Padrão
7. Task 1.4 - Touch Targets
8. Task 2.2 - Swipe Navigation
9. Task 3.2 - Refatorar /lua
10. Task 3.5 - Refatorar /eclipse e /sol
11. Task 4.2 - Safe Areas

**Sprint 3 (Normal/Baixa)**:
12. Task 2.3 - Pull-to-Refresh
13. Task 2.4 - Long Press
14. Task 2.5 - Pinch-to-Zoom
15. Task 3.4 - Refatorar /galaxia
16. Task 3.6 - Refatorar Calendários
17. Task 4.3 - Otimizar Animações
18. Task 4.4 - Loading States
19. Task 4.1 - Documentação
20. Task 4.5 - QA Checklist

---

## 📝 Notas

- Cada task pode ser executada independentemente por um agent
- Sempre rodar build após mudanças: `npm run build`
- Testar em viewports: 375px, 414px, 768px, 1024px
- Manter compatibilidade com código existente

---

*Última atualização: 11/01/2026*
