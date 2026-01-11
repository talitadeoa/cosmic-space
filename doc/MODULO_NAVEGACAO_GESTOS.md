# Módulo de Navegação/Gestos do Cosmos

## Visão Geral

Sistema centralizado de navegação e detecção de gestos para as telas do cosmos. Fornece uma API consistente para navegação com animações de foco e suporte nativo para gestos touch (tap, swipe, long press, pinch).

## Componentes

### 1. **Tipos de Gestos** (`types/gestures.ts`)

Interfaces TypeScript para todos os tipos de gestos suportados:

- **Tap**: Toque único rápido
- **Double Tap**: Dois toques rápidos no mesmo local
- **Long Press**: Toque mantido por 500ms (configurável)
- **Swipe**: Gesto de deslizamento (4 direções: up, down, left, right)
- **Pinch**: Gesto de aproximação/afastamento com 2 dedos

```typescript
import type { 
  Gesture, 
  GestureDetectorConfig,
  TapGesture,
  SwipeGesture,
  PinchGesture
} from '@/types/gestures';
```

### 2. **Hook de Navegação** (`app/cosmos/hooks/useUniverseNavigation.ts`)

Hook centralizado para gerenciar navegação no cosmos.

#### Métodos

```typescript
const {
  navigateTo,        // Navegação simples entre telas
  navigateWithFocus, // Navegação com contexto de foco (animações)
  navigateBack,      // Voltar para tela anterior
  clearFocusContext, // Limpar contexto de foco
  getFocusContext,   // Recuperar contexto de foco
  navigationHistory, // Histórico de navegação
} = useUniverseNavigation();
```

#### Exemplo de Uso

```typescript
'use client';

import React from 'react';
import { useUniverseNavigation } from '../hooks/useUniverseNavigation';

export default function MeuComponente() {
  const { navigateTo, navigateWithFocus } = useUniverseNavigation();

  return (
    <div>
      {/* Navegação simples */}
      <button onClick={() => navigateTo('home')}>
        Voltar para Home
      </button>

      {/* Navegação com animação de foco */}
      <div
        onClick={(e) =>
          navigateWithFocus('luaList', {
            event: e,
            type: 'lua',
            size: 'md',
          })
        }
      >
        Clique para ir para Lua List
      </div>
    </div>
  );
}
```

### 3. **Componente Detector de Gestos** (`app/cosmos/components/GestureDetector.tsx`)

Componente wrapper que detecta e dispara eventos de gestos.

#### Props

```typescript
interface GestureDetectorConfig {
  enabled?: boolean;                    // Ativar/desativar detecção (padrão: true)
  onTap?: (gesture: TapGesture) => void;
  onDoubleTap?: (gesture: DoubleTapGesture) => void;
  onLongPress?: (gesture: LongPressGesture) => void;
  onSwipe?: (gesture: SwipeGesture) => void;
  onPinch?: (gesture: PinchGesture) => void;
  
  // Configurações de detecção
  longPressConfig?: { duration?: number; threshold?: number; };
  swipeConfig?: { threshold?: number; velocity?: number; };
  pinchConfig?: { threshold?: number; };
  
  debug?: boolean;                      // Logs de debug no console
}
```

#### Exemplo de Uso

```typescript
'use client';

import React from 'react';
import { GestureDetector } from '@/app/cosmos/components/GestureDetector';
import type { SwipeGesture, PinchGesture } from '@/types/gestures';

export default function InteractiveScreen() {
  const handleSwipe = (gesture: SwipeGesture) => {
    console.log(`Swipe para ${gesture.direction}`);
    console.log(`Velocidade: ${gesture.velocity.toFixed(2)} px/ms`);
    
    switch (gesture.direction) {
      case 'left':
        console.log('Próximo item');
        break;
      case 'right':
        console.log('Item anterior');
        break;
      case 'up':
        console.log('Scroll para cima');
        break;
      case 'down':
        console.log('Scroll para baixo');
        break;
    }
  };

  const handlePinch = (gesture: PinchGesture) => {
    console.log(`Pinch com escala: ${gesture.scale.toFixed(2)}x`);
    console.log(`Centro: (${gesture.x}, ${gesture.y})`);
  };

  return (
    <GestureDetector
      onSwipe={handleSwipe}
      onPinch={handlePinch}
      onTap={(tap) => console.log(`Tap em (${tap.x}, ${tap.y})`)}
      swipeConfig={{ threshold: 50, velocity: 0.3 }}
      pinchConfig={{ threshold: 20 }}
      debug={true}
    >
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1>Teste os gestos aqui</h1>
          <p>Swipe, pinch, tap ou long press</p>
        </div>
      </div>
    </GestureDetector>
  );
}
```

