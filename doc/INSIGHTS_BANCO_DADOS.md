# 🗄️ Tabelas para Insights - Guia Completo

## 📊 Visão Geral

Este documento detalha as tabelas de banco de dados para armazenar os três tipos de insights:

- **Insights Mensais** - Um por lua em cada mês
- **Insights Trimestrais** - Um por trimestre (4 luas)
- **Insights Anuais** - Um por ano

## 🗂️ Estrutura das Tabelas

### 1️⃣ Tabela: `monthly_insights`

Armazena insights mensais - um por fase lunar em cada mês.

```sql
CREATE TABLE IF NOT EXISTS monthly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL,              -- luaNova | luaCrescente | luaCheia | luaMinguante
  month_number INT NOT NULL,             -- 1-12 (janeiro a dezembro)
  insight TEXT NOT NULL,                 -- Texto do insight
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()   -- Para futuras edições
);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_date
  ON monthly_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_month
  ON monthly_insights (user_id, month_number);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_phase
  ON monthly_insights (user_id, moon_phase);

-- Constraint único: um insight por fase por mês
ALTER TABLE monthly_insights
  ADD CONSTRAINT unique_monthly_per_phase_month
  UNIQUE (user_id, moon_phase, month_number);
```

**Exemplo de dados:**

```
id | user_id | moon_phase    | month_number | insight                          | created_at
1  | 123     | luaNova       | 1            | "Começar com intenções..."      | 2024-01-15
2  | 123     | luaCrescente  | 1            | "Aprendi a crescer..."          | 2024-01-22
3  | 123     | luaCheia      | 1            | "Colhi muitos resultados..."    | 2024-01-29
4  | 123     | luaMinguante  | 1            | "Deixei ir o que não serve..."  | 2024-02-05
```

---

### 2️⃣ Tabela: `quarterly_insights`

Armazena insights trimestrais - um por fase lunar em cada trimestre.

```sql
CREATE TABLE IF NOT EXISTS quarterly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL,              -- luaNova | luaCrescente | luaCheia | luaMinguante
  quarter_number INT NOT NULL,           -- 1-4 (1º a 4º trimestre)
  insight TEXT NOT NULL,                 -- Texto do insight
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_date
  ON quarterly_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_quarter
  ON quarterly_insights (user_id, quarter_number);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_phase
  ON quarterly_insights (user_id, moon_phase);

-- Constraint único: um insight por fase por trimestre
ALTER TABLE quarterly_insights
  ADD CONSTRAINT unique_quarterly_per_phase_quarter
  UNIQUE (user_id, moon_phase, quarter_number);
```

**Mapping de Trimestres:**
| Trimestre | Meses | Luas |
|-----------|-------|------|
| 1º | Jan - Mar | 4 (uma por mês) |
| 2º | Abr - Jun | 4 (uma por mês) |
| 3º | Jul - Set | 4 (uma por mês) |
| 4º | Out - Dez | 4 (uma por mês) |

**Exemplo de dados:**

```
id | user_id | moon_phase   | quarter_number | insight                      | created_at
1  | 123     | luaNova      | 1              | "Intenções do trimestre..."  | 2024-01-10
2  | 123     | luaCrescente | 1              | "Crescimento observado..."   | 2024-02-14
3  | 123     | luaCheia     | 1              | "Conquistas do trimestre..." | 2024-03-20
4  | 123     | luaMinguante | 1              | "Reflexões finais..."        | 2024-04-05
```

---

### 3️⃣ Tabela: `annual_insights`

Armazena insights anuais - um por ano.

```sql
CREATE TABLE IF NOT EXISTS annual_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  year INT NOT NULL,                     -- Ano do insight (2024, 2025, etc)
  insight TEXT NOT NULL,                 -- Texto do insight anual
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annual_insights_user_date
  ON annual_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_annual_insights_user_year
  ON annual_insights (user_id, year);

-- Constraint único: um insight por ano por usuário
ALTER TABLE annual_insights
  ADD CONSTRAINT unique_annual_per_year
  UNIQUE (user_id, year);
```

**Exemplo de dados:**

```
id | user_id | year | insight                                    | created_at
1  | 123     | 2024 | "Este foi um ano de transformações..."     | 2024-12-20
2  | 123     | 2025 | "Vou focar em crescimento pessoal..."      | 2025-01-02
```

---

## 📋 Tabela Comparativa

