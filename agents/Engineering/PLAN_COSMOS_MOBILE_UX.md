# 📱 Plano de Implementação: Responsividade e UX Mobile no /cosmos

> **Objetivo**: Criar uma experiência mobile coesa, responsiva e com gestos padronizados em todas as rotas do módulo `/cosmos`

---

## 📋 Visão Geral do Projeto

### Contexto
O módulo `/cosmos` é a experiência principal do app, contendo diversas rotas que representam elementos celestiais (luas, planetas, galáxias, eclipses, sol). Atualmente existe infraestrutura de gestos e navegação, mas precisa de:
- **Padronização** de gestos entre todas as rotas
- **Responsividade** consistente para todos os viewports
- **Otimização** da experiência mobile-first

### Estrutura de Rotas `/cosmos`
```
/cosmos
├── /home           → Tela inicial do cosmos
├── /galaxia        → RingGalaxyExperience
├── /lua            → Lista de luas + timeline
├── /sol            → GalaxySunsExperience + SolOrbitExperience
├── /planeta        → PlanetScreen (drag & drop de tarefas)
├── /eclipse        → EclipseProductivityView
├── /calendarioc    → Calendário C
└── /calendariog    → LunarCalendarWidget
```

### Infraestrutura Existente
- `GestureDetector.tsx` - Componente wrapper para gestos (tap, swipe, pinch, longPress)
- `useUniverseNavigation.ts` - Hook de navegação padronizado
- `CosmosRouteHelper.tsx` - Helper de navegação entre rotas
- Sistema de tipos em `types/gestures.ts`

---

## 🎯 Fases de Implementação

### FASE 1: Auditoria e Diagnóstico (Tasks 1-4)
### FASE 2: Padronização de Gestos (Tasks 5-9)
### FASE 3: Responsividade Mobile-First (Tasks 10-15)
### FASE 4: Integração e Testes (Tasks 16-20)

---

## 📝 TASKS DETALHADAS

---

### TASK 1: Auditoria de Gestos por Rota

**Descrição**: Mapear todos os gestos atualmente implementados em cada rota do /cosmos

**Prompt para Agent**:
```
Analise todas as rotas dentro de /app/cosmos/ e documente:

1. Para cada rota (/home, /galaxia, /lua, /sol, /planeta, /eclipse, /calendarioc, /calendariog):
   - Quais gestos estão implementados (tap, swipe, pinch, longPress)?
   - Está usando GestureDetector ou handlers customizados?
   - Quais elementos são interativos?
   - Como funciona a navegação (usando useUniverseNavigation ou router direto)?

2. Identifique inconsistências:
   - Rotas que não usam GestureDetector
   - Rotas com handlers de gesto customizados não padronizados
   - Elementos que deveriam ser interativos mas não são

3. Documente em formato de tabela:
   | Rota | Gestos | GestureDetector | useUniverseNavigation | Problemas |

Arquivos a analisar:
- app/cosmos/**/page.tsx
- app/cosmos/**/components/**
- app/cosmos/screens/**
```

**Critérios de Aceite**:
- [ ] Tabela completa de gestos por rota
- [ ] Lista de inconsistências identificadas
- [ ] Recomendações de padronização

---

### TASK 2: Auditoria de Responsividade

**Descrição**: Analisar o estado atual da responsividade em cada rota

**Prompt para Agent**:
```
Analise a responsividade atual de cada rota em /app/cosmos/:

1. Para cada rota, verifique:
   - Uso de breakpoints Tailwind (sm:, md:, lg:, xl:)
   - Uso de min-h-[100dvh] vs min-h-screen
   - Containers com overflow correto
   - Padding/margin responsivo
   - Tamanhos de fonte responsivos
   - Elementos que estouram a viewport no mobile

2. Busque por patterns de código:
   - Classes fixas que quebram em mobile (w-[500px], h-[600px])
   - Grids não responsivos
   - Flexbox sem wrap
   - Posicionamento absoluto problemático

3. Use grep para buscar em app/cosmos/**:
   - "w-\[" e "h-\[" (valores fixos)
   - "grid-cols-" sem variantes responsivas
   - "hidden" sem variantes (elementos escondidos incorretamente)

4. Documente em formato:
   | Rota | Viewport | Problema | Arquivo:Linha | Severidade |
   
   Severidade: 🔴 Crítico | 🟡 Médio | 🟢 Menor
```

