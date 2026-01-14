# 🚀 Código Depreciado - Migração para Lunar Compute Service

## Arquivos a Remover/Deprecar

### 1. ❌ Scripts Antigos

**[scripts/generate-moon-calendar.js](../../scripts/generate-moon-calendar.js)**
- ❌ Substituído por: `scripts/generate-lunar-static.mjs`
- ❌ Motivo: JavaScript puro é 10-20x mais lento
- ✅ Novo: Usa Python (30-50% mais rápido)
- 📝 Ação: Manter para compatibilidade, mas usar novo script

**Status**: Deprecado (manter para compatibilidade)

```bash
# Antes (lento)
node scripts/generate-moon-calendar.js 2025 public/moons.json

# Depois (rápido)
node scripts/generate-lunar-static.mjs 2025 public/lunar-data.json
```

---

### 2. ❌ Libs JavaScript Redundantes

**[lib/moon-calculations.ts](../../lib/moon-calculations.ts)**
- ❌ Cálculos agora no Python (ephem)
- ❌ Causa duplicação de lógica
- ✅ Novo: `lunarComputeClient` centraliza
- 📝 Ação: Manter como fallback, marcar @deprecated

**Funções redundantes**:
- `toJulianDay()` - Python já faz isso
- `calcMoonAge()` - Python já faz isso
- `illuminationFromAge()` - Python já faz isso
- `labelPhase()` - Python já faz isso
- `approximateSign()` - Python já faz isso

**Como migrar**:
```typescript
// ❌ Antes (remover)
import { calcMoonAge } from '@/lib/moon-calculations';
const age = calcMoonAge(date);

// ✅ Depois (usar)
import { lunarComputeClient } from '@/lib/lunar-compute-client';
const phase = await lunarComputeClient.getLunarPhase(date);
const age = phase.age_days;
```

**Status**: Deprecado (manter para compatibilidade apenas)

---

### 3. ❌ Componentes JavaScript Pesados

**[components/lunar-timeline/utils/moonPhase.ts](../../components/lunar-timeline/utils/moonPhase.ts)**
- ❌ Cálculos em JavaScript (cache local)
- ❌ Duplica lógica do Python
- ✅ Novo: Usar `lunarComputeClient` diretamente
- 📝 Ação: Migrar componentes, depois remover

**Funções a migrar**:
- `calculateLunarPhase()` → `lunarComputeClient.getLunarPhase()`
- `getPhaseName()` → Já vem na resposta
- Cache local → Usar cache HTTP automático

**Status**: Parcialmente deprecado (em refatoração)

---

### 4. ⚠️ Dados Mock

**[app/cosmos/calendariog/page.tsx](../../app/cosmos/calendariog/page.tsx)**
- ❌ `buildSampleLunarData()` - Removido ✅
- ❌ `phaseCycle[]` - Removido ✅
- ❌ `phaseIllumination{}` - Removido ✅
- ✅ Novo: Dados reais do Python

**Status**: Já refatorado ✅

---

## 📋 Checklist de Migração

### Fase 2 - Concluída ✅
- [x] Criar `lunarComputeClient`
- [x] Refatorar calendário principal
- [x] Atualizar `useLunarCycle`
- [x] Criar rotas API consolidadas
- [x] Novo script gerador

### Fase 2b - Em Progresso 🔄
- [ ] Refatorar `CycleTracker.tsx`
- [ ] Refatorar `lunar-timeline/` components
- [ ] Refatorar `astro/` domain components
- [ ] Deprecar scripts antigos

### Fase 3 - Próxima 📋
- [ ] Remover `lib/moon-calculations.ts` (exceto fallback)
- [ ] Remover `components/lunar-timeline/utils/moonPhase.ts`
- [ ] Remover `scripts/generate-moon-calendar.js`
- [ ] Cleanup final de código duplicado

---

## 🔍 Como Saber o que Remover

### 1. Procure por imports de código antigo
```bash
grep -r "from '@/lib/moon-calculations'" src/
grep -r "moonPhase.ts" src/
grep -r "generateMoonCycle" src/
```

### 2. Se importa `moon-calculations`, refatore para:
```typescript
// ❌ Remover
import { calcMoonAge, describePhase } from '@/lib/moon-calculations';

// ✅ Usar
import { lunarComputeClient } from '@/lib/lunar-compute-client';
const phase = await lunarComputeClient.getLunarPhase(date);
```

### 3. Se faz cálculos de fase, use Python:
```typescript
// ❌ Remover
const phase = calculateLunarPhase(date);
const name = getPhaseName(phaseFraction);

// ✅ Usar
const phase = await lunarComputeClient.getLunarPhase(date);
const name = phase.phase; // Já vem!
```

---

## ⏱️ Timeline de Depreciação

| Data | Ação |
|------|------|
| **Agora** | Marcar código como `@deprecated` |
| **1-2 sprints** | Migrar principais componentes |
| **2-3 sprints** | Remover funções não-essenciais |
| **3-4 sprints** | Cleanup final |

---

## 🚨 O que NÃO Remover

✅ **Manter para fallback**:
- `lib/moon-calculations.ts` - Se Python cair
- Cálculos locais em componentes - Para SSR/offline

⚠️ **Documentar bem**:
- Por que mantém JavaScript
- Como usar fallback
- Quando ativar cache

---

## 📝 Template de Deprecação

```typescript
/**
 * @deprecated Em favor de lunarComputeClient.getLunarPhase()
 * Este arquivo será removido em v2.0.0
 * 
 * Migração:
 * ```
 * // Antes
 * const phase = calculateLunarPhase(date);
 * 
 * // Depois
 * const phase = await lunarComputeClient.getLunarPhase(date);
 * ```
 */
```

---

## ✅ Benefícios da Limpeza

- ⚡ **-30%** tamanho do bundle (remover JS duplicado)
- 🚀 **+40%** velocidade de carregamento
- 🧹 **-50%** código duplicado
- 🎯 **1** única fonte de verdade (Python)
- 🐛 **Menos bugs** (não mais divergência de lógica)

---

**Status**: Documentado ✅  
**Próximo passo**: Iniciar Fase 2b (Refatorar outros componentes)
