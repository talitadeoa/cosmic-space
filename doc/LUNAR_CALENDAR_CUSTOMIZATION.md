# 🎨 Guia de Customização Visual - Calendário Lunar

## 🌈 Temas Pré-prontos

### Tema 1: Dark Midnight (Padrão)
```css
/* LunarCalendarWidget.module.css */
background: linear-gradient(135deg, #0a0e14 0%, #0f1419 50%, #0d1117 100%);
--color-primary: #e8e8ff;
--color-secondary: #cbd5e1;
--color-accent: rgba(100, 116, 139, ...);
```
**Vibe**: Muito escuro, noturno, astronômico

---

### Tema 2: Deep Ocean
```css
background: linear-gradient(135deg, #0a1f3f 0%, #1a3a5f 50%, #0d2850 100%);

/* Cores */
--color-primary: #e0f4ff;      /* azul claro */
--color-accent: #4a90ff;       /* azul vibrante */

/* Atualizações */
.moonCircle {
  border: 2px solid rgba(74, 144, 255, 0.3);
  box-shadow: 0 0 40px rgba(74, 144, 255, 0.2);
}

.dayButton.selected {
  background: rgba(74, 144, 255, 0.2);
}
```

---

### Tema 3: Purple Twilight
```css
background: linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1f0f3d 100%);

/* Cores */
--color-primary: #f0e6ff;      /* roxo claro */
--color-accent: #9b59b6;       /* roxo vibrante */

.moonCircle {
  border-color: rgba(155, 89, 182, 0.3);
  box-shadow: 0 0 40px rgba(155, 89, 182, 0.2);
}

.dayButton.today {
  background: rgba(155, 89, 182, 0.2);
}
```

---

### Tema 4: Forest Night
```css
background: linear-gradient(135deg, #0d1f0f 0%, #1a3d1f 50%, #0f2912 100%);

/* Cores */
--color-primary: #d4f1d4;      /* verde claro */
--color-accent: #27ae60;       /* verde vibrante */

.selectionPill {
  background: rgba(39, 174, 96, 0.25);
}
```

---

### Tema 5: Amber Night (Quente)
```css
background: linear-gradient(135deg, #2d1b0a 0%, #4a2f15 50%, #3a2410 100%);

/* Cores */
--color-primary: #ffe8cc;      /* âmbar claro */
--color-accent: #d4af37;       /* dourado */

.moonCircle {
  background: radial-gradient(circle, rgba(212, 175, 55, 0.1), rgba(10, 15, 20, 0.5));
}

.dayButton.selected {
  background: rgba(212, 175, 55, 0.2);
}
```

---

## 🎯 Customização Passo a Passo

### 1. Mudar Cor de Fundo

**Arquivo**: `components/lunar-calendar/styles/LunarCalendarWidget.module.css`

```css
/* Antes */
.lunarCalendarWidget {
  background: linear-gradient(135deg, #0a0e14 0%, #0f1419 50%, #0d1117 100%);
}

/* Depois - Seu novo gradient */
.lunarCalendarWidget {
  background: linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 50%, #1f0f3d 100%);
}
```

### 2. Mudar Cor Primária (Texto)

**Opção A: CSS Variable** (recomendado)
```css
:root {
  --color-primary: #e8e8ff;
}

.lunarCalendarWidget {
  color: var(--color-primary);
}
```

**Opção B: Substituição Global**
```bash
# Bash (Linux/Mac)
find components/lunar-calendar/styles -name "*.css" \
  -exec sed -i 's/#e8e8ff/#f0e6ff/g' {} \;

# Ou editar manualmente em cada arquivo
```

### 3. Mudar Tamanho da Lua

**Arquivo**: `components/lunar-calendar/styles/LunarHero.module.css`

```css
/* Desktop */
.moonCircle {
  width: 200px;    /* ← Altere aqui */
  height: 200px;   /* ← Altere aqui */
}

/* Tablet */
@media (max-width: 1024px) {
  .moonCircle {
    width: 150px;   /* ← Altere aqui */
    height: 150px;  /* ← Altere aqui */
  }
}

/* Mobile */
@media (max-width: 768px) {
  .moonCircle {
    width: 120px;   /* ← Altere aqui */
    height: 120px;  /* ← Altere aqui */
  }
}
```