**Critérios de Aceite**:
- [ ] Mapeamento completo de problemas de responsividade
- [ ] Severidade classificada
- [ ] Arquivo e linha de cada problema

---

### TASK 3: Definição de Breakpoints Padrão

**Descrição**: Criar documento de padrões de breakpoints e tamanhos para o módulo /cosmos

**Prompt para Agent**:
```
Crie um documento de padrões de breakpoints para /cosmos:

1. Analise o tailwind.config.ts atual
2. Defina breakpoints semânticos para o cosmos:
   - mobile-portrait: 0-480px
   - mobile-landscape: 481-768px
   - tablet: 769-1024px
   - desktop: 1025px+

3. Crie padrões de tamanho para elementos celestiais:
   - CelestialObject sizes em cada breakpoint
   - Padding padrão para containers
   - Gaps padrão para grids/flex
   - Tamanhos de fonte por hierarquia

4. Documente patterns de layout:
   - Stack vertical em mobile
   - Grid em tablet+
   - Navegação bottom em mobile, side em desktop

5. Crie um arquivo: doc/COSMOS_RESPONSIVE_STANDARDS.md

6. Crie utilitários CSS se necessário em app/cosmos/styles/
```

**Critérios de Aceite**:
- [ ] Documento de padrões criado
- [ ] Breakpoints definidos e documentados
- [ ] Exemplos de uso para cada pattern

---

### TASK 4: Mapeamento de Touch Targets

**Descrição**: Garantir que todos os elementos interativos tenham touch targets de 44x44px mínimo

**Prompt para Agent**:
```
Audite e corrija touch targets no /cosmos:

1. Segundo as guidelines de acessibilidade (WCAG 2.5.5), touch targets devem ter mínimo 44x44 CSS pixels

2. Para cada rota em /app/cosmos/, identifique:
   - Botões e links
   - Elementos com onClick/onTouchStart
   - Elementos dentro de GestureDetector
   - Ícones de navegação

3. Verifique se cada elemento tem:
   - min-w-[44px] min-h-[44px] ou equivalente
   - Padding suficiente se o conteúdo for menor
   - Espaçamento adequado entre touch targets (8px mínimo)

4. Crie lista de correções necessárias:
   | Componente | Arquivo | Tamanho Atual | Correção |

5. Proponha um utilitário:
   - Classe CSS reutilizável para touch targets
   - Componente wrapper se necessário
```

**Critérios de Aceite**:
- [ ] Lista completa de elementos sub-dimensionados
- [ ] Correções propostas
- [ ] Utilitário de touch target criado

---

### TASK 5: Padronizar Navegação com useUniverseNavigation

**Descrição**: Migrar todas as rotas para usar o hook padronizado

**Prompt para Agent**:
```
Migre todas as rotas de /cosmos para usar useUniverseNavigation:

1. Identifique rotas que usam router.push() diretamente:
   - Busque por "useRouter" em app/cosmos/**
   - Busque por "router.push" e "router.replace"

2. Para cada ocorrência, substitua por useUniverseNavigation:
   
   ANTES:
   const router = useRouter();
   router.push('/cosmos/lua');
   
   DEPOIS:
   const { navigateTo } = useUniverseNavigation();
   navigateTo('luaList');

3. Atualize o mapeamento de ScreenId em app/cosmos/types.ts se necessário

4. Garanta que navegações com animação usem navigateWithFocus:
   - Cliques em CelestialObject
   - Transições com zoom
   - Qualquer navegação que precisa de contexto de origem

5. Verifique se o histórico de navegação está sendo preenchido corretamente
```

**Critérios de Aceite**:
- [ ] Nenhum uso direto de router.push() no módulo cosmos
- [ ] Todas as navegações passam pelo hook
- [ ] Histórico funcionando para navigateBack()

---

### TASK 6: Implementar Swipe Navigation Padrão

**Descrição**: Criar navegação por swipe horizontal entre rotas principais

