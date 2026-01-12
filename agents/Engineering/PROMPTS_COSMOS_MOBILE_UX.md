# 🤖 Prompts para Agents - Cosmos Mobile UX

> Prompts prontos para copiar e colar para cada task

---

## Como Usar

1. Copie o prompt da task desejada
2. Cole no chat do agent de IA
3. O agent executará a task e reportará os resultados
4. Valide as mudanças e marque a task como concluída

---

## FASE 1: Auditoria e Diagnóstico

---

### PROMPT 1.1: Auditoria de Gestos

```
Você é um engenheiro mobile especializado em UX. Sua tarefa é auditar todos os gestos implementados nas rotas do módulo /cosmos.

## Contexto
O projeto usa:
- React/Next.js
- GestureDetector em app/cosmos/components/GestureDetector.tsx
- useUniverseNavigation em app/cosmos/hooks/useUniverseNavigation.ts
- Tipos de gestos em types/gestures.ts

## Tarefa
Analise TODAS as rotas em app/cosmos/ e documente:

1. Para cada rota (/home, /galaxia, /lua, /sol, /planeta, /eclipse, /calendarioc, /calendariog):
   - Quais gestos estão implementados (tap, swipe, pinch, longPress)?
   - Está usando GestureDetector ou handlers customizados?
   - Quais elementos são interativos (onClick, onTouchStart)?
   - Usa useUniverseNavigation ou router.push direto?

2. Crie uma tabela em Markdown:
| Rota | Gestos Implementados | Usa GestureDetector | Usa useUniverseNavigation | Problemas Identificados |

3. Liste todas as inconsistências encontradas

4. Forneça recomendações de padronização

## Arquivos a analisar
- app/cosmos/**/page.tsx
- app/cosmos/**/components/**/*.tsx
- app/cosmos/screens/*.tsx

## Output esperado
Um documento Markdown com a análise completa.
```

---

### PROMPT 1.2: Auditoria de Responsividade

```
Você é um engenheiro front-end especializado em responsividade mobile. Sua tarefa é auditar problemas de responsividade no módulo /cosmos.

## Contexto
O projeto usa Tailwind CSS com breakpoints padrão (sm, md, lg, xl).

## Tarefa
1. Busque por patterns problemáticos em app/cosmos/**:
   - Larguras/alturas fixas: w-[XXXpx], h-[XXXpx]
   - Grids sem breakpoints responsivos
   - Elementos que podem estourar viewport em mobile
   - min-h-screen em vez de min-h-[100dvh]
   - Padding/margin fixos grandes

2. Para cada problema encontrado, documente:
   - Arquivo e linha
   - Problema específico
   - Severidade (🔴 Crítico, 🟡 Médio, 🟢 Menor)
   - Correção sugerida

3. Crie tabela:
| Arquivo | Linha | Problema | Severidade | Correção |

4. Priorize os problemas por impacto no mobile

## Comandos úteis para grep
grep -rn "w-\[" app/cosmos/
grep -rn "h-\[" app/cosmos/
grep -rn "grid-cols-[0-9]" app/cosmos/ (sem sm:/md:/lg:)

## Output esperado
Documento com todos os problemas mapeados e correções sugeridas.
```

---

### PROMPT 1.3: Definição de Breakpoints

```
Você é um design system engineer. Sua tarefa é criar um documento de padrões de responsividade para o módulo /cosmos.

## Contexto
- Projeto usa Tailwind CSS
- É um app híbrido (web + Capacitor para mobile)
- Tema é espacial/cósmico

## Tarefa
1. Analise o tailwind.config.ts atual

2. Crie documento doc/COSMOS_RESPONSIVE_STANDARDS.md com:

### Breakpoints Semânticos
- mobile-portrait: 0-480px (target principal)
- mobile-landscape: 481-768px
- tablet: 769-1024px
- desktop: 1025px+

### Padrões de Tamanho
Para cada breakpoint, defina:
- Tamanhos de CelestialObject (xs, sm, md, lg, xl)
- Padding de containers
- Gaps de grids/flex
- Tamanhos de fonte (h1, h2, body, small)

### Patterns de Layout
- Mobile: stack vertical, navegação bottom
- Tablet: grid 2 colunas, navegação side ou bottom
- Desktop: grid 3+ colunas, navegação side

### Exemplos de Código
Para cada pattern, inclua exemplo de Tailwind classes

## Output esperado
Arquivo COSMOS_RESPONSIVE_STANDARDS.md completo e pronto para uso.
```