### 4. Mudar Espacing (Padding/Gap)

**Arquivo**: `components/lunar-calendar/styles/LunarCalendarWidget.module.css`

```css
.header {
  padding: 2rem 2rem 1.5rem;    /* ← Altere aqui */
  gap: 1.5rem;                   /* ← Altere aqui */
}

.mainContainer {
  gap: 2rem;                      /* ← Altere aqui */
  padding: 2rem;                  /* ← Altere aqui */
}
```

### 5. Mudar Animações

**Arquivo**: `components/lunar-calendar/styles/LunarHero.module.css`

```css
/* Mudar duração da animação */
@keyframes moonGlow {
  /* ... */
}

.moonCircle {
  animation: moonGlow 6s ease-in-out infinite;
  /* ↑ 6s = duração | ease-in-out = tipo | infinite = loop */
  
  /* Altere para: */
  animation: moonGlow 8s ease-in infinite;  /* mais lento, linear */
}

/* Desabilitar animação */
.moonCircle {
  animation: none;
}
```

### 6. Mudar Fonte

**Arquivo**: `components/lunar-calendar/styles/LunarCalendarWidget.module.css`

```css
/* Adicionar fonte customizada */
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

.lunarCalendarWidget {
  font-family: 'Space Mono', monospace;  /* ← Sua fonte */
}

/* Ou usar sistema */
.lunarCalendarWidget {
  font-family: 'Courier New', monospace;
}
```

### 7. Mudar Border Radius

**Arquivo**: Todos os arquivos `.css`

```css
/* Mais arredondado */
.lunarHero {
  border-radius: 2.5rem;  /* era 2rem */
}

.dayButton {
  border-radius: 1rem;    /* era 0.75rem */
}

/* Menos arredondado (squarish) */
.lunarHero {
  border-radius: 1rem;    /* era 2rem */
}

.dayButton {
  border-radius: 0.25rem; /* era 0.75rem */
}
```

### 8. Mudar Sombras (Shadows)

**Arquivo**: Todos os arquivos `.css`

```css
/* Mais pronunciado */
.lunarHero {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);  /* era 0 8px 32px ... */
}

/* Mais sutil */
.lunarHero {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);   /* era 0 8px 32px ... */
}

/* Sem sombra */
.lunarHero {
  box-shadow: none;
}
```

### 9. Mudar Opacity/Transparência

**Arquivo**: Todos os arquivos `.css`

```css
/* Mais opaco (sólido) */
.calendarGrid {
  background: rgba(20, 30, 45, 0.6);   /* era 0.4 (40%) */
}

/* Mais transparente */
.calendarGrid {
  background: rgba(20, 30, 45, 0.2);   /* era 0.4 (40%) */
}
```

### 10. Mudar Cores de Hover

**Arquivo**: `components/lunar-calendar/styles/CalendarGrid.module.css`

```css
.dayButton:hover:not(:disabled) {
  color: #f5f5f5;                          /* ← cor do texto */
  background: rgba(100, 116, 139, 0.15);   /* ← cor do fundo */
}

/* Mudar para */
.dayButton:hover:not(:disabled) {
  color: #ffffff;                          /* branco puro */
  background: rgba(100, 116, 139, 0.3);    /* mais opaco */
  transform: scale(1.05);                  /* zoom leve */
}
```

---

## 🎭 Transformações Radicais

### Dark Mode Extremo
```css
.lunarCalendarWidget {
  background: #000000;  /* preto puro */
  --color-primary: #ffffff;
}
```

### Light Mode
```css
.lunarCalendarWidget {
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  --color-primary: #1a1a1a;
  --color-secondary: #4a4a4a;
  --color-accent: #333333;
}

.calendarGrid {
  background: rgba(240, 240, 240, 0.8);
  border-color: rgba(0, 0, 0, 0.15);
}
```

