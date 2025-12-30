# 🌙 Lunar Calendar Widget

Um componente React de calendário lunar minimalista com design astronômico dark-mode, layout 2 colunas responsivo e acessibilidade completa.

## ✨ Características

- **Design Minimalista**: fundo #0a0e14 com textura de estrelas sutil
- **Layout Responsivo**: 2 colunas (desktop) → 1 coluna (mobile)
- **Hero Visual**: círculo lunar 200px com fase e % iluminação
- **Grid Mensal**: 7 colunas com dias, mini-ícones de fase
- **Navegação**: setas para mês anterior/próximo + botão "Hoje"
- **Acessibilidade**: aria-labels, foco visível, navegação por teclado
- **Sem Dependências**: apenas React + CSS nativo
- **TypeScript**: tipos completos para props e dados
- **Animações**: fade suave ao trocar mês, glow na lua, twinkle nas estrelas

## 📦 Instalação

```bash
# O componente já está em:
components/lunar-calendar/

# Importar:
import { LunarCalendarWidget } from '@/components/lunar-calendar';
```

## 🚀 Uso Básico

```tsx
import { useState } from 'react';
import { LunarCalendarWidget, generateMockLunarData } from '@/components/lunar-calendar';

export default function MyCalendarPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // Dados lunares (simulados ou de API)
  const lunarData = generateMockLunarData(year, month);

  return (
    <LunarCalendarWidget
      month={month}
      year={year}
      selectedDate={selectedDate}
      onSelectDate={setSelectedDate}
      lunarDataByDate={lunarData}
      onMonthChange={(m, y) => {
        setMonth(m);
        setYear(y);
      }}
      locale="pt-BR"
    />
  );
}
```

## 🎨 Props

```typescript
interface LunarCalendarProps {
  month: number; // 0-11 (janeiro-dezembro)
  year: number; // 2024, 2025, etc
  selectedDate?: Date; // data selecionada (padrão: hoje)
  onSelectDate?: (date: Date) => void; // callback ao selecionar dia
  lunarDataByDate: LunarDataByDate; // dados por data "YYYY-MM-DD"
  onMonthChange?: (month: number, year: number) => void;
  locale?: 'pt-BR' | 'en-US'; // padrão: 'pt-BR'
  ariaLabel?: string; // label acessível
}
```

## 📊 Estrutura de Dados Lunares

```typescript
interface LunarData {
  phase: MoonPhase;        // 'new', 'full', 'waxing_crescent', etc
  illumination: number;    // 0-100 (percentual)
  phaseName: string;       // "Lua Cheia", "Crescente", etc
  daysInPhase?: number;    // dias nesta fase
  nextPhaseDate?: Date;    // próxima mudança de fase
}

// Formato completo esperado:
{
  "2025-12-28": { phase, illumination, phaseName, ... },
  "2025-12-29": { ... }
}
```

## 🌙 Fases Lunares Suportadas

- `new` - Lua Nova (0% iluminação)
- `waxing_crescent` - Crescente (1-49%)
- `first_quarter` - Quarto Crescente (~50%)
- `waxing_gibbous` - Gibosa Crescente (51-99%)
- `full` - Lua Cheia (100%)
- `waning_gibbous` - Gibosa Minguante (99-51%)
- `last_quarter` - Quarto Minguante (~50%)
- `waning_crescent` - Minguante (49-1%)

## 🎯 Componentes Internos

### LunarCalendarWidget

Componente principal que orquestra tudo.

### LunarHero

Seção esquerda com círculo lunar e informações de fase.

```tsx
<LunarHero date={selectedDate} lunarData={lunarData} locale="pt-BR" />
```

### CalendarGrid

Grid mensal com 7 colunas × N linhas.

```tsx
<CalendarGrid
  weeks={weeks}
  selectedDate={selectedDate}
  onSelectDate={handleSelect}
  locale="pt-BR"
/>
```

### NavigationControls

Botões: ← mês anterior | Hoje | mês próximo →

### MoonPhaseIcon

Ícone SVG da fase lunar em 3 tamanhos.

```tsx
<MoonPhaseIcon
  phase="full"
  illumination={95.5}
  size="large" // 'small' | 'medium' | 'large'
  variant="icon" // 'icon' | 'circle'
/>
```

## 🎨 Paleta de Cores