---

### PROMPT 1.4: Mapeamento de Touch Targets

```
Você é um especialista em acessibilidade mobile. Sua tarefa é garantir que todos os elementos interativos tenham touch targets adequados.

## Contexto
- WCAG 2.5.5 recomenda touch targets de mínimo 44x44 CSS pixels
- Espaçamento mínimo entre targets: 8px

## Tarefa
1. Identifique todos os elementos interativos em app/cosmos/**:
   - Elementos com onClick
   - Elementos com onTouchStart
   - Botões e links
   - Elementos dentro de GestureDetector

2. Verifique o tamanho de cada um:
   - Tem min-w-[44px] min-h-[44px]?
   - Se não, qual o tamanho atual?

3. Crie lista de correções:
| Componente | Arquivo | Tamanho Atual | Correção Necessária |

4. Crie classe utilitária para touch targets:
```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

5. Sugira onde aplicar padding para elementos menores que 44px

## Output esperado
Lista de todos os elementos que precisam de correção + utilitário CSS.
```

---

## FASE 2: Padronização de Gestos

---

### PROMPT 2.1: Migrar para useUniverseNavigation

```
Você é um engenheiro React. Sua tarefa é padronizar toda navegação no /cosmos para usar o hook useUniverseNavigation.

## Contexto
- Hook existente: app/cosmos/hooks/useUniverseNavigation.ts
- Fornece: navigateTo, navigateWithFocus, navigateBack

