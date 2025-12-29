# 🌙 Lunar Timeline Interativa

Visualização lunar contemplativa e física com scrubbing temporal em tempo real.

## ✨ Conceito

Uma experiência interativa onde o usuário **desliza o tempo com o dedo** e a Lua responde de forma contínua e fluida. As fases lunares não são estados fixos, mas uma **função contínua do tempo**.

## 🎯 Características Principais

### Interface
- ✅ **Fundo preto estrelado** com textura procedural
- ✅ **Lua grande e central** renderizada com Canvas
- ✅ **Timeline horizontal** com dias da semana (SEG, TER, QUA, etc)
- ✅ **Cursor fixo no centro** da tela
- ✅ **Scrubbing em tempo real** (60fps durante drag)

### Renderização da Lua
- ✅ **Procedural** - sem sprites, cálculo contínuo
- ✅ **Terminator realista** - linha dia/noite suavizada
- ✅ **Sombreamento esférico** - gradiente 3D
- ✅ **Crateras** - textura realista
- ✅ **Earthshine** - luz refletida da Terra na parte escura
- ✅ **Brilho (glow)** - halo luminoso em fases iluminadas

### Performance
- ✅ **60fps garantidos** durante scrubbing
- ✅ **Cache inteligente** - precisão de 5 minutos
- ✅ **requestAnimationFrame** para renderização
- ✅ **Canvas offscreen** pronto para pré-renderização
- ✅ **Touch e mouse unificados** - funciona em todos os dispositivos

## 📁 Estrutura de Arquivos

```
components/lunar-timeline/
├── LunarTimeline.tsx          # Componente principal (orquestrador)
├── MoonRenderer.tsx            # Renderização Canvas da Lua
├── Timeline.tsx                # Timeline horizontal com scrub
├── types.ts                    # Interfaces TypeScript
├── index.ts                    # Exportações
├── utils/
│   └── moonPhase.ts           # Cálculos astronômicos
└── styles/
    ├── LunarTimeline.module.css
    └── Timeline.module.css

app/lua/
├── page.tsx                   # Página da rota /lua
└── screen/
    └── LuaScreen.tsx          # Screen integrado
```

## 🚀 Uso Rápido

### Implementação Básica

```tsx
import { LunarTimeline } from '@/components/lunar-timeline';

function MyPage() {
  return (
    <LunarTimeline
      initialDate={new Date()}
      showDetails={true}
    />
  );
}
```

### Com Callback

```tsx
import { LunarTimeline, type MoonData } from '@/components/lunar-timeline';

function MyPage() {
  const handleDateChange = (date: Date, moonData: MoonData) => {
    console.log('Data:', date);
    console.log('Fase:', moonData.phaseName);
    console.log('Iluminação:', moonData.illumination);
  };

  return (
    <LunarTimeline
      initialDate={new Date()}
      onDateChange={handleDateChange}
      showDetails={true}
    />
  );
}
```

## 🎨 Customização

### Configuração da Lua

```tsx
import { MoonRenderer } from '@/components/lunar-timeline';

<MoonRenderer
  moonData={moonData}
  size={400}  // Tamanho em pixels
  config={{
    moonColor: '#e8e8e0',          // Cor base
    shadowColor: '#0a0a0a',        // Cor da sombra
    earthshineColor: '#1a1a2e',    // Cor da luz da Terra
    earthshineIntensity: 0.15,     // 0-1
    terminatorSoftness: 0.3,       // Suavidade (0-1)
    showCraters: true,             // Mostrar crateras
    showGlow: true                 // Mostrar brilho
  }}
/>
```

### Configuração da Timeline

```tsx
<Timeline
  currentDate={date}
  onDateChange={handleChange}
  visibleDays={7}        // Dias antes/depois do centro
  pixelsPerHour={12}     // Escala horizontal
/>
```

## 📊 Dados Lunares (MoonData)

A função `getMoonData()` retorna:

```typescript
interface MoonData {
  illumination: number;      // 0.0 - 1.0 (fração iluminada)
  phaseFraction: number;     // 0.0 - 1.0 (posição no ciclo)
  isWaxing: boolean;         // Crescente ou minguante
  phaseName: string;         // "Nova", "Crescente", "Cheia", etc.
  terminatorAngle: number;   // Ângulo do terminator (0-360°)
  date: Date;                // Data do cálculo
  daysSinceNew: number;      // Dias desde última lua nova
  lunarAge: number;          // Idade da lua (0-29.53 dias)
}
```

### Uso Direto

```tsx
import { getMoonData } from '@/components/lunar-timeline/utils/moonPhase';

const data = getMoonData(new Date());
console.log(data.phaseName);      // "Cheia"
console.log(data.illumination);   // 0.98
console.log(data.lunarAge);       // 14.2 dias
```

## 🎯 Fases Lunares

A nomenclatura é contínua e precisa:

| Fração | Nome |
|--------|------|
| 0.000 - 0.033 | Nova |
| 0.033 - 0.216 | Crescente |
| 0.216 - 0.283 | Quarto Crescente |
| 0.283 - 0.466 | Gibosa Crescente |
| 0.466 - 0.533 | Cheia |
| 0.533 - 0.716 | Gibosa Minguante |
| 0.716 - 0.783 | Quarto Minguante |
| 0.783 - 0.966 | Minguante |
| 0.966 - 1.000 | Nova |

## ⚡ Performance

### Cache

- Cache automático com precisão de 5 minutos
- Máximo de 1000 entradas
- LRU (Least Recently Used)

```typescript
import { clearMoonDataCache } from '@/components/lunar-timeline/utils/moonPhase';

// Limpar cache manualmente (útil para testes)
clearMoonDataCache();
```

