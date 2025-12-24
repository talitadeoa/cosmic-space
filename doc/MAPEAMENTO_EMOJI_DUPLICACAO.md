# 📊 Mapeamento de Duplicação - Emoji & Insights

## 🔴 DUPLICAÇÃO ENCONTRADA

### 1. **Declarações de Emojis - DUPLICADAS**

#### Arquivo 1: `/types/moon.ts` ✅ ATIVO (em uso)

```typescript
export const MOON_PHASE_EMOJIS: Record<MoonPhase, string> = {
  luaNova: '🌑',
  luaCrescente: '🌒',
  luaCheia: '🌕',
  luaMinguante: '🌘',
};

export const MOON_PHASE_EMOJI_LABELS: Record<MoonPhase, string> = {
  luaNova: '🌑 Lua Nova',
  luaCrescente: '🌓 Lua Crescente',
  luaCheia: '🌕 Lua Cheia',
  luaMinguante: '🌗 Lua Minguante',
};
```

**Usado por:**

- ✅ `app/cosmos/utils/moonPhases.ts` (re-exporta)
- ✅ Componentes da UI

---

#### Arquivo 2: `/lib/emoji-mappings.ts` ❌ OBSOLETO (NÃO IMPORTADO)

```typescript
export const MOON_PHASE_EMOJIS: Record<string, string> = {
  Nova: '🌑',
  nova: '🌑',
  Crescente: '🌓',
  crescente: '🌓',
  Cheia: '🌕',
  cheia: '🌕',
  Minguante: '🌗',
  minguante: '🌗',
};

export const ZODIAC_EMOJIS: Record<string, string> = {
  // Muitas variações...
};

export function getMoonPhaseEmoji(phase: string): string {}
export function getZodiacEmoji(sign: string): string {}
```

**Nunca utilizado:**

- ❌ Nenhum import encontrado no projeto
- ❌ Funções nunca chamadas
- ❌ SQL CASE statements nunca usados

---

### 2. **Inconsistências Entre os Arquivos**

| Aspecto            | types/moon.ts        | lib/emoji-mappings.ts          |
| ------------------ | -------------------- | ------------------------------ |
| **Fases**          | Tipos (luaNova, etc) | Strings (Nova, Crescente, etc) |
| **Emojis Lua**     | 🌑🌒🌕🌘             | 🌑🌓🌕🌗                       |
| **Zodíaco**        | ❌ Não tem           | ✅ Tem (com variações)         |
| **Funções helper** | ❌ Não tem           | ✅ Tem                         |
| **Em uso**         | ✅ SIM               | ❌ NÃO                         |

---

### 3. **Insights - Também há Redundância**

#### Antes (removido):

- monthly_insights
- quarterly_insights
- annual_insights

#### Depois (consolidado):

- insights (única tabela)

Status: ✅ Já feito na tarefa anterior

---

## 🚀 Recomendação: Limpar Redundância

### Opção 1: **Remover emoji-mappings.ts completamente**

- Deletar `/lib/emoji-mappings.ts`
- Não há impacto, pois nada o importa
- ✅ RECOMENDADO

### Opção 2: **Mesclar em types/moon.ts**

- Adicionar zodíaco em `/types/moon.ts`
- Adicionar funções helper
- Deletar `/lib/emoji-mappings.ts`
- Mais consolidação

### Opção 3: **Usar emoji-mappings.ts como único ponto de verdade**

- Atualizar tipos/moon.ts para re-exportar de emoji-mappings
- Mais complexo, menos recomendado

---

## 📝 Próximo Passo

Qual abordagem você prefere?

1. ❌ Deletar `/lib/emoji-mappings.ts` (simples, zero impacto)
2. ✨ Mesclar zodíaco em `types/moon.ts` e deletar emoji-mappings
3. 📦 Melhorar emoji-mappings como único centralizado