### Neon Cyberpunk
```css
.lunarCalendarWidget {
  background: #000000;
  --color-primary: #00ff88;  /* neon verde */
  --color-accent: #ff00ff;   /* neon magenta */
}

.dayButton.selected {
  background: rgba(0, 255, 136, 0.2);
  text-shadow: 0 0 10px #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

.moonCircle {
  box-shadow: 0 0 40px rgba(0, 255, 136, 0.4);
}
```

### Glassmorphism (frosted glass)
```css
.lunarHero,
.calendarGrid {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);  /* era 10px */
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

---

## 🔧 Variáveis CSS (CSS Custom Properties)

Adicione ao `LunarCalendarWidget.module.css`:

```css
:root {
  /* Cores */
  --color-bg: #0a0e14;
  --color-bg-secondary: #0f1419;
  --color-text-primary: #e8e8ff;
  --color-text-secondary: #cbd5e1;
  --color-text-tertiary: #94a3b8;
  --color-accent: rgb(100, 116, 139);
  --color-moon-full: #f5f5dc;
  --color-moon-new: #0a0e13;
  
  /* Spacing */
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Border Radius */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1.5rem;
  
  /* Transições */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
}

/* Usar em todo lugar */
.dayButton {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  color: var(--color-text-primary);
}
```

---

## 📱 Breakpoints Customizados

Se quiser mudar os pontos de quebra:

**Arquivo**: Todos os `@media` queries

```css
/* Padrão atual */
@media (max-width: 1024px) { ... }
@media (max-width: 768px) { ... }
@media (max-width: 480px) { ... }

/* Novo: para telas muito grandes */
@media (min-width: 1920px) {
  .mainContainer {
    max-width: 1800px;
  }
  
  .moonCircle {
    width: 250px;
    height: 250px;
  }
}

/* Novo: para tablets específicos */
@media (min-width: 768px) and (max-width: 1024px) {
  .header {
    padding: 1.5rem;
  }
}
```

---

## 🎬 Presets de Velocidade de Animação

```css
/* Lento (para efeito dramático) */
.moonCircle {
  animation: moonGlow 12s ease-in-out infinite;
}

/* Normal (padrão) */
.moonCircle {
  animation: moonGlow 6s ease-in-out infinite;
}

/* Rápido (energético) */
.moonCircle {
  animation: moonGlow 3s ease-in-out infinite;
}

/* Muito rápido */
.moonCircle {
  animation: moonGlow 1.5s ease-in-out infinite;
}

/* Sem animação */
.moonCircle {
  animation: none;
}
```

---

## 🎨 Paletas de Cores Prontas

### Minimalista (atual)
```
#0a0e14, #e8e8ff, #cbd5e1, #94a3b8
```

### Warmth
```
#1a0f0a, #ffe8cc, #e6b88a, #d4a574
```

### Cool
```
#0a1f3f, #e0f4ff, #a8d5ff, #5fa3cc
```

### Vibrant
```
#1a1a2e, #00d4ff, #ff006e, #8338ec
```

### Soft
```
#2a2a3e, #dcdce6, #b8b8d1, #8a8aa8
```

---

## 📋 Checklist de Customização

- [ ] Escolheu tema base ou cores customizadas
- [ ] Atualizou `LunarCalendarWidget.module.css`
- [ ] Testou em 3 breakpoints (desktop, tablet, mobile)
- [ ] Verificou contraste WCAG (ratio mínimo 4.5:1)
- [ ] Testou com light mode (se implementou)
- [ ] Validou animações (smooth, não demoradas)
- [ ] Screenshot antes/depois
- [ ] Documente mudanças em comentário

---

## 🚀 Deploy de Tema Customizado

Se criar um tema novo legal, considere:

1. **Criar variante de arquivo**:
   ```
   styles/LunarCalendarWidget.theme-cyberpunk.css
   ```

2. **Exportar como classe**:
   ```tsx
   <div className={`${styles.lunarCalendarWidget} ${styles.themeCyberpunk}`}>
   ```

3. **Permitir seleção de tema**:
   ```tsx
   <select onChange={(e) => setTheme(e.target.value)}>
     <option>dark-midnight</option>
     <option>cyberpunk</option>
     <option>ocean</option>
   </select>
   ```

---

**Divirta-se customizando!** 🎨🌙
