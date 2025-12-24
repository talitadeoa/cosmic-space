# 🎨 Guia Visual - Classes Tailwind e Estados

## Estado Ativo vs Inativo

### Tabs
```
┌─────────────────┬──────────────┐
│ Inbox (ATIVO)   │ Lua Atual    │
└─────────────────┴──────────────┘
  ↑                  ↑
  └─ border-indigo-400       └─ border-slate-700
     bg-indigo-500/20          bg-slate-900/70
     text-indigo-100           text-slate-300
```

### Ilhas
```
┌──────────────────────┐
│ ✓ Ilha 1 (ATIVO)     │  ← border-indigo-300/80
│                      │     bg-indigo-500/20
│                      │     shadow-md shadow-indigo-500/20
└──────────────────────┘

┌──────────────────────┐
│   Ilha 2             │  ← border-slate-700
│                      │     bg-slate-900/70
│                      │     hover:border-indigo-400/60
└──────────────────────┘
```

### Fases Lunares
```
┌─────────────────┐  ┌─────────────────┐
│   🌑 Lua Nova   │  │  🌓 Lua Cresc.  │  ← Inativa: border-slate-700, bg-slate-900/50
│   Lua Nova      │  │                 │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│✓ 🌕 Lua Cheia   │  │  🌗 Lua Mingun. │  ← Ativa: border-indigo-400
│  Lua Cheia      │  │                 │     bg-indigo-500/30
│      3          │  │                 │     scale-105
└─────────────────┘  └─────────────────┘
   ↑
   └─ Badge: bg-indigo-600, text-white
```

---

## Focus Ring (Navegação por Teclado)

```
┌────────────────────────────────────┐
│ Elemento com Focus                 │  ← ring-2 ring-indigo-500
│ (Tab → Tab → Tab)                  │     ring-offset-2
│                                    │     ring-offset-slate-950
└────────────────────────────────────┘
```

---

## Empty State

```
╔═════════════════════════════════════╗
║  ✨                                 ║  ← opacity-60, border-dashed
║  Nenhum to-do salvo                 ║     border-slate-700/40
║  Crie uma tarefa ou selecione...    ║     bg-slate-900/30
╚═════════════════════════════════════╝
```

---

## Layout Responsivo

### Mobile (< 640px)
```
┌─────────────────┐
│ 🌕 🌑 🌓 🌗      │  ← MoonCluster vertical
│ [Ilha 1]        │
│ [Ilha 2]        │
│ [Ilha 3]        │
│ [Ilha 4]        │  ← IslandsList horizontal
│ 🌑 Lua Nova  2  │
│ 🌓 Lua Cresc 1  │
│ 🌕 Lua Cheia 3  │
│ 🌗 Lua Mingun1  │  ← MoonPhasesRail horizontal
├─────────────────┤
│ CARD COM TAREFAS│
│ [Input]         │
│ [To-do 1]       │
│ [To-do 2]       │
│ [...]           │
└─────────────────┘
```

### Desktop (≥ 1024px)
```
┌──────────────┬──────────────────────┬──────────────┐
│              │                      │              │
│ 🌕 🌑        │ CARD COM TAREFAS     │ 🌑 Lua Nova  │
│ 🌓 🌗        │                      │              │
│              │ [Input]              │ 🌓 Crescent  │
│ [Ilha 1]     │ [To-do 1]            │        1     │
│ [Ilha 2]     │ [To-do 2]            │              │
│ [Ilha 3]     │ [To-do 3]            │ 🌕 Full      │
│ [Ilha 4]     │ [To-do 4]            │        3     │
│              │ [...]                │              │
│              │                      │ 🌗 Waning    │
│ [Limpar]     │                      │        1     │
└──────────────┴──────────────────────┴──────────────┘
   ↑                ↑                       ↑
   Esquerda    Lg:max-w-3xl            Lg:max-w-xs
   Lg:max-w-xs Lg:flex-1 Lg:pl-16
```

---

## Transições e Animações

```css
/* Todos os componentes interativos usam: */
.interactive-element {
  transition: all 300ms ease-in-out;
}

/* Fase lunar selecionada: */
.moon-phase-active {
  animation: scale-up 200ms ease-out;
  @apply scale-105;
}

/* Focus ring: */
.with-focus-ring {
  @apply focus-visible:ring-2 focus-visible:ring-indigo-500;
}

/* Hover state: */
.with-hover {
  @apply hover:border-indigo-400/60 hover:bg-slate-900;
}
```