**Prompt para Agent**:
```
Implemente navegação por swipe horizontal no /cosmos:

1. Defina a ordem de navegação por swipe:
   home ↔ galaxia ↔ lua ↔ sol ↔ planeta ↔ eclipse

2. Crie um hook useCosmosSwipeNavigation:
   - Detecta swipe left/right
   - Navega para próxima/anterior na ordem
   - Usa navigateTo internamente
   - Respeita a rota atual

3. Integre com GestureDetector:
   - Wrapper em cada page.tsx
   - Threshold de 50px para ativar
   - Debounce para evitar navegações múltiplas
   - Visual feedback durante swipe (opcional)

4. Não deve interferir com:
   - Scroll vertical
   - Interações dentro de cards
   - Drag and drop (planeta)
   - Pinch zoom

5. Arquivo: app/cosmos/hooks/useCosmosSwipeNavigation.ts

Exemplo de uso:
\`\`\`tsx
const { swipeHandlers } = useCosmosSwipeNavigation();

<GestureDetector {...swipeHandlers}>
  <PageContent />
</GestureDetector>
\`\`\`
```

**Critérios de Aceite**:
- [ ] Hook criado e documentado
- [ ] Swipe funciona em todas as rotas principais
- [ ] Não interfere com outras interações
- [ ] Navegação circular ou limitada (definir)

---

### TASK 7: Padronizar Pull-to-Refresh

**Descrição**: Implementar pull-to-refresh onde aplicável

**Prompt para Agent**:
```
Implemente pull-to-refresh padronizado no /cosmos:

1. Identifique rotas que precisam de refresh:
   - /lua (lista de luas)
   - /planeta (tarefas)
   - Outras com dados dinâmicos

2. Crie componente PullToRefresh:
   - Detecta swipe down no topo da página
   - Mostra indicador visual (spinner cósmico)
   - Dispara callback onRefresh
   - Threshold de 60px
   - Animação suave

3. Arquivo: app/cosmos/components/PullToRefresh.tsx

4. Integre com loading states existentes

5. Exemplo de uso:
\`\`\`tsx
<PullToRefresh onRefresh={reloadData} isLoading={isLoading}>
  <ScrollableContent />
</PullToRefresh>
\`\`\`

6. Considere:
   - Não ativar quando há scroll interno
   - Haptic feedback em mobile (vibração leve)
   - Cancelar se arrastar para cima novamente
```

**Critérios de Aceite**:
- [ ] Componente PullToRefresh criado
- [ ] Integrado em rotas com dados dinâmicos
- [ ] Visual feedback adequado

---

### TASK 8: Padronizar Long Press Actions

**Descrição**: Criar menu de contexto padronizado para long press

**Prompt para Agent**:
```
Padronize ações de long press no /cosmos:

1. Identifique elementos que devem ter long press:
   - CelestialObject (mostrar detalhes rápidos)
   - Itens de lista de tarefas (menu de ações)
   - Luas (preview de fase)
   - Qualquer elemento com ações secundárias

2. Crie componente ContextMenu:
   - Ativado por long press (500ms)
   - Posicionado próximo ao elemento
   - Animação de entrada suave
   - Backdrop para fechar
   - Acessível via teclado (menu role)

3. Arquivo: app/cosmos/components/ContextMenu.tsx

4. Crie hook useLongPressMenu:
\`\`\`tsx
const { menuProps, triggerProps, isOpen } = useLongPressMenu({
  items: [
    { label: 'Editar', icon: 'edit', action: handleEdit },
    { label: 'Deletar', icon: 'trash', action: handleDelete, destructive: true },
  ]
});
\`\`\`

5. Integre com GestureDetector onLongPress

6. Considere haptic feedback no long press
```

**Critérios de Aceite**:
- [ ] ContextMenu componente criado
- [ ] Hook useLongPressMenu criado
- [ ] Integrado em pelo menos 3 elementos
- [ ] Acessibilidade implementada

---

### TASK 9: Padronizar Pinch-to-Zoom

**Descrição**: Implementar zoom em elementos que suportam

