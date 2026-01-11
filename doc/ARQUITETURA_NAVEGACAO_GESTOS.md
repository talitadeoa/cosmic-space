# Arquitetura do Módulo de Navegação/Gestos

## 📐 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│         Camada de Aplicação (Telas do Cosmos)              │
├─────────────────────────────────────────────────────────────┤
│  HomeScreen  │  GalaxyScreen  │  LuasScreen  │  ...        │
└────────┬────────────┬────────────────┬────────────┬─────────┘
         │            │                 │            │
         └────────────┼─────────────────┼────────────┘
                      │                 │
         ┌────────────▼─────────────────▼────────────┐
         │   Camada de Hooks                         │
         │  useUniverseNavigation                    │
         └────────────┬─────────────────┬────────────┘
                      │                 │
        ┌─────────────┴────────────────┐│
        │                              ││
        │  ┌──────────────────────────┘│
        │  │
        ▼  ▼
    ┌──────────────────┐      ┌─────────────────────┐
    │  Navegação       │      │  Gestos             │
    │  - navigateTo    │      │  - Detector         │
    │  - navigateTo... │      │  - Handlers         │
    │  - navigateBack  │      │  - Configuração     │
    └──────────────────┘      └─────────────────────┘
        │                          │
        │  ┌───────────────────────┘
        │  │
        ▼  ▼
    ┌──────────────────────────────────────┐
    │   Armazenamento                      │
    │   - sessionStorage (FocusContext)    │
    │   - navigationHistory (array)        │
    └──────────────────────────────────────┘
        │
        │  ┌─────────────────────────┐
        │  │                         │
        ▼  ▼                         ▼
    ┌──────────────────────────────────────────┐
    │   Next.js Router                         │
    └──────────────────────────────────────────┘
        │
        │  ┌─────────────────────────────────────┐
        │  │                                     │
        ▼  ▼                                     ▼
    ┌──────────────────────────────────────────────────────┐
    │   Navegadores / Dispositivos                         │
    │   Desktop (Mouse) │ Mobile (Touch) │ Tablet (Both)   │
    └──────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados

### Navegação Simples
```
Usuário clica
     │
     ▼
CelestialObject.onClick
     │
     ▼
navigateTo('screenId')
     │
     ├─► Router.push()
     │
     └─► navigationHistory.push('screenId')
            │
            ▼
         Nova Tela Renderizada
```

### Navegação com Foco
```
Usuário clica
     │
     ▼
CelestialObject.onClick(event)
     │
     ▼
navigateWithFocus('screenId', { event, type, size })
     │
     ├─► Calcula posição do evento
     │   - x, y, centerX, centerY, width, height
     │
     ├─► Armazena em sessionStorage
     │   focusContext = { type, size, x, y, ... }
     │
     ├─► Router.push()
     │
     └─► navigationHistory.push('screenId')
            │
            ▼
         Nova Tela Renderizada
            │
            ▼
         getFocusContext() na nova tela
            │
            ▼
         Animar transição
            │
            ▼
         clearFocusContext()
```

### Detecção de Gestos
```
Touch Start/Mouse Down
     │
     ├─► Registra posição (x, y)
     ├─► Inicia timer (long press)
     └─► Registra timestamp
            │
            ▼
     Touch Move/Mouse Move
     │
     ├─► Atualiza posição
     ├─► Calcula distância
     ├─► Cancela long press se movimento > threshold
     ├─► Atualiza distância de pinch
            │
            ▼
     Touch End/Mouse Up
     │
     ├─► Calcula direção e velocidade
     │
     ├─► Classifica gesto:
     │   ├─► Tap: distância < threshold e duration < 300ms
     │   ├─► Double Tap: 2 taps em < 300ms
     │   ├─► Long Press: duration >= 500ms e movement < threshold
     │   ├─► Swipe: movimento > threshold e velocity > limit
     │   └─► Pinch: 2 dedos com mudança de distância
     │
     ▼
Handler do gesto é chamado
     │
     ▼
onTap / onDoubleTap / onLongPress / onSwipe / onPinch
```

## 📦 Dependências

```
Módulo de Navegação/Gestos
│
├─► React 18+
│   ├─► useCallback
│   ├─► useRef
│   ├─► useEffect
│   ├─► useImperativeHandle
│   └─► forwardRef
│
├─► Next.js
│   ├─► useRouter (app/router)
│   └─► 'use client' directive
│
├─► TypeScript
│   ├─► Type definitions
│   ├─► Interfaces
│   └─► Generics
│
└─► Componentes locais
    ├─► CelestialObject
    ├─► Card
    └─► Layouts
```

## 🔌 Pontos de Integração

### 1. Importação
```typescript
// Ponto único de importação
import { useUniverseNavigation } from '@/app/cosmos/navigation/index';
// ou
import { useUniverseNavigation } from '@/app/cosmos/hooks/useUniverseNavigation';
```

### 2. Uso em Componentes
```typescript
const { navigateTo, navigateWithFocus } = useUniverseNavigation();
// Retorna todos os métodos de navegação
```

