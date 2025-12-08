# 📖 Guia de Conversão HTML → Componentes React

Este guia ajuda a converter arquivos HTML em componentes React/TypeScript reutilizáveis.

## 🎯 Estrutura Padrão

Para cada novo HTML, seguiremos este padrão:

```
1. Canvas/Componente Principal
   └─ `components/[Nome]Canvas.tsx` ou `components/[Nome].tsx`
   
2. View (Wrapper)
   └─ `components/views/[Nome]View.tsx`
   
3. Rota
   └─ `app/[nome]/page.tsx`
```

## 📋 Checklist de Conversão

- [ ] Extrair lógica JavaScript → React hooks (useRef, useState, useEffect)
- [ ] Converter inline styles → Tailwind CSS classes
- [ ] Converter HTML puro → JSX
- [ ] Adicionar TypeScript types
- [ ] Criar arquivo Canvas/Componente (se necessário)
- [ ] Criar View wrapper com layout
- [ ] Criar página/rota
- [ ] Testar responsividade

## 🔧 Padrões de Conversão

### Canvas/WebGL
Se o HTML usa `<canvas>`:
```tsx
// Arquivo: components/[Nome]Canvas.tsx
"use client";
import React, { useRef, useEffect } from "react";

export const [Nome]Canvas: React.FC<{ config?: Partial<Config> }> = ({ config = {} }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // Lógica aqui
  }, [config]);
  
  return <canvas ref={canvasRef} className="block w-full h-full" />;
};
```

### SVG/DOM
Se o HTML usa SVG ou DOM:
```tsx
// Arquivo: components/[Nome].tsx
"use client";
import React from "react";

export const [Nome]: React.FC = () => {
  return (
    <div className="...">
      {/* SVG ou conteúdo aqui */}
    </div>
  );
};
```

### View Wrapper
```tsx
// Arquivo: components/views/[Nome]View.tsx
import type { FC } from "react";
import { [Nome]Canvas } from "@/components/[Nome]Canvas";

export const [Nome]View: FC = () => {
  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br ...">
      <div className="flex-1 relative">
        <[Nome]Canvas />
      </div>
      <div className="absolute bottom-6 left-6 ...">
        {/* Informações */}
      </div>
    </div>
  );
};
```

### Rota
```tsx
// Arquivo: app/[nome]/page.tsx
import { [Nome]View } from "@/components/views/[Nome]View";

export default function [Nome]Page() {
  return <[Nome]View />;
}
```

## 💡 Dicas

1. **Gradientes**: Use `ctx.createRadialGradient()` ou `ctx.createLinearGradient()` para canvas
2. **Animações**: `requestAnimationFrame` para canvas; Tailwind `animate-*` para SVG
3. **Responsividade**: Sempre adicione listener de `resize`
4. **Performance**: Use `useRef` para estado mutável, `useState` para renders
5. **Estilos**: Prefira Tailwind no wrapper; inline styles para canvas context

## 🚀 Próximos HTMLs

Compartilhe o HTML e eu vou converter seguindo este padrão!
