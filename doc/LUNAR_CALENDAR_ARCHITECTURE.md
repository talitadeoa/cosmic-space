# Arquitetura Visual - Calendário Lunar

## 📐 Estrutura Geral

```
┌─────────────────────────────────────────────────────────┐
│  LunarCalendarWidget                                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Header: "Dezembro 2025" + Controles Navegação    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────────────┐  ┌───────────────────────────┐   │
│  │                  │  │                           │   │
│  │   HERO LUNAR     │  │   CALENDAR GRID           │   │
│  │   (esquerda)     │  │   (direita)               │   │
│  │                  │  │                           │   │
│  │ ┌──────────────┐ │  │  D  S  T  Q  Q  S  S     │   │
│  │ │              │ │  │ ┌─┬─┬─┬─┬─┬─┬─┐         │   │
│  │ │   ◯ Lua      │ │  │ │1│2│3│4│5│6│7│         │   │
│  │ │              │ │  │ ├─┼─┼─┼─┼─┼─┼─┤         │   │
│  │ │  (200x200px) │ │  │ │8│9│0│1│2│3│4│         │   │
│  │ └──────────────┘ │  │ └─┴─┴─┴─┴─┴─┴─┘         │   │
│  │                  │  │  [grid 7x6]              │   │
│  │ Lua Cheia        │  │                           │   │
│  │ 99.8% iluminada  │  │ Mini ícones de fase      │   │
│  │                  │  │ Seleção com pill cinza   │   │
│  │ ✦    ✦    ✦      │  │ Opacidade 30% dias out  │   │
│  │  (stars)         │  │                           │   │
│  └──────────────────┘  └───────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 🎨 Componentes e Hierarquia

```
LunarCalendarWidget (container principal, 'role="main"')
│
├─ Header
│  ├─ Title: "Dezembro 2025"
│  └─ NavigationControls
│     ├─ Button: "← Mês Anterior"
│     ├─ Button: "Hoje"
│     └─ Button: "Próximo Mês →"
│
└─ MainContainer (grid 2 colunas)
   │
   ├─ HeroSection
   │  └─ LunarHero
   │     ├─ Header: data formatada
   │     ├─ MoonContainer
   │     │  └─ MoonCircle
   │     │     └─ MoonPhaseIcon (SVG)
   │     ├─ PhaseInfo
   │     │  ├─ PhaseName: "Lua Cheia"
   │     │  ├─ Illumination: "99.8% iluminada"
   │     │  └─ DaysInPhase: "1 dia nesta fase"
   │     └─ StarDecoration (✦ decorativos)
   │
   └─ GridSection
      └─ CalendarGrid
         ├─ WeekHeader (D S T Q Q S S)
         └─ Week (x 5-6)
            ├─ DayCell
            │  └─ DayButton
            │     ├─ SelectionPill (se selecionado)
            │     ├─ DayNumber
            │     └─ LunarIndicator (mini ícone)
            └─ ...
```

## 📐 Dimensões Exatas

### Desktop (>1024px)
```
Viewport: 1400px max-width
Gap entre colunas: 2rem (32px)
Hero width: ~400px (incluindo padding)
Grid width: ~800px (incluindo padding)

LunarHero:
  padding: 2rem (32px)
  border-radius: 2rem (32px)
  width: 280px (min)
  
MoonCircle:
  width: 200px
  height: 200px
  border-radius: 50%
  
CalendarGrid:
  padding: 1.5rem (24px)
  border-radius: 1.5rem (24px)
  
DayButton:
  aspect-ratio: 1 (square)
  border-radius: 0.75rem (12px)
  gap: 0.25rem (4px) entre número e ícone
```

### Tablet (768-1024px)
```
Grid: 1 coluna (stack)
Gap: 1.5rem (24px)

MoonCircle:
  width: 150px
  height: 150px
  
Padding ajustado para 1.5rem
```

### Mobile (<768px)
```
Grid: 1 coluna
Gap: 1rem (16px)

DayCell: min-height: 44px (tap target)
DayButton: font-size: clamp(0.7rem, ..., 0.8rem)

LunarHero:
  padding: 1.5rem
  border-radius: 1.5rem