### 3. Uso em Gestos
```typescript
<GestureDetector onSwipe={handleSwipe} onPinch={handlePinch}>
  {children}
</GestureDetector>
```

## 🎯 Fluxo de Atualização de Tela

```
Tela Anterior
│
├─► useUniverseNavigation()
├─► navigateWithFocus(screenId, context)
│
▼
FocusContext armazenado em sessionStorage
│
▼
Router.push(`/cosmos/${screenId}`)
│
▼
Tela Nova Renderizada
│
├─► useUniverseNavigation()
├─► getFocusContext()
│
▼
Context disponível para animar transição
│
▼
Uso do contexto:
├─► Posição de origem
├─► Tipo de objeto
├─► Tamanho
└─► Dados adicionais (year, etc)
│
▼
clearFocusContext()
│
▼
Limpo para próxima navegação
```

## 📊 Estados e Transições

### Estado do Hook
```typescript
// Estado inicial
{
  navigateTo: function,
  navigateWithFocus: function,
  navigateBack: function,
  clearFocusContext: function,
  getFocusContext: function,
  navigationHistory: []
}

// Após primeira navegação
{
  navigationHistory: ['home']
}

// Após navigateWithFocus
{
  navigationHistory: ['home', 'luaList'],
  sessionStorage: { 'cosmos:focusContext': {...} }
}
```

### Estados do GestureDetector
```
Idle (inicializado)
│
├─► Touch Start
│   │
│   ├─► 1 dedo → Monitorar tap/long press
│   └─► 2 dedos → Monitorar pinch
│
▼
Touch Move
│
├─► Se movement > threshold
│   └─► Mudar para Swipe detection
│
├─► Se 2 dedos
│   └─► Calcular pinch scale
│
▼
Touch End
│
├─► Classificar gesto
├─► Chamar handler apropriado
│
▼
Idle (pronto para novo gesto)
```

## 🔐 Segurança e Performance

### Segurança
```
✅ Sem eval() ou dynamic code
✅ Sem acesso direto ao DOM (via ref controlado)
✅ SessionStorage limpo após uso
✅ Sem dados sensíveis armazenados
✅ Event delegation segura
```

### Performance
```
✅ Event listeners removidos ao desmontar
✅ useCallback para evitar re-renders
✅ useRef para estado não-renderizado
✅ Debouncing automático de long press
✅ Sem memory leaks
✅ Throttling automático de move events
```

## 🧩 Integração com UI

```
Layout do Cosmos
│
├─► GestureDetector (raiz)
│   │
│   ├─► Tela (HomeScreen, etc)
│   │   │
│   │   ├─► CelestialObject
│   │   │   │
│   │   │   └─► onClick → navigateWithFocus()
│   │   │
│   │   └─► Componentes aninhados
│   │
│   └─► Suporta toque completo
│
└─► Navegação via Router Next.js
```

## 🌐 Suporte Multiplataforma

```
Desktop
├─► Mouse events
│   ├─► click → tap
│   ├─► double click → double tap
│   └─► não suporta long press nativo
│
├─► Keyboard
│   ├─► Enter / Space → ativar botão
│   └─► Navegação por teclado
│
└─► Browser
    ├─► Chrome ✅
    ├─► Firefox ✅
    ├─► Safari ✅
    └─► Edge ✅

Mobile
├─► iOS
│   ├─► Touch events ✅
│   ├─► Tap ✅
│   ├─► Long press ✅
│   ├─► Swipe ✅
│   └─► Pinch ✅
│
└─► Android
    ├─► Touch events ✅
    ├─► Tap ✅
    ├─► Long press ✅
    ├─► Swipe ✅
    └─► Pinch ✅
```

## 🔍 Stack Tecnológico

```
cosmic-space/
│
├─► Frontend Framework
│   └─► Next.js 14+ (app router)
│
├─► Language
│   └─► TypeScript 5+
│
├─► UI Library
│   ├─► React 18+
│   └─► Framer Motion (optional, para animações)
│
├─► Styling
│   └─► Tailwind CSS
│
├─► State Management
│   └─► React Hooks (useCallback, useRef, useEffect)
│
├─► Navigation
│   └─► Next.js Router (useRouter)
│
├─► Storage
│   └─► Browser SessionStorage (FocusContext)
│
└─► Testing (opcional)
    ├─► Jest
    ├─► React Testing Library
    └─► Cypress (E2E)
```

## 🎨 Padrões de Design

### 1. Hook Pattern
```typescript
const { method1, method2 } = useCustomHook();
// Encapsula lógica de negócio
```

### 2. Component Pattern
```typescript
<GestureDetector onGesture={handler}>
  {children}
</GestureDetector>
// Wrapper reutilizável
```

### 3. Observer Pattern
```typescript
onTap, onSwipe, onPinch callbacks
// Event emitters
```

### 4. Facade Pattern
```typescript
useUniverseNavigation()
// Interface única para navegação complexa
```

---

**Criado em:** 11 de janeiro de 2026
**Arquitetura:** Modular, Type-Safe, Performance-First