### Otimizações

- ✅ Canvas com `desynchronized: true`
- ✅ `devicePixelRatio` para telas Retina
- ✅ `requestAnimationFrame` para renderização
- ✅ `useMemo` e `useCallback` para evitar re-renders
- ✅ Throttling implícito via arredondamento de cache

## 🎮 Interação

### Mouse
- Arrastar para scrubbar
- Cursor muda para `grab` / `grabbing`

### Touch
- Deslizar horizontalmente
- Suporta gestos nativos

### Teclado
- **Planejado**: Setas esquerda/direita para navegação

## 📱 Responsividade

### Desktop (>1024px)
- Lua: 320px
- Timeline: altura 120px
- Fonte: tamanho máximo

### Tablet (768-1024px)
- Lua: 240px
- Timeline: altura 100px
- Fonte: média

### Mobile (<768px)
- Lua: 200px
- Timeline: altura 90px
- Fonte: mínima

### Landscape Mobile
- Layout: Lua + Info lado a lado
- Timeline: altura reduzida

## 🔧 Funções Utilitárias

### Interpolação

```typescript
import { interpolateMoonData } from '@/components/lunar-timeline/utils/moonPhase';

const from = getMoonData(startDate);
const to = getMoonData(endDate);
const interpolated = interpolateMoonData(from, to, 0.5); // 50%
```

### Próxima Fase

```typescript
import { getNextPhase } from '@/components/lunar-timeline/utils/moonPhase';

const nextFull = getNextPhase(new Date(), 'Cheia');
console.log('Próxima lua cheia:', nextFull);
```

### Batch Loading

```typescript
import { getMoonDataBatch } from '@/components/lunar-timeline/utils/moonPhase';

const dates = [date1, date2, date3];
const dataArray = getMoonDataBatch(dates);
```

### Emojis e Descrições

```typescript
import { 
  getPhaseEmoji, 
  getIlluminationDescription 
} from '@/components/lunar-timeline/utils/moonPhase';

console.log(getPhaseEmoji('Cheia'));              // "🌕"
console.log(getIlluminationDescription(0.75));    // "Quase cheia"
```

## 🎨 Personalização CSS

### Variáveis Globais (exemplo)

```css
.lua-screen-timeline {
  --moon-color: #e8e8e0;
  --shadow-color: #0a0a0a;
  --bg-color: #000000;
  --cursor-color: #e8e8ff;
}
```

### Sobrescrever Estilos

```css
/* No seu CSS global ou module */
.lua-screen-timeline .moonSection {
  padding: 60px 20px;
}

.lua-screen-timeline .phaseName {
  font-size: 60px;
}
```

## 🐛 Debug

### Modo Development

O componente já inclui logs de debug em `development`:

```
📅 Data selecionada: 2025-12-28T15:30:00.000Z
🌙 Fase lunar: Minguante
💡 Iluminação: 23.4%
```

### Verificar Cache

```typescript
import { getMoonData } from '@/components/lunar-timeline/utils/moonPhase';

// Mesmo timestamp = retorna do cache (instantâneo)
const data1 = getMoonData(new Date('2025-12-28T15:30:00Z'));
const data2 = getMoonData(new Date('2025-12-28T15:32:00Z')); // Cache hit
```

## 🚀 Próximas Melhorias

### Planejadas
- [ ] Navegação por teclado (setas)
- [ ] Zoom na timeline (pinch-to-zoom)
- [ ] Snapshots de fases principais
- [ ] Modo "viagem rápida" (pular para próxima lua cheia)
- [ ] Tooltip com informações ao hover
- [ ] Animação de transição entre fases
- [ ] Suporte a localização geográfica (cálculos precisos)
- [ ] Export de imagem da lua atual

### Experimentais
- [ ] WebGL para renderização 3D avançada
- [ ] Física de inércia após soltar o drag
- [ ] Mapa estelar de fundo sincronizado com data
- [ ] Sons ambientes sincronizados com fases

## 📚 Referências

### Algoritmos Astronômicos
- Período sinódico: **29.53058867 dias**
- Referência de lua nova: **2000-01-06 18:14 UTC**
- Fórmula de iluminação: `(1 - cos(phaseFraction * 2π)) / 2`

### Tecnologias
- **Canvas API** para renderização
- **React Hooks** para estado
- **CSS Modules** para estilos
- **TypeScript** para type safety

## 🎓 Exemplos de Uso

### Integração com Auth

```tsx
import { LunarTimeline } from '@/components/lunar-timeline';
import { useAuth } from '@/hooks/useAuth';

function MyPage() {
  const { user } = useAuth();
  
  const handleSaveNote = (date: Date, moonData: MoonData) => {
    if (user) {
      // Salvar nota do usuário para esta data/fase
    }
  };

  return (
    <LunarTimeline
      initialDate={new Date()}
      onDateChange={handleSaveNote}
    />
  );
}
```

### Integração com Calendário

```tsx
import { LunarTimeline, getMoonData } from '@/components/lunar-timeline';

function EventCalendar() {
  const events = [
    { date: new Date('2025-12-31'), title: 'Ano Novo' }
  ];

  return (
    <>
      <LunarTimeline initialDate={new Date()} />
      <EventList events={events} />
    </>
  );
}
```

## 📄 Licença

Parte do projeto Cosmic Space.

## 🙏 Créditos

Desenvolvido com **contemplação e física** para uma experiência lunar imersiva.

---

**Versão**: 1.0.0  
**Data**: 28 de dezembro de 2025  
**Status**: ✅ Pronto para produção