**Prompt para Agent**:
```
Implemente pinch-to-zoom onde aplicável no /cosmos:

1. Identifique elementos que devem suportar zoom:
   - Galáxia em /galaxia (zoom no anel)
   - Sol em /sol (zoom na órbita)
   - Calendário em /calendariog
   - Timeline em /lua/timeline

2. Crie hook usePinchZoom:
   - Detecta pinch via GestureDetector
   - Calcula escala baseado na distância dos dedos
   - Limita escala mínima/máxima (0.5x - 3x)
   - Suave com transformações CSS
   - Ponto focal no centro do pinch

3. Arquivo: app/cosmos/hooks/usePinchZoom.ts

4. Exemplo de uso:
\`\`\`tsx
const { scale, transform, pinchHandlers } = usePinchZoom({
  minScale: 0.5,
  maxScale: 3,
  onZoomChange: (scale) => console.log(scale),
});

<GestureDetector onPinch={pinchHandlers.onPinch}>
  <div style={{ transform }}>
    <ZoomableContent />
  </div>
</GestureDetector>
\`\`\`

5. Considere:
   - Double tap para zoom 2x / reset
   - Transição suave ao soltar
   - Pan quando em zoom
```

**Critérios de Aceite**:
- [ ] Hook usePinchZoom criado
- [ ] Integrado em galáxia e calendário
- [ ] Double tap to zoom funciona
- [ ] Performance suave (60fps)

---

### TASK 10: Refatorar Layout Mobile-First em /home

**Descrição**: Garantir que a home do cosmos seja mobile-first

**Prompt para Agent**:
```
Refatore /cosmos/home para mobile-first:

1. Analise app/cosmos/home/page.tsx e HomeScreen.tsx

2. Aplique padrões mobile-first:
   - min-h-[100dvh] em vez de min-h-screen
   - Padding responsivo: p-4 sm:p-6 md:p-8
   - CelestialObjects em tamanho adequado para touch
   - Navegação acessível com uma mão

3. Layout mobile (< 768px):
   - Elementos empilhados verticalmente
   - Navegação por scroll ou swipe
   - FAB para ações principais

4. Layout tablet+ (≥ 768px):
   - Grid de elementos celestiais
   - Navegação visual pelo espaço

5. Corrija:
   - Elementos que estouram viewport
   - Touch targets muito pequenos
   - Animações que causam jank

6. Teste em viewports:
   - 375px (iPhone SE)
   - 414px (iPhone 14)
   - 768px (iPad Mini)
   - 1024px (iPad Pro)
```

**Critérios de Aceite**:
- [ ] Layout funciona em todos os viewports
- [ ] Elementos não estouram a tela
- [ ] Touch targets adequados
- [ ] Scroll suave

---

### TASK 11: Refatorar Layout Mobile-First em /lua

**Descrição**: Otimizar a lista de luas e timeline para mobile

**Prompt para Agent**:
```
Refatore /cosmos/lua para mobile-first:

1. Analise:
   - app/cosmos/lua/page.tsx
   - app/cosmos/lua/screen/LuaScreen.tsx
   - app/cosmos/lua/timeline/
   - app/cosmos/lua/components/

2. LuaScreen já tem getResponsiveLayout - verifique se está adequado

3. Para lista de luas mobile:
   - Cards de lua em tamanho touch-friendly
   - Scroll horizontal com snap opcional
   - Indicador de posição no scroll

4. Para timeline mobile:
   - Scroll vertical suave
   - Marcadores de mês visíveis
   - Zoom por pinch se necessário

5. Corrija:
   - Grids que não se adaptam
   - Texto cortado
   - Overlays que bloqueiam interação

6. Adicione:
   - Pull-to-refresh para atualizar dados lunares
   - Swipe para navegação entre meses
```

**Critérios de Aceite**:
- [ ] Lista de luas navegável por touch
- [ ] Timeline responsiva
- [ ] Gestos integrados

---

### TASK 12: Refatorar Layout Mobile-First em /planeta

**Descrição**: Otimizar drag & drop de tarefas para mobile

