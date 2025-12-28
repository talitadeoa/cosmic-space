# 🌙 Sistema de Hover para Eventos Astronômicos - Fases Lunares

## Visão Geral

Configuração de hover interativo para as luas no componente `SolOrbitStage`, onde cada fase lunar simboliza um evento astronômico importante: **solstícios, equinócios** e o **início/fim das estações**.

## Funcionalidades Implementadas

### 1. **Mapeamento de Fases Lunares para Eventos**

Cada fase lunar agora está vinculada a um evento astronômico específico:

| Fase Lunar | Evento | Estação | Emoji |
|-----------|--------|---------|-------|
| **Lua Nova** 🌑 | Equinócio de Outono | 🍂 Outono (22-23 set) | 🌑 |
| **Lua Crescente** 🌒 | Solstício de Verão | ☀️ Verão (20-21 jun) | 🌒 |
| **Lua Cheia** 🌕 | Solstício de Inverno | ❄️ Inverno (21-22 dez) | 🌕 |
| **Lua Minguante** 🌗 | Equinócio de Primavera | 🌸 Primavera (19-20 mar) | 🌗 |

### 2. **Tooltip Informativo ao Hover**

Quando você passa o mouse sobre uma lua, aparece um tooltip com:

- **Emoji da fase** (visualização rápida)
- **Nome da fase lunar**
- **Evento astronômico** correspondente
- **Emoji e nome da estação** do ano
- **Datas aproximadas** do evento
- **Descrição** do significado do evento (ex: "dia mais longo do ano")

### 3. **Estilos Visuais**

O tooltip possui:
- **Fundo escuro** com opacidade (slate-900/95)
- **Efeito blur** para profundidade
- **Cores temáticas** para cada tipo de informação
- **Sombra** para destacar do conteúdo de fundo
- **Animação suave** de aparecer/desaparecer

## Arquivo Modificado

### [app/sol/components/SolOrbitStage.tsx](app/sol/components/SolOrbitStage.tsx)

#### Mudanças Principais:

1. **Novo import**: `useState` do React
   ```tsx
   import React, { useState } from 'react';
   ```

2. **Constante MOON_EVENTS**: Objeto com mapeamento de fases para eventos
   ```tsx
   const MOON_EVENTS: Record<
     MoonPhase,
     {
       name: string;
       event: string;
       season: string;
       dates: string;
       emoji: string;
       description: string;
     }
   > = { ... }
   ```

3. **Estado de hover**: Rastreia qual lua está sendo hovada
   ```tsx
   const [hoveredMoon, setHoveredMoon] = useState<MoonPhase | null>(null);
   ```

4. **Renderização das luas**: Adiciona handlers de mouse e tooltip condicional
   ```tsx
   <div
     onMouseEnter={() => setHoveredMoon(phase)}
     onMouseLeave={() => setHoveredMoon(null)}
   >
     <CelestialObject ... />
     {isHovered && <tooltip ... />}
   </div>
   ```

## Como Usar

1. **Navegue até a página de Sol**: `/sol`
2. **Passe o mouse sobre as luas** posicionadas ao redor do sol
3. **Veja os detalhes** do evento astronômico correspondente

## Customização Futura

Para atualizar as datas ou eventos, edite o objeto `MOON_EVENTS` no arquivo [app/sol/components/SolOrbitStage.tsx](app/sol/components/SolOrbitStage.tsx):

```tsx
const MOON_EVENTS: Record<MoonPhase, {...}> = {
  luaNova: {
    name: 'Lua Nova',
    event: 'Equinócio de Outono (Hemisfério Norte)',
    season: '🍂 Outono',
    dates: '~22-23 de Setembro',
    emoji: '🌑',
    description: 'Início do outono - equilíbrio entre dia e noite',
  },
  // ... outras fases
};
```

## Notas Técnicas

- ✅ Funciona com **mouse e touch** (possui handlers para ambos)
- ✅ **Zero impacto de performance** - tooltip renderizado apenas quando necessário
- ✅ **Responsivo** - funciona em todos os tamanhos de tela
- ✅ **Acessível** - mantém a interatividade original das luas
- ✅ **Build passou** sem erros de TypeScript

## Testing

Para testar:

```bash
npm run dev
# Navegue até http://localhost:3000/sol
# Passe o mouse sobre as luas
```

---

**Status**: ✅ Implementado e testado com sucesso
**Branch**: resp-2
**Arquivo**: app/sol/components/SolOrbitStage.tsx