## Tarefa
1. Encontre todas as ocorrências de navegação direta:
   - Busque por "useRouter" em app/cosmos/**
   - Busque por "router.push" e "router.replace"
   - Busque por window.location

2. Para cada ocorrência, substitua por useUniverseNavigation:

ANTES:
```tsx
const router = useRouter();
router.push('/cosmos/lua');
```

DEPOIS:
```tsx
const { navigateTo } = useUniverseNavigation();
navigateTo('luaList');
```

3. Se precisar de novos ScreenIds, adicione em app/cosmos/types.ts

4. Para navegações com animação de zoom/foco, use navigateWithFocus

5. Verifique se navigateBack está sendo usado para botões de voltar

## Arquivos conhecidos a modificar
- app/cosmos/home/page.tsx
- app/cosmos/galaxia/page.tsx
- (outros que você encontrar)

## Output esperado
Todas as navegações migradas para o hook padronizado.
```

---

### PROMPT 2.2: Implementar Swipe Navigation

```
Você é um engenheiro mobile. Sua tarefa é implementar navegação por swipe horizontal entre as rotas principais do /cosmos.

## Contexto
- GestureDetector já detecta swipes
- useUniverseNavigation já navega entre telas

## Tarefa
1. Crie o hook app/cosmos/hooks/useCosmosSwipeNavigation.ts:

```typescript
export function useCosmosSwipeNavigation() {
  // Ordem de navegação
  const routes = ['home', 'galaxia', 'lua', 'sol', 'planeta', 'eclipse'];
  
  // Detecta rota atual
  // Retorna handlers para swipe left/right
  // Usa navigateTo internamente
  
  return { swipeHandlers, currentIndex, canSwipeLeft, canSwipeRight };
}
```

2. Integre com GestureDetector em cada page.tsx principal

3. Configurações:
   - Threshold: 50px
   - Não ativar em scroll vertical
   - Não interferir com drag & drop em /planeta
   - Debounce de 300ms entre swipes

4. Visual feedback opcional:
   - Indicador de posição (dots)
   - Preview da próxima tela

## Output esperado
Hook criado e integrado em pelo menos /home para demonstração.
```

---

### PROMPT 2.3: Implementar Pull-to-Refresh

```
Você é um engenheiro mobile. Sua tarefa é implementar pull-to-refresh padronizado.

## Tarefa
1. Crie componente app/cosmos/components/PullToRefresh.tsx:

```tsx
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
  threshold?: number; // default 60px
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, isLoading, threshold = 60, children }: PullToRefreshProps) {
  // Detecta swipe down no topo
  // Mostra indicador visual (spinner cósmico)
  // Chama onRefresh quando soltar após threshold
  // Animação suave
}
```

2. O spinner deve seguir o tema cósmico (estrela girando, lua, etc)

3. Comportamento:
   - Só ativa quando scroll está no topo
   - Cancela se arrastar para cima
   - Visual feedback durante pull
   - Loading state enquanto executa

4. Integre em:
   - app/cosmos/lua/page.tsx
   - app/cosmos/planeta/page.tsx

## Output esperado
Componente PullToRefresh funcional e integrado.
```

---

### PROMPT 2.4: Padronizar Long Press

```
Você é um engenheiro mobile. Sua tarefa é criar menu de contexto ativado por long press.

## Tarefa
1. Crie componente app/cosmos/components/ContextMenu.tsx:

```tsx
interface MenuItem {
  label: string;
  icon?: string;
  action: () => void;
  destructive?: boolean;
}

interface ContextMenuProps {
  items: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}
```

2. Crie hook app/cosmos/hooks/useLongPressMenu.ts:

```tsx
export function useLongPressMenu(items: MenuItem[]) {
  // Retorna props para o elemento trigger
  // Retorna props para o ContextMenu
  // Gerencia estado open/close
  // Calcula posição baseado no evento
  
  return { triggerProps, menuProps, isOpen };
}
```

3. Visual do menu:
   - Backdrop semi-transparente
   - Animação de entrada/saída
   - Posicionado perto do elemento
   - Itens destructive em vermelho

4. Integre com GestureDetector onLongPress

5. Acessibilidade:
   - role="menu"
   - Navegação por teclado
   - Escape fecha

## Output esperado
ContextMenu e useLongPressMenu funcionais.
```

---

### PROMPT 2.5: Implementar Pinch-to-Zoom

```
Você é um engenheiro mobile. Sua tarefa é implementar pinch-to-zoom.

## Tarefa
1. Crie hook app/cosmos/hooks/usePinchZoom.ts:

```typescript
interface UsePinchZoomOptions {
  minScale?: number; // default 0.5
  maxScale?: number; // default 3
  onZoomChange?: (scale: number) => void;
}

export function usePinchZoom(options: UsePinchZoomOptions) {
  // Detecta pinch via dois dedos
  // Calcula escala baseado na distância
  // Limita entre min e max
  // Permite pan quando em zoom
  
  return { 
    scale, 
    transform, // string CSS
    pinchHandlers, // para GestureDetector
    resetZoom,
    zoomIn,
    zoomOut
  };
}
```

2. Features:
   - Double tap para zoom 2x ou reset
   - Transição suave ao soltar
   - Pan quando scale > 1
   - Bounce nos limites

3. Integre em:
   - app/cosmos/galaxia/RingGalaxyExperience.tsx
   - app/cosmos/calendariog/LunarCalendarWidget.tsx

4. Performance:
   - Use transform: scale() (GPU accelerated)
   - will-change: transform
   - Evite re-renders desnecessários

## Output esperado
Hook usePinchZoom funcional e integrado em pelo menos /galaxia.
```

---

## FASE 3: Responsividade Mobile-First

---

### PROMPT 3.1: Refatorar /home

```
Você é um engenheiro front-end. Sua tarefa é tornar a home do cosmos mobile-first.

## Arquivos
- app/cosmos/home/page.tsx
- app/cosmos/screens/HomeScreen.tsx

## Tarefa
1. Aplique padrões mobile-first:
   - min-h-[100dvh] em vez de min-h-screen
   - Padding: p-4 sm:p-6 md:p-8
   - Touch targets ≥ 44px

2. Layout mobile (< 768px):
   - Elementos empilhados verticalmente
   - Navegação acessível com uma mão
   - CelestialObjects em tamanho adequado

3. Layout tablet+ (≥ 768px):
   - Grid de elementos celestiais
   - Mais espaço entre elementos

4. Corrija:
   - Elementos que estouram viewport
   - Valores fixos de largura/altura
   - Animações que causam jank

5. Teste em viewports:
   - 375px, 414px, 768px, 1024px

## Checklist
- [ ] min-h-[100dvh] aplicado
- [ ] Padding responsivo
- [ ] Touch targets adequados
- [ ] Layout stack em mobile
- [ ] Nenhum overflow horizontal

## Output esperado
/home totalmente responsivo e mobile-first.
```

---

### PROMPT 3.2: Refatorar /lua

```
Você é um engenheiro front-end. Sua tarefa é otimizar /lua para mobile.

## Arquivos
- app/cosmos/lua/page.tsx
- app/cosmos/lua/screen/LuaScreen.tsx
- app/cosmos/lua/components/**
- app/cosmos/lua/timeline/**

## Tarefa
1. LuaScreen já tem getResponsiveLayout - verifique se está adequado

2. Lista de luas mobile:
   - Cards touch-friendly (min 44px)
   - Scroll horizontal com snap
   - Indicador de posição

3. Timeline mobile:
   - Scroll vertical suave
   - Marcadores de mês visíveis
   - Considere pinch zoom

4. Corrija:
   - Grids não responsivos
   - Texto cortado
   - Overlays bloqueando interação

5. Adicione:
   - Pull-to-refresh (Task 2.3)
   - Swipe entre meses

## Checklist
- [ ] Lista de luas navegável por touch
- [ ] Timeline responsiva
- [ ] Cards com tamanho adequado
- [ ] Scroll suave

## Output esperado
/lua otimizada para mobile.
```

---

### PROMPT 3.3: Refatorar /planeta

```
Você é um engenheiro front-end. Sua tarefa é otimizar /planeta para mobile, especialmente o drag & drop.

## Arquivos
- app/cosmos/planeta/page.tsx
- app/cosmos/planeta/components/PlanetScreen.tsx

## Tarefa
1. Drag & Drop mobile:
   - Verificar se touch drag funciona
   - Long press para iniciar drag (diferente de tap)
   - Visual feedback durante drag
   - Drop zones claramente indicadas
   - Auto-scroll perto das bordas

2. Layout (já tem comentários sobre ordem):
   - Verificar order-X em flexbox
   - Stack vertical em mobile (< 768px)
   - 3 colunas em desktop

3. Cards de tarefa:
   - Touch-friendly (min 44px)
   - Considere swipe horizontal para ações:
     - Swipe direita: completar
     - Swipe esquerda: deletar
   - Checkbox facilmente tocável

4. Integre:
   - Long press para menu de contexto
   - Swipe actions inline

## Checklist
- [ ] Drag & drop funciona em touch
- [ ] Layout correto em mobile
- [ ] Swipe actions opcionais
- [ ] Touch targets adequados

## Output esperado
/planeta com drag & drop funcional em mobile.
```

---

### PROMPT 3.4: Refatorar /galaxia

```
Você é um engenheiro front-end focado em performance. Sua tarefa é otimizar /galaxia para mobile.

## Arquivos
- app/cosmos/galaxia/page.tsx
- app/cosmos/galaxia/RingGalaxyExperience.tsx
- app/cosmos/galaxia/components/**
- app/cosmos/galaxia/layers/**

## Tarefa
1. A galáxia é visualização complexa - para mobile:
   - Simplificar camadas se necessário
   - Reduzir partículas/efeitos
   - Garantir 60fps

2. Interações:
   - Touch pan para explorar
   - Pinch zoom (Task 2.5)
   - Tap em elementos para info

3. Layout:
   - Usar 100% da viewport
   - Controles não obstruindo visualização
   - Info overlays em bottom sheet mobile

4. Performance:
   - will-change: transform
   - requestAnimationFrame para animações
   - Debounce em interações

5. Acessibilidade:
   - prefers-reduced-motion
   - Descrições para screen readers

## Checklist
- [ ] 60fps em mobile
- [ ] Pan e zoom funcionando
- [ ] Controles acessíveis
- [ ] Reduced motion suportado

## Output esperado
/galaxia com performance 60fps em mobile.
```

---

### PROMPT 3.5: Refatorar /eclipse e /sol

```
Você é um engenheiro front-end. Sua tarefa é otimizar /eclipse e /sol para mobile.

## Arquivos /eclipse
- app/cosmos/eclipse/page.tsx
- app/cosmos/eclipse/EclipseProductivityView.tsx
- app/cosmos/eclipse/layers/**

## Arquivos /sol
- app/cosmos/sol/page.tsx
- app/cosmos/sol/GalaxySunsExperience.tsx
- app/cosmos/sol/SolOrbitExperience.tsx

## Tarefa
1. Eclipse:
   - Visualização fullscreen responsiva
   - Controles de produtividade acessíveis
   - Animações suaves

2. Sol:
   - Órbitas visualizáveis em mobile
   - Interação com elementos do sistema
   - Layout responsivo

3. Para ambos:
   - min-h-[100dvh]
   - Touch interactions claras
   - Botão de voltar visível
   - Performance otimizada

## Checklist
- [ ] Eclipse responsivo
- [ ] Sol responsivo
- [ ] Performance adequada
- [ ] Navegação clara

## Output esperado
/eclipse e /sol responsivos e funcionais em mobile.
```

---

### PROMPT 3.6: Refatorar Calendários

```
Você é um engenheiro front-end. Sua tarefa é otimizar os calendários para mobile.

## Arquivos
- app/cosmos/calendarioc/**
- app/cosmos/calendariog/LunarCalendarWidget.tsx

## Tarefa
1. Grid de dias:
   - Células touch-friendly (min 44px)
   - Tap para selecionar
   - Visual feedback no tap

2. Navegação entre meses:
   - Swipe left/right
   - Botões prev/next também

3. Layout mobile:
   - Calendário ocupa largura total
   - Stack vertical se houver sidebar
   - FAB para adicionar evento

4. Visual:
   - Indicadores de fase lunar visíveis
   - Dias com eventos marcados
   - Contraste adequado

5. Para LunarCalendarWidget especificamente:
   - Simplificar grid complexo em mobile
   - 2 colunas → 1 coluna em mobile

## Checklist
- [ ] Células ≥ 44px
- [ ] Swipe para meses
- [ ] Layout responsivo
- [ ] Fases lunares visíveis

## Output esperado
Calendários funcionais e bonitos em mobile.
```

---

## FASE 4: Integração e Testes

---

### PROMPT 4.1: Documentação de Gestos

```
Você é um technical writer. Sua tarefa é documentar todos os gestos do /cosmos.

## Tarefa
1. Crie doc/EXEMPLOS_GESTOS_COSMOS.tsx com exemplos interativos:

```tsx
// Exemplo de Tap
export const TapExample = () => {
  const [count, setCount] = useState(0);
  return (
    <GestureDetector onTap={() => setCount(c => c + 1)}>
      <div>Taps: {count}</div>
    </GestureDetector>
  );
};

// Exemplo de Double Tap
// Exemplo de Long Press
// Exemplo de Swipe
// Exemplo de Pinch
```

2. Documente configurações:
   - Thresholds padrão
   - Timeouts
   - Callbacks disponíveis

3. Crie página de demo /cosmos/gestures (development only):
   - Área interativa
   - Log de eventos
   - Configurações ajustáveis

## Output esperado
Documentação completa e página de demo funcional.
```

---

### PROMPT 4.2: Safe Areas e Notch

```
Você é um engenheiro mobile. Sua tarefa é implementar suporte a safe areas.

## Tarefa
1. Crie classes utilitárias em app/globals.css ou app/cosmos/styles/:

```css
.safe-top { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
.safe-x { 
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
.safe-all {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

2. Verifique capacitor.config.ts:
   - viewport-fit=cover

3. Aplique em:
   - Headers de navegação
   - Bottom bars/tabs
   - FABs
   - Modais fullscreen

4. Teste cenários:
   - iPhone com notch
   - iPhone com Dynamic Island
   - Android com camera cutout

## Output esperado
Safe areas implementadas corretamente.
```

---

### PROMPT 4.3: Otimizar Animações

```
Você é um engenheiro focado em performance. Sua tarefa é otimizar animações para mobile.

## Tarefa
1. Crie hook app/cosmos/hooks/useReducedMotion.ts:

```typescript
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
}
```

2. Audite animações em app/cosmos/**:
   - Busque por motion. (Framer Motion)
   - Identifique animações que animam width/height
   - Substitua por transform/opacity

3. Aplique reduced motion:
   - Desabilitar animações complexas
   - Substituir por fades simples

4. Performance targets:
   - 60fps em interações
   - < 100ms response to touch
   - < 300ms para transições

## Output esperado
Animações otimizadas e reduced motion suportado.
```

---

### PROMPT 4.4: Loading e Offline States

```
Você é um engenheiro front-end. Sua tarefa é criar estados de loading e offline.

## Tarefa
1. Crie skeleton components em app/cosmos/components/skeletons/:

CelestialSkeleton.tsx:
```tsx
export function CelestialSkeleton({ size = 'md' }) {
  return (
    <div className="animate-pulse rounded-full bg-slate-700/50" 
         style={{ width: sizeMap[size], height: sizeMap[size] }} />
  );
}
```

CardSkeleton.tsx:
```tsx
export function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-2 rounded-xl bg-slate-700/50 p-4">
      <div className="h-4 w-3/4 rounded bg-slate-600/50" />
      <div className="h-3 w-1/2 rounded bg-slate-600/50" />
    </div>
  );
}
```

2. Crie hook useOfflineDetection:
```typescript
export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(true);
  // Detecta navigator.onLine
  // Escuta eventos online/offline
  return { isOnline, isOffline: !isOnline };
}
```

3. Crie componente OfflineBanner:
   - Banner amigável no topo
   - "Você está offline. Dados podem estar desatualizados."

4. Error boundary com UI amigável:
   - Ilustração cósmica de erro
   - Botão de retry

## Output esperado
Skeletons, offline detection e error boundary criados.
```

---

### PROMPT 4.5: QA Checklist e Testes

```
Você é um QA engineer. Sua tarefa é criar checklist e testes para mobile.

## Tarefa
1. Crie doc/QA_CHECKLIST_COSMOS_MOBILE.md:

```markdown
# QA Checklist - Cosmos Mobile

## Touch Interactions
- [ ] Todos os touch targets ≥ 44px
- [ ] Espaçamento entre targets ≥ 8px
- [ ] Feedback visual em todos os taps

## Layout
- [ ] Nenhum overflow horizontal
- [ ] Safe areas respeitadas
- [ ] Orientação landscape suportada

## Performance
- [ ] 60fps em scroll
- [ ] Animações suaves
- [ ] Carregamento < 3s

## Por Rota
### /home
- [ ] ...

### /galaxia
- [ ] ...

(etc para cada rota)
```

2. Matriz de dispositivos:
   - iPhone SE (375px)
   - iPhone 14 (390px)
   - iPhone 14 Pro Max (430px)
   - iPad Mini (768px)
   - iPad Pro 12.9 (1024px)
   - Android típico (360px)

3. Se houver Playwright:
   - Crie tests/cosmos-mobile.spec.ts
   - Teste cada rota em viewports diferentes

## Output esperado
Checklist completo e testes se aplicável.
```

---

## 📋 Template de Report de Task

Após completar uma task, o agent deve reportar no formato:

```markdown
## Task X.X: [Nome da Task]

### Status: ✅ Completed

### Mudanças Realizadas
- Arquivo 1: descrição da mudança
- Arquivo 2: descrição da mudança

### Arquivos Criados
- path/to/new/file.tsx

### Arquivos Modificados
- path/to/modified/file.tsx

### Testes Realizados
- Viewport 375px: ✅
- Viewport 768px: ✅
- Viewport 1024px: ✅

### Observações
- Qualquer nota importante

### Próximos Passos
- Tasks dependentes ou follow-ups
```

---

*Documento gerado em: 11/01/2026*