**Prompt para Agent**:
```
Refatore /cosmos/planeta para mobile-first:

1. Analise:
   - app/cosmos/planeta/page.tsx
   - app/cosmos/planeta/components/PlanetScreen.tsx
   - O PlanetScreen já tem comentários sobre ordem mobile

2. Drag & Drop mobile:
   - Verifique se touch drag está funcionando
   - Long press para iniciar drag (vs tap para abrir)
   - Visual feedback durante drag
   - Drop zones claramente indicadas
   - Scroll automático quando perto da borda

3. Layout de colunas:
   - Verificar ordem flexbox em mobile (order-X)
   - Stack vertical em mobile
   - 3 colunas em desktop

4. Cards de tarefa:
   - Tamanho adequado para touch
   - Swipe horizontal para ações rápidas (completar, deletar)
   - Checkbox facilmente tocável

5. Integre:
   - Long press para menu de contexto (Task 8)
   - Swipe actions inline
```

**Critérios de Aceite**:
- [ ] Drag & drop funciona em touch
- [ ] Layout correto em todos os viewports
- [ ] Swipe actions em cards

---

### TASK 13: Refatorar Layout Mobile-First em /galaxia

**Descrição**: Otimizar visualização de galáxia para mobile

**Prompt para Agent**:
```
Refatore /cosmos/galaxia para mobile-first:

1. Analise:
   - app/cosmos/galaxia/page.tsx
   - app/cosmos/galaxia/RingGalaxyExperience.tsx
   - app/cosmos/galaxia/components/
   - app/cosmos/galaxia/layers/

2. A galáxia é uma visualização complexa - para mobile:
   - Simplificar camadas se necessário
   - Garantir que não haja lag
   - Touch pan para explorar
   - Pinch zoom (Task 9)

3. Layout:
   - Usar 100% da viewport
   - Botões de controle não obstruindo a visualização
   - Info overlays em bottom sheet mobile

4. Performance:
   - Reduzir partículas/efeitos em mobile
   - Usar will-change: transform
   - Debounce em interações

5. Acessibilidade:
   - Descrições alternativas para screen readers
   - Modo reduzido de movimento
```

**Critérios de Aceite**:
- [ ] Performance 60fps em mobile
- [ ] Pan e zoom funcionando
- [ ] Controles acessíveis

---

### TASK 14: Refatorar Layout Mobile-First em /eclipse e /sol

**Descrição**: Otimizar visualizações de eclipse e sol

**Prompt para Agent**:
```
Refatore /cosmos/eclipse e /cosmos/sol para mobile-first:

1. Eclipse (/cosmos/eclipse):
   - app/cosmos/eclipse/page.tsx
   - app/cosmos/eclipse/EclipseProductivityView.tsx
   - Visualização fullscreen em mobile
   - Controles de produtividade acessíveis

2. Sol (/cosmos/sol):
   - app/cosmos/sol/page.tsx
   - app/cosmos/sol/GalaxySunsExperience.tsx
   - app/cosmos/sol/SolOrbitExperience.tsx
   - Órbitas visualizáveis em mobile
   - Interação com elementos do sistema solar

3. Para ambos:
   - Layout que usa 100dvh
   - Animações suaves
   - Touch interactions claras
   - Botão de voltar visível

4. Performance:
   - Efeitos visuais otimizados
   - Lazy loading de assets
   - Prefetch de rotas adjacentes
```

**Critérios de Aceite**:
- [ ] Eclipse responsivo
- [ ] Sol responsivo
- [ ] Performance adequada

---

### TASK 15: Refatorar Calendários Mobile-First

**Descrição**: Otimizar calendários para mobile

**Prompt para Agent**:
```
Refatore /cosmos/calendarioc e /cosmos/calendariog para mobile-first:

1. Calendário C (/cosmos/calendarioc):
   - Analisar estrutura atual
   - Grid de dias adequado para touch (min 44px)
   - Navegação entre meses por swipe

2. Calendário G (/cosmos/calendariog):
   - app/cosmos/calendariog/LunarCalendarWidget.tsx
   - Layout grid complexo - simplificar para mobile
   - Duas colunas em desktop, stack em mobile

3. Interações:
   - Tap para selecionar dia
   - Swipe left/right para mês anterior/próximo
   - Long press para ver detalhes do dia

4. Layout mobile:
   - Calendário ocupa largura total
   - Scroll vertical para meses
   - FAB para adicionar evento

5. Visual:
   - Indicadores de fase lunar visíveis
   - Dias com eventos marcados claramente
```

