# Guia de Efeito de Zoom Interativo - Cosmic Space

Este documento explica em detalhes os dois efeitos de zoom implementados no projeto e como utilizá-los em outros repositórios.

## 📋 Resumo dos Dois Efeitos

### 1. **ZoomCanvas** (Página `/zoom`)
- **Tipo**: Visualização de sistema solar com múltiplos níveis de zoom
- **Elementos**: Sol, 4 planetas (Mercúrio, Terra, Júpiter, Saturno) com 4 luas cada
- **Interação**: Clique para focar/desfocar em planetas, luas ou sol
- **Câmera**: Pan + Zoom suave com lerp 8%
- **Características principais**:
  - Órbitas animadas com períodos realistas
  - Esferas sombreadas com gradientes
  - Zoom progressivo (1x até 6x)
  - Câmera segue objeto focado

### 2. **LuaView** (Página `/lua`)
- **Tipo**: Visualização de luas em camadas com fundo cósmico
- **Elementos**: Trilha luminosa, nebulosas, 8 luas (metade nova, metade cheia)
- **Interação**: Clique para focar em lua individual
- **Câmera**: Pan normalizado + Zoom 2.5x
- **Características principais**:
  - Estrelas cintilantes de fundo
  - Trilha senoidal luminosa
  - Luas flutuam suavemente
  - Overlay escurecido quando focado
  - Tecla ESC para resetar

---

## 🎯 Componentes Principais

### Sistema de Câmera

Ambos usam **lerp (linear interpolation)** para suavizar movimentos:

```typescript
// Lerp: interpolação linear suave
state.zoom += (state.targetZoom - state.zoom) * ZOOM_CONFIG.cameraEasing;
state.camX += (state.targetCamX - state.camX) * ZOOM_CONFIG.cameraEasing;
state.camY += (state.targetCamY - state.camY) * ZOOM_CONFIG.cameraEasing;
```

**Fator de easing**: `0.08` (8% por frame)
- Quanto maior: movimento mais rápido
- Quanto menor: movimento mais suave

### Detecção de Clique

**ZoomCanvas**:
```typescript
const handleCanvasClick = (e: MouseEvent) => {
  // 1. Converter coordenadas de tela para mundo
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  // 2. Testar colisão com Sol (raio fixo)
  const distSun = Math.hypot(clickX - state.sunScreenX, clickY - state.sunScreenY);
  if (distSun < SUN_RADIUS * state.zoom + 15) {
    clickedSun = true;
  }
  
  // 3. Testar colisão com Planetas
  for (const p of PLANETS) {
    const dist = Math.hypot(clickX - p.screenX, clickY - p.screenY);
    if (dist < p.size * state.zoom + 10) {
      clickedPlanet = p;
    }
  }
  
  // 4. Testar colisão com Luas
  for (const p of PLANETS) {
    for (const moon of moonsToCheck) {
      const distM = Math.hypot(clickX - moon.screenX, clickY - moon.screenY);
      if (distM < moon.size * state.zoom + 8) {
        clickedMoon = moon;
      }
    }
  }
};
```

**LuaView**:
```typescript
function findClickedMoon(screenX: number, screenY: number) {
  // Converter coordenadas de tela para mundo normalizado
  const world = screenToWorldNormalized(screenX, screenY);
  
  // Testar colisão em espaço normalizado
  for (const m of moons) {
    const dx = world.x - m.x;
    const dy = world.y - m.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist <= m.radius * 1.4) {
      return m;
    }
  }
}
```

### Renderização com Canvas Transform

**ZoomCanvas** - Stack de transformações:
```typescript
ctx.save();
ctx.translate(canvas.width / 2, canvas.height / 2);  // Centro
ctx.scale(state.zoom, state.zoom);                   // Zoom
ctx.translate(state.camX, state.camY);               // Pan
// ... desenha objetos ...
ctx.restore();
```

**LuaView** - Stack com coordenadas normalizadas:
```typescript
ctx.translate(canvasEl.width / 2, canvasEl.height / 2);
ctx.scale(c.scale, c.scale);
ctx.translate(-cxPix, -cyPix);  // Pan inverso
```

---

## 🔧 Configurações

### ZoomCanvas
```typescript
export const ZOOM_CONFIG = {
  cameraEasing: 0.08,      // Velocidade de interpolação
  daysPerSecond: 0.5,      // Velocidade de simulação do tempo
};
```

### Estados de Zoom - ZoomCanvas