```
Fundo: #0a0e14 (muito escuro, quase preto)
Primário: #e8e8ff (branco com leve azul)
Secundário: #cbd5e1 (cinza claro)
Terciário: #94a3b8 (cinza médio)
Destaque: rgba(100, 116, 139, ...) (cinza azulado)
Lua Cheia: #f5f5dc (creme)
Lua Nova: #0a0e13 (praticamente invisível)
```

## 🛠️ Customização

### Mudar cor de fundo

```css
/* components/lunar-calendar/styles/LunarCalendarWidget.module.css */
.lunarCalendarWidget {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}
```

### Tamanho da lua

```css
/* components/lunar-calendar/styles/LunarHero.module.css */
.moonCircle {
  width: 250px; /* era 200px */
  height: 250px;
}
```

### Fonte customizada

```tsx
/* Adicione a fonte no layout.tsx ou globals.css */
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500&display=swap');

.lunarCalendarWidget {
  font-family: 'Raleway', sans-serif;
}
```

## ♿ Acessibilidade

- ✅ Aria-labels em todos os dias
- ✅ Foco visível (outline azul)
- ✅ Navegação com teclado (Tab, Enter, Space)
- ✅ Semântica HTML5 (role="grid", role="gridcell")
- ✅ Contraste de cor WCAG AA (ratio ~12:1)
- ✅ Touch targets 44px+ (mobile)

## 📱 Responsividade

| Breakpoint | Layout    | Mudanças                        |
| ---------- | --------- | ------------------------------- |
| >1024px    | 2 colunas | hero à esquerda                 |
| 768-1024px | 1 coluna  | hero reduzido (150px)           |
| <768px     | 1 coluna  | botões 44px, fontes com clamp() |

## 🎬 Animações

| Nome       | Duração | Efeito                      |
| ---------- | ------- | --------------------------- |
| `moonGlow` | 6s      | sombra pulsante na lua      |
| `twinkle`  | 8s      | estrelas piscam levemente   |
| `float`    | 6s      | estrelas flutuam suavemente |
| Transição  | 0.2s    | hover states, focus         |

## 🧪 Dados de Teste

```tsx
import { generateMockLunarData } from '@/components/lunar-calendar';

// Gera dados aleatórios para demonstração
const mockData = generateMockLunarData(2025, 11); // dez/2025
```

## 🔗 Integração com API

```tsx
useEffect(() => {
  fetch(`/api/lunar-data?month=${month}&year=${year}`)
    .then((res) => res.json())
    .then((data) => setLunarData(data.byDate))
    .catch((err) => console.error(err));
}, [month, year]);
```

## 📝 Utilitários Disponíveis

```typescript
import {
  generateCalendarGrid, // criar grid 7xN
  enrichCalendarWithLunarData, // adicionar dados lunares
  formatDateKey, // "2025-12-28"
  formatDate, // "domingo, dez. 28, 2025"
  getMonthName, // "dezembro"
  getWeekDayInitials, // ['D', 'S', 'T', ...]
  isToday, // verifica se é hoje
  isSameDay, // compara duas datas
  generateMockLunarData, // cria dados simulados
} from '@/components/lunar-calendar';
```

## 🚀 Deploy

- ✅ Sem dependências externas (apenas React)
- ✅ CSS Modules (zero conflito)
- ✅ TypeScript completo
- ✅ Pronto para Vercel, Netlify, Next.js hosting

## 📚 Documentação Completa

Veja [LUNAR_CALENDAR_DOCS.md](../doc/LUNAR_CALENDAR_DOCS.md) para:

- Arquitetura detalhada
- Todas as props e tipos
- Guia de customização
- Exemplos avançados
- Checklist de responsividade

## 🤝 Contribuições

Melhorias sugeridas:

1. Adicionar eventos/badges em dias específicos
2. Modo light theme
3. Histórico de iluminação em gráfico
4. Notificações de eventos lunares
5. Export para PDF/iCal

## 📞 Suporte

Dúvidas sobre tipos ou props? Verifique:

- `components/lunar-calendar/types.ts` (interfaces)
- `components/lunar-calendar/utils.ts` (lógica)
- `app/calendarioc/page.tsx` (exemplo)

---

**Status**: ✅ Pronto para produção  
**Versão**: 1.0.0  
**Última atualização**: 28/12/2025