```

## 🎨 Estados Visuais

### Dia Normal
```
┌─────┐
│  8  │  (branco #e8e8ff)
└─────┘  (transparente)
```

### Dia Selecionado
```
┌───────┐
│ ◎ 8   │  (cinza translúcido por trás)
│   ◯   │  (mini ícone de fase)
└───────┘  (fontWeight: 500)
```

### Dia de Hoje
```
┌─────┐
│  28 │  (border: 1px rgba(100,116,139,0.4))
│     │  (background: rgba(100,116,139,0.2))
└─────┘  (box-shadow: glow sutil)
```

### Dia Fora do Mês
```
┌─────┐
│  1  │  (opacity: 0.3)
│     │  (color: #64748b)
└─────┘  (disabled: true)
```

### Dia com Foco (Tab)
```
┌─────────┐
│┏━━━━━━━┓│ (outline: 2px #64b5f6)
│┃  12  ┃│ (outline-offset: 2px)
│┗━━━━━━━┛│
└─────────┘
```

## 🎬 Animações

### moonGlow (LunarHero)
```
Elemento: .moonCircle
Duração: 6s
Loop: infinito
Efeito:
  0%, 100%:
    box-shadow: 0 0 40px rgba(100,116,139,0.2), inset ...
  50%:
    box-shadow: 0 0 60px rgba(100,116,139,0.3), inset ...
```

### twinkle (stars background)
```
Elemento: .lunarCalendarWidget::before
Duração: 8s
Loop: infinito
Efeito:
  0%, 100%: opacity: 0.05
  50%: opacity: 0.08
```

### float (decorative stars)
```
Elemento: .star
Duração: 6s
Loop: infinito
Efeito:
  0%, 100%: translateY(0) opacity(0.4)
  50%: translateY(-10px) opacity(0.6)
```

### Transição mês
```
Elemento: .mainContainer.animating
Duração: 150ms
Efeito: opacity: 0.7 → 1.0 (fade suave)
```

## 🌈 Esquema de Cores Detalhado

### Fundos
```
Primário: #0a0e14
  RGB: 10, 14, 20
  Uso: background principal
  
Secundário: #0f1419
  RGB: 15, 20, 25
  Uso: gradient top
  
Terciário: #0d1117
  RGB: 13, 17, 23
  Uso: gradient bottom
  
Card: rgba(20, 30, 45, 0.4)
  RGB: 20, 30, 45 @ 40%
  Uso: containers com backdrop-filter
```

### Texto
```
Primário: #e8e8ff
  RGB: 232, 232, 255
  Uso: títulos, texto principal
  Contraste: 12:1 com #0a0e14 ✓ WCAG AAA
  
Secundário: #cbd5e1
  RGB: 203, 213, 225
  Uso: subtítulos, data
  
Terciário: #94a3b8
  RGB: 148, 163, 184
  Uso: labels, hints
  
Disabled: #64748b
  RGB: 100, 116, 139
  Uso: dias desativados
```

### Acentos
```
Cinza Azulado: #64748b
  RGB: 100, 116, 139
  Uso: borders, hover states
  
Cinza Médio: #94a3b8
  RGB: 148, 163, 184
  Uso: destaque suave
  
Lua Cheia: #f5f5dc
  RGB: 245, 245, 220
  Uso: circle full moon
  
Dourado: #d4af37
  RGB: 212, 175, 55
  Uso: borda lua cheia
```

## 📱 Breakpoints Media Queries

```css
@media (max-width: 1024px) {
  grid-template-columns: 1fr;  /* muda para 1 coluna */
  gap: 1.5rem;
}

@media (max-width: 768px) {
  padding: 1rem;
  gap: 1rem;
  
  header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  moonCircle {
    width: 150px;
    height: 150px;
  }
  
  dayCell {
    min-height: 44px;  /* mobile tap target */
  }
}

@media (max-width: 480px) {
  dayButton {
    font-size: 0.7rem;
  }
  
  calendarGrid {
    padding: 0.75rem;
  }
  
  lunarIndicator {
    width: 10px;
    height: 10px;
  }
}
```

## 🔡 Tipografia

```
Base Size: 16px (1rem)

Headlines:
  h1 (title):
    size: clamp(1.5rem, 4vw, 2rem)
    weight: 400
    letter-spacing: 0.5px
  
  h2 (month):
    size: clamp(1rem, 3vw, 1.25rem)
    weight: 300
  
  h3 (phase name):
    size: 1.125rem (18px)
    weight: 400

Body:
  Regular: 0.875rem-0.95rem, weight 400
  Label: 0.75rem-0.8rem, weight 500
  Small: 0.85rem, weight 300

Line Height:
  headings: 1
  body: 1.5
  compact: 1.2
```

## 📦 CSS Modules Structure

```
LunarCalendarWidget.module.css
  .lunarCalendarWidget
  .header
  .title
  .year
  .mainContainer
  .heroSection
  .gridSection

LunarHero.module.css
  .lunarHero
  .header
  .dateText
  .moonContainer
  .moonCircle
  .phaseInfo
  .phaseName
  .starDecoration

CalendarGrid.module.css
  .calendarGrid
  .weekHeader
  .weekDayInitial
  .week
  .dayCell
  .dayButton
  .dayButton.today
  .dayButton.selected
  .selectionPill
  .lunarIndicator

NavigationControls.module.css
  .navigationControls
  .navButton
  .todayButton

MoonPhaseIcon.module.css
  .moonIcon
  .size-small
  .size-medium
  .size-large
```

## 🎯 Layout de Fold

### Above the Fold (Desktop)
```
┌─────────────────────────────────────┐
│ "Dezembro 2025" + Botões            │ ← Header
├──────────────────────────────────────┤
│ ◯ Lua Cheia      │  D S T Q Q S S   │
│ 99.8% iluminada  │  1 2 3 4 5 6 7   │ ← Visível
│ (hero moon)      │  8 9 ...         │
│                  │  ...             │
└─────────────────────────────────────┘
```

Tudo importante está visível sem scroll.

---

**Nota**: Esta arquitetura prioriza:
- ✅ Acessibilidade
- ✅ Responsividade mobile-first
- ✅ Performance (sem dependências)
- ✅ Legibilidade visual (alto contraste)
- ✅ Consistência de espaçamento (system spacing)
