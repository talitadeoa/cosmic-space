# Insights (modelo unificado)

## Visao geral

Os insights (mensais, trimestrais e anuais) foram consolidados na tabela `insights`.
A tabela fica em `infra/db/01-base-tables.sql`.

## Schema (resumo)

```sql
CREATE TABLE IF NOT EXISTS insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
  period_value INT NOT NULL,
  year INT DEFAULT 2024,
  moon_phase TEXT CHECK (moon_phase IN ('luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante')),
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- `period_value`: mes (1-12) para mensal, trimestre (1-4) para trimestral.
- `year`: ano do insight.

## Funcoes de banco (lib/forms.ts)

- `saveInsight(type, params)`
- `saveMonthlyInsight(userId, moonPhase, year, monthNumber, insight)`
- `saveQuarterlyInsight(userId, moonPhase, quarterNumber, insight)`
- `saveAnnualInsight(userId, insight, year)`
- `getInsights(type, userId, period?)`
- `getInsightByPhase(type, userId, moonPhase, period, year?)`
- `getAllInsights(userId)`

## APIs

- `POST /api/form/monthly-insight`
- `POST /api/form/quarterly-insight`
- `POST /api/form/annual-insight`
- `GET /api/insights?start=YYYY-MM-DD&end=YYYY-MM-DD&categories=mensal,trimestral,anual&moonPhase=luaCheia`

A rota `GET /api/insights` exige cookie `auth_token` valido.

## Exemplo rapido (backend)

```ts
import { saveMonthlyInsight } from '@/lib/forms';

await saveMonthlyInsight(userId, 'luaNova', 2024, 1, 'Meu insight');
```