**Critérios de Aceite**:
- [ ] Calendários funcionam em mobile
- [ ] Navegação por swipe
- [ ] Touch targets adequados

---

### TASK 16: Criar Storybook/Exemplos de Gestos

**Descrição**: Documentar todos os gestos com exemplos interativos

**Prompt para Agent**:
```
Crie documentação interativa de gestos:

1. Crie arquivo: doc/EXEMPLOS_GESTOS_COSMOS.tsx

2. Para cada gesto, crie exemplo funcional:
   - Tap: Counter que incrementa
   - Double Tap: Toggle zoom
   - Long Press: Menu de contexto
   - Swipe: Carrossel
   - Pinch: Imagem com zoom

3. Inclua código de exemplo copyable

4. Documente configurações de cada gesto:
   - Thresholds
   - Timeouts
   - Callbacks

5. Se houver Storybook no projeto:
   - Crie stories para GestureDetector
   - Stories para cada variação

6. Crie página de demo: /cosmos/gestures (development only)
   - Área interativa para testar gestos
   - Log de eventos
   - Configurações ajustáveis
```

**Critérios de Aceite**:
- [ ] Documento de exemplos criado
- [ ] Página de demo funcional
- [ ] Todos os gestos documentados

---

### TASK 17: Implementar Safe Areas e Notch Support

**Descrição**: Garantir que o app funciona com notch/dynamic island

**Prompt para Agent**:
```
Implemente suporte a safe areas no /cosmos:

1. Para iPhone com notch/dynamic island:
   - padding-top: env(safe-area-inset-top)
   - padding-bottom: env(safe-area-inset-bottom)
   - padding-left: env(safe-area-inset-left)
   - padding-right: env(safe-area-inset-right)

2. Crie classes utilitárias no tailwind.config.ts ou globals.css:
   - .safe-top
   - .safe-bottom
   - .safe-x
   - .safe-all

3. Aplique em:
   - Headers de navegação
   - Bottom bars/tabs
   - FABs
   - Modais fullscreen
   - Teclado virtual overlap

4. Verifique em capacitor.config.ts:
   - viewport-fit=cover
   - Status bar style

5. Teste cenários:
   - iPhone com notch
   - iPhone com Dynamic Island
   - iPad
   - Android com camera cutout
```

**Critérios de Aceite**:
- [ ] Safe areas implementadas
- [ ] Nenhum conteúdo sob notch
- [ ] Bottom nav não sob home indicator

---

### TASK 18: Otimizar Transições e Animações Mobile

**Descrição**: Garantir animações suaves em dispositivos mobile

**Prompt para Agent**:
```
Otimize animações no /cosmos para mobile:

1. Audite uso de Framer Motion:
   - Busque por motion. em app/cosmos/**
   - Identifique animações pesadas

2. Otimizações:
   - Use transform e opacity (GPU accelerated)
   - Evite animações de width/height
   - Use will-change com moderação
   - Reduce motion for prefers-reduced-motion

3. Implemente prefers-reduced-motion:
\`\`\`tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animationProps = prefersReducedMotion 
  ? {} 
  : { animate: { scale: 1.1 }, transition: { duration: 0.3 } };
\`\`\`

4. Crie hook useReducedMotion:
   - Detecta preferência do sistema
   - Fornece fallbacks para animações

5. Para transições de página:
   - Usar View Transitions API se disponível
   - Fallback suave para navegadores sem suporte

6. Performance targets:
   - 60fps em interações
   - < 100ms response to touch
   - < 300ms para transições
```

**Critérios de Aceite**:
- [ ] Hook useReducedMotion criado
- [ ] Animações respeitam preferência do usuário
- [ ] Performance 60fps verificada

---

### TASK 19: Implementar Offline/Loading States Mobile

**Descrição**: Estados de loading e offline amigáveis para mobile

