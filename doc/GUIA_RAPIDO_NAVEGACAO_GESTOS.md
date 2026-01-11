# Guia Rápido: Usar o Módulo de Navegação/Gestos

## ⚡ Quick Start

### 1. Importar o Hook em uma Tela

```typescript
'use client';

import React from 'react';
import { useUniverseNavigation } from '@/app/cosmos/hooks/useUniverseNavigation';

const MeuScreen: React.FC = () => {
  const { navigateTo, navigateWithFocus } = useUniverseNavigation();

  return (
    // seu conteúdo
  );
};

export default MeuScreen;
```

### 2. Usar Navegação Simples

```typescript
<button onClick={() => navigateTo('home')}>
  Voltar para Home
</button>
```

### 3. Usar Navegação com Animação

```typescript
<CelestialObject
  onClick={(e) =>
    navigateWithFocus('luaList', {
      event: e,
      type: 'lua',
      size: 'md',
    })
  }
/>
```

### 4. Usar Detector de Gestos

```typescript
import { GestureDetector } from '@/app/cosmos/components/GestureDetector';

<GestureDetector
  onSwipe={(gesture) => {
    console.log(`Swipe para ${gesture.direction}`);
  }}
>
  <div>Seu conteúdo interativo</div>
</GestureDetector>
```

## 📋 Checklist de Migração (por tela)

### Se sua tela herdava `ScreenProps`:

```typescript
// ❌ ANTES
type MyScreenProps = ScreenProps;

const MyScreen: React.FC<ScreenProps> = ({ navigateTo, navigateWithFocus }) => {
  // ...
};
```

```typescript
// ✅ DEPOIS
import { useUniverseNavigation } from '@/app/cosmos/hooks/useUniverseNavigation';

const MyScreen: React.FC = () => {
  const { navigateTo, navigateWithFocus } = useUniverseNavigation();
  // ...
};
```

## 🎯 Padrões Comuns

### Padrão 1: Botão de Navegação Simples
```typescript
<button onClick={() => navigateTo('home')}>
  Ir para Home
</button>
```

### Padrão 2: Elemento Interativo com Foco
```typescript
<div
  onClick={(e) =>
    navigateWithFocus('luaList', {
      event: e,
      type: 'lua',
      size: 'md',
      year: 2024 // opcional
    })
  }
  className="cursor-pointer"
>
  Elemento Clicável
</div>
```

### Padrão 3: Volta Automática
```typescript
const { navigateBack } = useUniverseNavigation();

<button onClick={navigateBack}>
  ← Voltar
</button>
```

### Padrão 4: Deslizar para Navegar
```typescript
<GestureDetector
  onSwipe={(gesture) => {
    if (gesture.direction === 'right') {
      navigateBack();
    } else if (gesture.direction === 'left') {
      navigateTo('nextScreen');
    }
  }}
>
  <div>Deslize para navegar</div>
</GestureDetector>
```

### Padrão 5: Long Press para Ação
```typescript
<GestureDetector
  onLongPress={() => {
    console.log('Ação de long press');
  }}
  longPressConfig={{ duration: 800 }}
>
  <div>Toque e segure</div>
</GestureDetector>
```

### Padrão 6: Zoom com Pinch
```typescript
<GestureDetector
  onPinch={(gesture) => {
    setScale(prevScale => prevScale * gesture.scale);
  }}
>
  <div style={{ transform: `scale(${scale})` }}>
    Faça pinch para zoom
  </div>
</GestureDetector>
```

## 🔍 Debug

### Ativar logs no GestureDetector
```typescript
<GestureDetector
  onTap={() => {}}
  debug={true}  // Veja logs no console (F12)
>
  Seu conteúdo
</GestureDetector>
```

### Recuperar contexto de foco
```typescript
const { getFocusContext } = useUniverseNavigation();

React.useEffect(() => {
  const focusContext = getFocusContext();
  if (focusContext) {
    console.log('Contexto de foco:', focusContext);
    // Use para animar a transição
  }
}, []);
```

