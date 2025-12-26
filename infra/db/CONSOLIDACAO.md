# 📊 Consolidação e Simplificação - infra/db

**Data:** 24 de dezembro de 2025  
**Status:** ✅ Consolidado com sucesso

---

## 🗑️ Arquivos Removidos (Redundância)

### Tabelas de Insights Consolidadas

- ~~`02-monthly-insights.sql`~~ → Consolidado em tabela `insights`
- ~~`03-quarterly-insights.sql`~~ → Consolidado em tabela `insights`
- ~~`04-annual-insights.sql`~~ → Consolidado em tabela `insights`
- ~~`schema.sql`~~ → Duplicado de `01-base-tables.sql`

### Dados de Teste e Migrações Antigas

- ~~`dados-teste-insights.sql`~~ → Referências às tabelas antigas
- ~~`migration-insights.sql`~~ → Referências às tabelas antigas

---

## ✨ Mudanças Realizadas

### 1️⃣ Consolidação de Tabelas de Insights

**Antes (3 tabelas):**

```sql
monthly_insights (user_id, moon_phase, month_number, insight, ...)
quarterly_insights (user_id, moon_phase, quarter_number, insight, ...)
annual_insights (user_id, year, insight, ...)
```

**Depois (1 tabela genérica):**

```sql
insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  period_type TEXT CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
  period_value INT,           -- mês (1-12), trimestre (1-4), ou NULL para anual
  year INT DEFAULT 2024,
  moon_phase TEXT,            -- luaNova, luaCrescente, luaCheia, luaMinguante
  content TEXT NOT NULL,      -- antes: "insight"
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Vantagens:**

- ✅ Reduz de 3 tabelas para 1
- ✅ Mesma estrutura para 3 tipos de período
- ✅ Mais fácil de estender no futuro
- ✅ Índices únicos consolidados

---

### 2️⃣ Atualização de Código TypeScript

**Arquivos Refatorados:**

- [lib/timeline.ts](../../lib/timeline.ts) - Query consolidada em uma única tabela
- [lib/forms.ts](../../lib/forms.ts) - Funções `saveInsight()`, `getInsights()` atualizadas

**Compatibilidade Mantida:**

- ✅ `saveMonthlyInsight()` → `saveInsight('monthly', ...)`
- ✅ `saveQuarterlyInsight()` → `saveInsight('quarterly', ...)`
- ✅ `saveAnnualInsight()` → `saveInsight('annual', ...)`
- ✅ Todas as funções `get*Insights()` continuam funcionando

---

### 3️⃣ Renumeração de Arquivos SQL

```
Antes:              Depois:
01-base-tables.sql  01-base-tables.sql
02-monthly-...      02-lunar-phases.sql
03-quarterly-...    03-islands.sql
04-annual-...       04-lunations.sql
05-lunar-phases.sql 05-phase-inputs.sql
06-islands.sql
07-lunations.sql
08-phase-inputs.sql
```

---

## 📋 Estrutura Final

```
infra/db/
├── 01-base-tables.sql (com insights consolidados)
├── 02-lunar-phases.sql
├── 03-islands.sql
├── 04-lunations.sql
├── 05-phase-inputs.sql
├── migration-add-emoji-lunations.sql
├── README.md (atualizado)
├── CONSOLIDACAO.md (este arquivo)
└── .gitkeep
```

**Total de tabelas**: 8 (reduzido de 9)

---

## 🚀 Verificação

- ✅ Build TypeScript: **OK**
- ✅ Arquivos removidos: **OK**
- ✅ Código atualizado: **OK**
- ✅ Índices consolidados: **OK**

---

## 📝 Próximos Passos (Opcionais)

1. Executar scripts SQL no Neon para sincronizar banco

   ```sql
   -- 1. Criar tabela `insights` (já incluída em 01-base-tables.sql)
   -- 2. Fazer backup das tabelas antigas (se ainda existirem no banco)
   -- 3. Migrar dados das tabelas antigas para `insights`
   -- 4. Deletar as tabelas antigas
   ```

2. Revisar documentação em `doc/` para remover referências às tabelas antigas

3. (Opcional) Criar seed/migration para dados de teste

---

**Simplificação concluída com sucesso! ✨**