```
┌──────────────────┬────────────────┬──────────────────┬───────────────┐
│ Tipo             │ Tabela         │ Frequência       │ Quantidade    │
├──────────────────┼────────────────┼──────────────────┼───────────────┤
│ Mensal           │ monthly_insights    │ 4 por mês    │ 48 por ano    │
│ Trimestral       │ quarterly_insights  │ 1 por trimestre│ 4 por ano    │
│ Anual            │ annual_insights     │ 1 por ano    │ 1 por ano     │
└──────────────────┴────────────────┴──────────────────┴───────────────┘
```

---

## 🔄 Queries Úteis

### Obter todos os insights de um usuário (este mês)

```sql
SELECT * FROM monthly_insights
WHERE user_id = $1
  AND month_number = EXTRACT(MONTH FROM NOW())::INT
ORDER BY moon_phase;
```

### Obter insights de um trimestre específico

```sql
SELECT * FROM quarterly_insights
WHERE user_id = $1
  AND quarter_number = CEIL(EXTRACT(MONTH FROM NOW())::INT / 3)
ORDER BY moon_phase;
```

### Obter insight anual

```sql
SELECT * FROM annual_insights
WHERE user_id = $1
  AND year = EXTRACT(YEAR FROM NOW())::INT;
```

### Listar todos os insights de um usuário (cronológico)

```sql
SELECT 'mensal' as tipo, moon_phase, month_number as periodo, insight, created_at
FROM monthly_insights
WHERE user_id = $1
UNION ALL
SELECT 'trimestral', moon_phase, quarter_number::text, insight, created_at
FROM quarterly_insights
WHERE user_id = $1
UNION ALL
SELECT 'anual', null, year::text, insight, created_at
FROM annual_insights
WHERE user_id = $1
ORDER BY created_at DESC;
```

### Contar insights por tipo

```sql
SELECT
  COUNT(CASE WHEN type = 'mensal' THEN 1 END) as insights_mensais,
  COUNT(CASE WHEN type = 'trimestral' THEN 1 END) as insights_trimestrais,
  COUNT(CASE WHEN type = 'anual' THEN 1 END) as insights_anuais
FROM (
  SELECT 'mensal' as type FROM monthly_insights WHERE user_id = $1
  UNION ALL
  SELECT 'trimestral' FROM quarterly_insights WHERE user_id = $1
  UNION ALL
  SELECT 'anual' FROM annual_insights WHERE user_id = $1
) stats;
```

---

## 📝 Funções TypeScript (lib/forms.ts)

### Salvar Insight Mensal

```typescript
export async function saveMonthlyInsight(
  userId: string | number,
  moonPhase: string,
  monthNumber: number,
  insight: string
) {
  try {
    const db = getDb();
    const rows = (await db`
      INSERT INTO monthly_insights (user_id, moon_phase, month_number, insight)
      VALUES (${userId}, ${moonPhase}, ${monthNumber}, ${insight})
      ON CONFLICT (user_id, moon_phase, month_number)
      DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW()
      RETURNING id, user_id, moon_phase, month_number, insight, created_at, updated_at
    `) as any[];

    return rows[0];
  } catch (error) {
    console.error('Erro ao salvar monthly insight', error);
    throw error;
  }
}
```

### Obter Insights Mensais

```typescript
export async function getMonthlyInsights(userId: string | number, monthNumber?: number) {
  try {
    const db = getDb();
    const month = monthNumber ?? new Date().getMonth() + 1;

    const rows = (await db`
      SELECT id, user_id, moon_phase, month_number, insight, created_at, updated_at
      FROM monthly_insights
      WHERE user_id = ${userId} AND month_number = ${month}
      ORDER BY moon_phase
    `) as any[];

    return rows;
  } catch (error) {
    console.error('Erro ao obter monthly insights', error);
    throw error;
  }
}
```

### Salvar Insight Trimestral

```typescript
export async function saveQuarterlyInsight(
  userId: string | number,
  moonPhase: string,
  quarterNumber: number,
  insight: string
) {
  try {
    const db = getDb();
    const rows = (await db`
      INSERT INTO quarterly_insights (user_id, moon_phase, quarter_number, insight)
      VALUES (${userId}, ${moonPhase}, ${quarterNumber}, ${insight})
      ON CONFLICT (user_id, moon_phase, quarter_number)
      DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW()
      RETURNING id, user_id, moon_phase, quarter_number, insight, created_at, updated_at
    `) as any[];

    return rows[0];
  } catch (error) {
    console.error('Erro ao salvar quarterly insight', error);
    throw error;
  }
}
```