## ⚙️ Configuração de Gestos

### Long Press
```typescript
<GestureDetector
  onLongPress={handleLongPress}
  longPressConfig={{
    duration: 500,    // ms
    threshold: 10     // px movimento máximo
  }}
>
  Seu conteúdo
</GestureDetector>
```

### Swipe
```typescript
<GestureDetector
  onSwipe={handleSwipe}
  swipeConfig={{
    threshold: 50,    // px mínimo
    velocity: 0.3     // px/ms
  }}
>
  Seu conteúdo
</GestureDetector>
```

### Pinch
```typescript
<GestureDetector
  onPinch={handlePinch}
  pinchConfig={{
    threshold: 20     // mudança mínima de distância
  }}
>
  Seu conteúdo
</GestureDetector>
```

## 📚 Importações Comuns

```typescript
// Hook
import { useUniverseNavigation } from '@/app/cosmos/hooks/useUniverseNavigation';

// Componente
import { GestureDetector } from '@/app/cosmos/components/GestureDetector';

// Tipos
import type {
  GestureDetectorConfig,
  TapGesture,
  SwipeGesture,
  PinchGesture,
  LongPressGesture,
  DoubleTapGesture,
} from '@/types/gestures';
```

## 🚀 Uso Avançado

### Combinar múltiplos gestos
```typescript
<GestureDetector
  onTap={handleTap}
  onDoubleTap={handleDoubleTap}
  onLongPress={handleLongPress}
  onSwipe={handleSwipe}
  onPinch={handlePinch}
  debug={true}
>
  <div>Teste todos os gestos</div>
</GestureDetector>
```

### Histórico de navegação
```typescript
const { navigationHistory } = useUniverseNavigation();

console.log('Histórico:', navigationHistory);
// ['home', 'luaList', 'planetCard']
```

### Limpeza manual de contexto
```typescript
const { clearFocusContext } = useUniverseNavigation();

React.useEffect(() => {
  return () => {
    // Limpar ao desmontar
    clearFocusContext();
  };
}, [clearFocusContext]);
```

### Navegação externa
```typescript
const { navigateTo } = useUniverseNavigation();

<button
  onClick={() =>
    navigateTo('myPage', {
      external: true,  // Abre em nova aba
      newTab: false    // ou true para target="_blank"
    })
  }
>
  Link Externo
</button>
```

## ❓ FAQ

**P: Como recuperar o contexto de foco na próxima tela?**
R: Use `getFocusContext()` no `useEffect` da tela destino.

**P: Como voltar para a tela anterior?**
R: Use `navigateBack()` ou `navigateTo(telaAnterior, { replace: true })`.

**P: Posso usar múltiplos GestureDetectors?**
R: Sim, cada um funciona independentemente.

**P: Como desabilitar gestos temporariamente?**
R: Use `enabled={false}` no GestureDetector.

**P: Qual é o suporte a navegadores?**
R: Funciona em todos os modernos (Chrome, Firefox, Safari, Edge) e em mobile (iOS, Android).

## 🔗 Documentação Completa

- [MODULO_NAVEGACAO_GESTOS.md](./MODULO_NAVEGACAO_GESTOS.md) - Documentação completa
- [EXEMPLOS_NAVEGACAO_GESTOS.tsx](./EXEMPLOS_NAVEGACAO_GESTOS.tsx) - Exemplos práticos
- [TESTES_NAVEGACAO_GESTOS.ts](./TESTES_NAVEGACAO_GESTOS.ts) - Guia de testes

## 💡 Dicas

1. Sempre adicione `event` ao `navigateWithFocus` para melhor UX
2. Use `debug={true}` para troubleshooting
3. Coloque o `GestureDetector` no container pai
4. Configure thresholds conforme o design
5. Teste em dispositivos reais (touch é diferente de mouse)