---

## Acessibilidade Visual

### Contraste de Cores

| Elemento | Foreground | Background | Ratio |
|----------|-----------|-----------|-------|
| Tab Ativo | text-indigo-100 | bg-indigo-500/20 | > 4.5:1 ✓ |
| Tab Inativo | text-slate-300 | bg-slate-900/70 | > 7:1 ✓ |
| Island Ativo | text-indigo-100 | bg-indigo-500/20 | > 4.5:1 ✓ |
| Moon Ativo | text-indigo-100 | bg-indigo-500/30 | > 4.5:1 ✓ |
| Empty State | text-slate-500 | opacity-60 | > 3:1 ⚠️ |

### Indicadores Visuais

✓ **Border**: Mudança de `border-slate-700` → `border-indigo-400`  
✓ **Cor**: Mudança de `text-slate-300` → `text-indigo-100`  
✓ **Background**: Mudança de `bg-slate-900` → `bg-indigo-500/20`  
✓ **Sombra**: Adição de `shadow-md shadow-indigo-500/20`  
✓ **Escala**: Aumento de `scale-105` em fases  
✓ **Opacidade**: Redução em empty states `opacity-60`  

---

## Componentes por Responsividade

### EmptyState
```tailwind
/* Base */
flex flex-col items-center justify-center gap-2
rounded-lg border border-dashed border-slate-700/40
bg-slate-900/30 px-4 py-8 text-center opacity-60

/* Responsive */
sm:gap-3
text-sm sm:text-base  (para título)
text-xs sm:text-sm    (para descrição)
```

### AccessibleTabs
```tailwind
/* Container */
flex flex-wrap items-center gap-2
border-b border-slate-800
pb-3 sm:pb-4

/* Individual Tab */
flex items-center gap-2
rounded-lg border px-3 py-2
text-sm font-semibold
transition focus:outline-none
focus-visible:ring-2 focus-visible:ring-indigo-500
```

### IslandsList
```tailwind
/* Container */
flex flex-col gap-2
rounded-xl border border-slate-800
bg-slate-950/50 p-3 sm:p-4

/* Buttons */
rounded-lg border px-3 py-2
text-sm font-semibold
transition focus-visible:ring-2
```

### MoonPhasesRail
```tailwind
/* Container */
flex flex-col gap-2
rounded-xl border border-slate-800
bg-slate-950/50 p-3 sm:p-4

/* Responsive */
lg:flex-row      (horizontal em tablet+)
sm:flex-row      (horizontal em mobile+, se desired)

/* Buttons */
flex flex-col items-center gap-1.5
rounded-lg border px-4 py-3
text-2xl sm:text-3xl
transition focus-visible:ring-2

/* Badge */
rounded-full bg-indigo-600 px-2 py-1
text-[0.6rem] font-bold text-white
```

---

## Estados Especiais

### Tarefa Completada
```
[✓] Texto tachado
    └─ border-emerald-400
       bg-emerald-500/20
       text-emerald-200
       line-through
```

### Tarefa Pendente
```
[ ] Texto normal
    └─ border-slate-500
       bg-slate-900/80
       text-slate-100
       hover:border-emerald-400/70
```

### Badge de Contagem
```
[2]  ← bg-indigo-600, text-white, rounded-full, font-bold
```

---

## Guia de Implementação

### Quando Usar Qual Componente

| Caso | Componente | Notas |
|------|-----------|-------|
| Sem tarefas | EmptyState | Não interativo, opacidade reduzida |
| Navegação entre seções | AccessibleTabs | WAI-ARIA completo, navega por teclado |
| Selecionar ilha | IslandsList | Botões com aria-pressed |
| Selecionar fase | MoonPhasesRail | Emoji + badge + contadores |
| Listar tarefas | SavedTodosPanel | Usa EmptyState internamente |

### Classes Mais Importantes

```tailwind
/* Ativo */
border-indigo-400
bg-indigo-500/20
text-indigo-100
shadow-md shadow-indigo-500/20

/* Hover */
hover:border-indigo-400/60
hover:bg-slate-900

/* Focus */
focus-visible:ring-2
focus-visible:ring-indigo-500
focus-visible:ring-offset-2
focus-visible:ring-offset-slate-950

/* Empty State */
border-dashed
border-slate-700/40
opacity-60

/* Badge */
rounded-full
bg-indigo-600
text-white
font-bold
```