| Alvo | Zoom | Câmera |
|------|------|--------|
| Visão Geral | 1x | (0, 0) |
| Sol Focado | 4.5x | (0, 0) |
| Planeta | 4.5x | -planeta.worldX, -planeta.worldY |
| Lua | 6x | -lua.worldX, -lua.worldY |

### Estados de Zoom - LuaView

| Alvo | Zoom | Câmera |
|------|------|--------|
| Visão Geral | 1.0x | (0.5, 0.5) |
| Lua Focada | 2.5x | (lua.x, lua.y) |

---

## 📊 Estrutura de Dados

### ZoomCanvas

```typescript
interface Planet {
  name: string;
  radius: number;           // Raio da órbita
  size: number;             // Tamanho visual
  periodDays: number;       // Período orbital
  angleOffset: number;      // Offset inicial
  color: string;            // Cor hexadecimal
  spinAngle: number;        // Rotação visual
  moons: Moon[];            // Luas orbitais
  screenX?: number;         // Coordenada em tela (calculada)
  worldX?: number;          // Coordenada no mundo (calculada)
  screenY?: number;
  worldY?: number;
}

interface Moon {
  orbitRadius: number;      // Raio da órbita ao redor planeta
  size: number;             // Tamanho visual
  periodDays: number;       // Período orbital
  angleOffset: number;      // Offset inicial
  screenX?: number;         // Coordenada em tela (calculada)
  worldX?: number;          // Coordenada no mundo (calculada)
  screenY?: number;
  worldY?: number;
  planet?: Planet;          // Referência ao planeta
}

interface FocusedTarget {
  type: "sun" | "planet" | "moon";
  target: Planet | Moon | null;
}
```

### LuaView

```typescript
interface Moon {
  id: number;
  type: "moon";
  phase: "new" | "full";
  x: number;                // Coordenada normalizada (0-1)
  y: number;
  radius: number;           // Em coordenadas normalizadas
  color: string;            // Cor específica da lua
  floatPhase: number;       // Para animação de flutuação
}

interface Camera {
  current: { x: number; y: number; scale: number };
  target: { x: number; y: number; scale: number };
  lerpFactor: number;
}
```

---

## 🎨 Técnicas Visuais

### Esferas Sombreadas (drawShadedSphere)

Cria efeito 3D com gradiente radial:

```typescript
const drawShadedSphere = (
  ctx: CanvasRenderingContext2D,
  radius: number,
  baseColor: string,
  spinAngle: number
) => {
  // Posição da luz baseada em rotação
  const lx = Math.cos(spinAngle) * radius * 0.5;
  const ly = Math.sin(spinAngle) * radius * 0.5;

  // Gradiente: branco (luz) -> cor base -> sombra
  const gradient = ctx.createRadialGradient(
    lx, ly, lightRadius * 0.2,  // Centro da luz
    0, 0, radius                 // Até a borda
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");    // Brilho
  gradient.addColorStop(0.3, baseColor);                  // Cor
  gradient.addColorStop(0.8, shadeColor(baseColor, -30));// Sombra
  gradient.addColorStop(1, "rgba(0,0,0,0.9)");           // Borda escura
};
```

### Trilha Luminosa Senoidal (LuaView)

```typescript
function getTrailPoint(t: number, time: number) {
  const baseX = t;
  const baseY = 1 - t;
  const phase = time * trail.phaseSpeed;
  const offset = trail.amplitude * Math.sin(
    trail.frequency * t * Math.PI * 2 + phase
  );
  return { x: baseX, y: baseY + offset };
}
```

### Halos Luminosos

```typescript
const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
haloGrad.addColorStop(0, `rgba(255, 255, 230, ${haloStrength})`);
haloGrad.addColorStop(1, "rgba(255, 255, 230, 0)");
ctx.fillStyle = haloGrad;
ctx.arc(x, y, r * 2, 0, Math.PI * 2);
ctx.fill();
```

### Efeito de Cintilação

```typescript
const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.3 + 0.7;
const alpha = s.baseAlpha * twinkle;
```

---

## 🚀 Como Adaptar para Outro Repositório

### Passo 1: Copie os Arquivos Base

```bash
# ZoomCanvas
cp components/ZoomCanvas.tsx seu-repo/src/components/

# LuaView
cp components/views/LuaView.tsx seu-repo/src/components/

# Tipos
cp types/canvas.ts seu-repo/src/types/

# Configuração
cp lib/constants/config.ts seu-repo/src/lib/constants/
cp lib/constants/colors.ts seu-repo/src/lib/constants/
```

### Passo 2: Dependências

Ambos usam **apenas React e Canvas API** (sem bibliotecas externas):

```json
{
  "dependencies": {
    "react": "^18.0.0"
  }
}
```