## Padrões de Navegação

### Estrutura de Telas

Cada tela no cosmos agora usa o hook `useUniverseNavigation()`:

```typescript
'use client';

import React from 'react';
import { useUniverseNavigation } from '../hooks/useUniverseNavigation';
import type { CelestialSize, CelestialType } from '../types';

const MeuScreen: React.FC = () => {
  const { navigateTo, navigateWithFocus } = useUniverseNavigation();

  return (
    <div>
      {/* Seu conteúdo */}
    </div>
  );
};

export default MeuScreen;
```

### Navegação com Foco

Quando você navega com foco, o contexto de origem é armazenado em `sessionStorage`:

```typescript
navigateWithFocus('luaList', {
  event: mouseEvent,    // Evento de clique (calcula posição)
  type: 'lua',          // Tipo de objeto celeste
  size: 'md',           // Tamanho do objeto
  year: 2024            // (opcional) Dados adicionais
});
```

Dados armazenados:
```json
{
  "type": "lua",
  "size": "md",
  "x": 100,
  "y": 200,
  "centerX": 150,
  "centerY": 250,
  "width": 100,
  "height": 100,
  "year": 2024
}
```

Para recuperar na próxima tela:
```typescript
const focusContext = getFocusContext();
if (focusContext) {
  // Usar para animar a transição
}
```

## Configuração de Gestos

### Long Press

```typescript
<GestureDetector
  onLongPress={(gesture) => {
    console.log(`Long press de ${gesture.duration}ms em (${gesture.x}, ${gesture.y})`);
  }}
  longPressConfig={{
    duration: 500,    // ms para ativar (padrão: 500)
    threshold: 10     // px de movimento máximo (padrão: 10)
  }}
>
  {/* Conteúdo */}
</GestureDetector>
```

### Swipe

```typescript
<GestureDetector
  onSwipe={(gesture) => {
    console.log(`Swipe ${gesture.direction}: ${gesture.distance}px em ${gesture.duration}ms`);
  }}
  swipeConfig={{
    threshold: 50,    // px mínimo (padrão: 50)
    velocity: 0.3     // px/ms (padrão: 0.3)
  }}
>
  {/* Conteúdo */}
</GestureDetector>
```

### Pinch

```typescript
<GestureDetector
  onPinch={(gesture) => {
    console.log(`Pinch: ${gesture.scale > 1 ? 'zoom in' : 'zoom out'}`);
  }}
  pinchConfig={{
    threshold: 20     // mudança mínima de distância (padrão: 20)
  }}
>
  {/* Conteúdo */}
</GestureDetector>
```

## Histórico de Navegação

O hook mantém um histórico automático de telas visitadas:

```typescript
const { navigateBack, navigationHistory } = useUniverseNavigation();

// Voltar para tela anterior
navigateBack();

// Ver histórico
console.log(navigationHistory); // ['home', 'luaList', 'planetCardStandalone']
```

## Telas Atualizadas

Todas as seguintes telas foram migradas para usar `useUniverseNavigation()`:

✅ `HomeScreen.tsx`
✅ `GalaxyScreen.tsx` (RingGalaxyScreen)
✅ `SolOrbitScreen.tsx`
✅ `PlanetCardBelowSunScreen.tsx`
✅ `PlanetCardStandaloneScreen.tsx`
✅ `ColumnSolLuaPlanetaScreen.tsx`
✅ `LuasScreen.tsx` (LuaListScreen)
✅ `EclipseScreen.tsx` (EclipseProductivityScreen)
✅ `GalaxySunsScreen.tsx`

## Boas Práticas

1. **Sempre use o hook**: Em vez de receber `ScreenProps`, use `useUniverseNavigation()`
2. **Contexto de foco**: Passe `event` quando possível para melhor UX
3. **Limpeza**: Use `clearFocusContext()` após consumir a animação
4. **Debug**: Ative `debug={true}` no `GestureDetector` para troubleshooting
5. **Configuração de gestos**: Ajuste thresholds conforme necessidade do design

## Performance

- Gestos são detalhados apenas quando eventos reais ocorrem
- Debouncing automático de long press
- Sem re-renders desnecessários no hook
- Session storage limpo automaticamente ao limpar contexto

## Compatibilidade

- ✅ Touch events (iOS, Android)
- ✅ Mouse events (Desktop)
- ✅ Double tap detection
- ✅ Pinch with multi-touch
- ✅ TypeScript com tipos completos

## Próximos Passos

- Adicionar gestos de rotação (3+ dedos)
- Integrar com animações Framer Motion
- Adicionar haptic feedback em mobile
- Criar histórico visual de navegação