### Obter Insights Trimestrais

```typescript
export async function getQuarterlyInsights(userId: string | number, quarterNumber?: number) {
  try {
    const db = getDb();
    const month = new Date().getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    const q = quarterNumber ?? quarter;

    const rows = (await db`
      SELECT id, user_id, moon_phase, quarter_number, insight, created_at, updated_at
      FROM quarterly_insights
      WHERE user_id = ${userId} AND quarter_number = ${q}
      ORDER BY moon_phase
    `) as any[];

    return rows;
  } catch (error) {
    console.error('Erro ao obter quarterly insights', error);
    throw error;
  }
}
```

### Salvar Insight Anual

```typescript
export async function saveAnnualInsight(userId: string | number, insight: string, year?: number) {
  try {
    const db = getDb();
    const y = year ?? new Date().getFullYear();

    const rows = (await db`
      INSERT INTO annual_insights (user_id, year, insight)
      VALUES (${userId}, ${y}, ${insight})
      ON CONFLICT (user_id, year)
      DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW()
      RETURNING id, user_id, year, insight, created_at, updated_at
    `) as any[];

    return rows[0];
  } catch (error) {
    console.error('Erro ao salvar annual insight', error);
    throw error;
  }
}
```

### Obter Insight Anual

```typescript
export async function getAnnualInsight(userId: string | number, year?: number) {
  try {
    const db = getDb();
    const y = year ?? new Date().getFullYear();

    const rows = (await db`
      SELECT id, user_id, year, insight, created_at, updated_at
      FROM annual_insights
      WHERE user_id = ${userId} AND year = ${y}
    `) as any[];

    return rows[0];
  } catch (error) {
    console.error('Erro ao obter annual insight', error);
    throw error;
  }
}
```

---

## 🎯 Fluxo de Integração

### 1. Frontend (React/TypeScript)

```typescript
// Em um componente ou hook
import { saveMonthlyInsight } from '@/lib/forms';

// Quando usuário clica "Salvar"
const handleSaveInsight = async (insight: string) => {
  try {
    const userId = session?.user?.id;
    const result = await saveMonthlyInsight(
      userId,
      'luaNova', // fase
      1, // mês (janeiro)
      insight // texto
    );
    console.log('Insight salvo:', result);
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

### 2. API Route (Next.js)

```typescript
// app/api/form/monthly-insight/route.ts
import { getSession } from '@/lib/auth';
import { saveMonthlyInsight } from '@/lib/forms';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { moonPhase, monthNumber, insight } = await request.json();

  if (!moonPhase || !monthNumber || !insight) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    const result = await saveMonthlyInsight(session.user.id, moonPhase, monthNumber, insight);
    return Response.json(result);
  } catch (error) {
    console.error('Error saving insight:', error);
    return Response.json({ error: 'Failed to save' }, { status: 500 });
  }
}
```

---

## ✅ Checklist de Implementação

- [ ] Criar/atualizar tabela `monthly_insights` no banco
- [ ] Criar/atualizar tabela `quarterly_insights` no banco
- [ ] Criar/atualizar tabela `annual_insights` no banco
- [ ] Adicionar função `saveMonthlyInsight` em `lib/forms.ts`
- [ ] Adicionar função `getMonthlyInsights` em `lib/forms.ts`
- [ ] Adicionar função `saveQuarterlyInsight` em `lib/forms.ts`
- [ ] Adicionar função `getQuarterlyInsights` em `lib/forms.ts`
- [ ] Adicionar função `saveAnnualInsight` em `lib/forms.ts`
- [ ] Adicionar função `getAnnualInsight` em `lib/forms.ts`
- [ ] Criar/atualizar API route `/api/form/monthly-insight`
- [ ] Criar/atualizar API route `/api/form/quarterly-insight`
- [ ] Criar/atualizar API route `/api/form/annual-insight`
- [ ] Testar salvamento de insights
- [ ] Testar leitura de insights

---

## 📚 Referências

- `hooks/useMonthlyInsights.ts` - Hook para gerenciar insights mensais
- `hooks/useQuarterlyInsights.ts` - Hook para gerenciar insights trimestrais
- `hooks/useAnnualInsights.ts` - Hook para gerenciar insights anuais
- `components/MonthlyInsightModal.tsx` - Modal de entrada
- `components/QuarterlyInsightModal.tsx` - Modal de entrada
- `components/AnnualInsightModal.tsx` - Modal de entrada