### Passo 3: Exemplo de Integração

**Para ZoomCanvas**:
```tsx
import { ZoomCanvas } from '@/components/ZoomCanvas';

export default function MyZoomPage() {
  return (
    <main className="w-full h-screen">
      <ZoomCanvas />
    </main>
  );
}
```

**Para LuaView**:
```tsx
import { LuaView } from '@/components/views/LuaView';

export default function MyLuaPage() {
  return (
    <main className="min-h-screen bg-black">
      <LuaView />
    </main>
  );
}
```

### Passo 4: Personalizações

**Alterar velocidade de zoom**:
```typescript
// ZoomCanvas
state.zoom += (state.targetZoom - state.zoom) * 0.12;  // Mais rápido (default: 0.08)
```

**Alterar níveis de zoom**:
```typescript
// Planeta focado
state.targetZoom = 5.5;  // default: 4.5

// Lua focada
state.targetZoom = 7;    // default: 6
```

**Adicionar novos objetos (ZoomCanvas)**:
```typescript
const PLANETS: Planet[] = [
  // ...existing
  {
    name: "Neptune",
    radius: 340,
    size: 8,
    periodDays: 60190,
    angleOffset: 1.2,
    color: "#4b70dd",
    spinAngle: 0,
    moons: createMoonsForPlanet(8),
  },
];
```

**Adicionar novas luas (LuaView)**:
```typescript
const moons: Moon[] = [
  // ...existing
  {
    id: 9,
    type: "moon",
    phase: "full",
    x: 0.5,
    y: 0.5,
    radius: 0.025,
    color: "#ff6b9d",
    floatPhase: Math.random() * Math.PI * 2,
  },
];
```

---

## 🎮 Eventos e Interações

### ZoomCanvas

| Ação | Efeito |
|------|--------|
| Clique em Sol | Zoom 4.5x no centro |
| Clique em Planeta | Zoom 4.5x no planeta |
| Clique em Lua | Zoom 6x na lua |
| Clique vazio | Volta para visão geral |
| Duplo clique no mesmo | Desfoca |

### LuaView

| Ação | Efeito |
|------|--------|
| Clique em Lua | Zoom 2.5x na lua + overlay escuro |
| Clique em lua focada | Desfocar |
| Tecla ESC | Desfocar |

---

## ⚡ Performance

### Otimizações Utilizadas

1. **useRef para estado** - Evita re-renders desnecessários
2. **requestAnimationFrame** - Sincronizado com frame rate
3. **Canvas context.save/restore** - Evita estado acumulado
4. **Cálculos em screen space** - Evita transformações redundantes
5. **Cleanup em useEffect** - Remove listeners e cancela animações

### Métricas

- **FPS**: 60 (target)
- **Memory**: ~2-5MB por canvas
- **CPU**: ~5-10% em desktop moderno

---

## 🐛 Troubleshooting

### Canvas não aparece
```typescript
// Verificar se canvas ref existe
if (!canvasRef.current) return;

// Verificar context 2D
const ctx = canvas.getContext('2d');
if (!ctx) return;
```

### Cliques não funcionam
```typescript
// Garantir que screenX/screenY estão sendo calculados
p.screenX = canvas.width / 2 + (x + state.camX) * state.zoom;
p.screenY = canvas.height / 2 + (y + state.camY) * state.zoom;
```

### Zoom muito rápido/lento
```typescript
// Ajustar easing factor
ZOOM_CONFIG.cameraEasing = 0.15;  // Mais rápido
ZOOM_CONFIG.cameraEasing = 0.05;  // Mais lento
```

---

## 📚 Referências no Código

- **ZoomCanvas**: `/components/ZoomCanvas.tsx` (533 linhas)
- **LuaView**: `/components/views/LuaView.tsx` (616 linhas)
- **Types**: `/types/canvas.ts`
- **Config**: `/lib/constants/config.ts`
- **Cores**: `/lib/constants/colors.ts`

---

## ✨ Diferenciais de Cada Um

### ZoomCanvas é melhor para:
- ✅ Sistemas com múltiplos níveis (sol → planetas → luas)
- ✅ Órbitas com períodos variáveis
- ✅ Visualizações científicas/educacionais
- ✅ Zoom profundo (até 6x)

### LuaView é melhor para:
- ✅ Cenários poéticos/artísticos
- ✅ Foco em visual (trilha, nebulosas, stars)
- ✅ Menos elementos (8 vs 20+)
- ✅ Interface mais simples

---

Aproveita bem! Se tiver dúvidas, consulta o código original! 🚀