**Prompt para Agent**:
```
Implemente estados de loading e offline no /cosmos:

1. Loading states:
   - Skeleton screens em vez de spinners
   - Shimmer effect sutil
   - Manter layout estável (no layout shift)

2. Crie componentes:
   - CelestialSkeleton (para objetos celestiais)
   - CardSkeleton (para cards de tarefa)
   - CalendarSkeleton (para calendários)

3. Offline state:
   - Detectar quando offline
   - Mostrar banner amigável
   - Permitir navegação em dados cacheados
   - Fila de ações para sync quando online

4. Arquivo: app/cosmos/components/skeletons/

5. Integre com React Suspense onde apropriado

6. Error boundaries:
   - Componente de erro amigável
   - Botão de retry
   - Fallback visual coerente com tema cosmos
```

**Critérios de Aceite**:
- [ ] Skeleton screens criados
- [ ] Offline detection implementado
- [ ] Error boundaries com UI amigável

---

### TASK 20: Testes E2E Mobile e Checklist Final

**Descrição**: Criar suite de testes e checklist de QA

**Prompt para Agent**:
```
Crie testes e checklist de QA mobile para /cosmos:

1. Checklist de QA Manual:
   - [ ] Todos os touch targets ≥ 44px
   - [ ] Nenhum elemento estourando viewport
   - [ ] Scroll suave
   - [ ] Gestos funcionando
   - [ ] Orientação landscape suportada
   - [ ] Safe areas respeitadas
   - [ ] Teclado virtual não obstrui inputs

2. Matriz de dispositivos:
   - iPhone SE (375px)
   - iPhone 14 (390px)
   - iPhone 14 Pro Max (430px)
   - iPad Mini (768px)
   - iPad Pro 12.9 (1024px)
   - Android típico (360px)

3. Se houver Playwright/Cypress:
   - Crie testes E2E para cada rota
   - Teste gestos com emulação touch
   - Teste em viewports diferentes

4. Arquivo: tests/cosmos-mobile.spec.ts ou doc/QA_CHECKLIST_COSMOS_MOBILE.md

5. Métricas de performance a verificar:
   - Lighthouse mobile score
   - Core Web Vitals
   - Time to Interactive
```

**Critérios de Aceite**:
- [ ] Checklist de QA criado
- [ ] Testes E2E se aplicável
- [ ] Todas as rotas passam no checklist

---

## 📊 Priorização

| Prioridade | Tasks | Justificativa |
|------------|-------|---------------|
| 🔴 Alta | 1, 2, 5, 10, 12 | Fundação + rotas mais usadas |
| 🟡 Média | 3, 4, 6, 11, 14, 17 | Padronização + rotas secundárias |
| 🟢 Normal | 7, 8, 9, 13, 15, 18, 19 | Features incrementais |
| 🔵 Baixa | 16, 20 | Documentação e QA |

---

## 📁 Arquivos a Criar

```
app/cosmos/
├── hooks/
│   ├── useCosmosSwipeNavigation.ts   (Task 6)
│   ├── usePinchZoom.ts               (Task 9)
│   ├── useLongPressMenu.ts           (Task 8)
│   └── useReducedMotion.ts           (Task 18)
├── components/
│   ├── PullToRefresh.tsx             (Task 7)
│   ├── ContextMenu.tsx               (Task 8)
│   └── skeletons/
│       ├── CelestialSkeleton.tsx     (Task 19)
│       ├── CardSkeleton.tsx          (Task 19)
│       └── CalendarSkeleton.tsx      (Task 19)
└── styles/
    └── cosmos-mobile.css             (Task 3, 17)

doc/
├── COSMOS_RESPONSIVE_STANDARDS.md    (Task 3)
├── EXEMPLOS_GESTOS_COSMOS.tsx        (Task 16)
└── QA_CHECKLIST_COSMOS_MOBILE.md     (Task 20)
```

---

## 🔧 Dependências

- `framer-motion` (já instalado)
- Verificar se há necessidade de `@use-gesture/react` para gestos mais avançados

---

## 📝 Notas para Agents

1. **Sempre mantenha retrocompatibilidade** - não quebre funcionalidades existentes
2. **Mobile-first** - escreva CSS mobile primeiro, depois adicione breakpoints maiores
3. **Teste em device real** quando possível, não apenas DevTools
4. **Performance é prioridade** - mobile tem menos recursos
5. **Acessibilidade** - gestos devem ter alternativas de teclado

---

*Documento gerado em: 11/01/2026*
*Versão: 1.0*
