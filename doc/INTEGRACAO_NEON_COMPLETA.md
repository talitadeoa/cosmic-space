# 🗄️ Guia Completo: Integração de Inputs ao Neon

## 📊 Situação Atual

Seu projeto **atualmente salva tudo no Google Sheets**, mas você tem:

- ✅ Banco Neon configurado (`lib/db.ts`)
- ✅ Schema básico em `infra/db/schema.sql`
- ✅ Biblioteca `@neondatabase/serverless` instalada
- ✅ Função `saveFormEntry()` em `lib/forms.ts` (mas não está sendo usada)

## 🎯 Estratégia de Integração

### Opção 1: **Dupla Persistência** (Recomendado para Transição)

Salva nos **dois** (Neon + Sheets) até você migrar completamente:

```
Frontend (componentes)
  ↓ POST /api/form/*
Backend (route.ts)
  ├─ Valida dados
  ├─ Salva no Neon (novo)
  ├─ Salva no Sheets (manter compatibilidade)
  └─ Retorna sucesso
```

**Vantagens:**

- Zero downtime
- Pode testar Neon em paralelo
- Rollback fácil se algo quebrar

### Opção 2: **Migração Direta**

Substitui Sheets por Neon completamente:

```
Frontend
  ↓ POST /api/form/*
Backend
  ├─ Valida dados
  ├─ Salva no Neon (único)
  └─ Retorna sucesso
```

## 📋 Tipos de Inputs para Integrar

### 1. **Insights Mensais** (`/api/form/monthly-insight`)

```json
{
  "moonPhase": "Crescente",
  "monthNumber": 12,
  "insight": "Texto do usuário..."
}
```

**Tabela Neon:**

```sql
CREATE TABLE IF NOT EXISTS monthly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  moon_phase TEXT NOT NULL,
  month_number INT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. **Insights Trimestrais** (`/api/form/quarterly-insight`)

```json
{
  "moonPhase": "Nova",
  "insight": "Texto do usuário..."
}
```

**Tabela Neon:**

```sql
CREATE TABLE IF NOT EXISTS quarterly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  moon_phase TEXT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. **Insights Anuais** (`/api/form/annual-insight`)

```json
{
  "insight": "Texto do usuário..."
}
```

**Tabela Neon:**

```sql
CREATE TABLE IF NOT EXISTS annual_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  year INT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. **Fase Lunar** (`/api/form/lunar-phase`)

```json
{
  "data": "2024-12-13",
  "faseLua": "Crescente",
  "signo": "Sagitário",
  "energia": 7,
  "checks": "...",
  "observacoes": "...",
  "energiaDaFase": "...",
  "intencoesLua": "...",
  "intencoesSemana": "...",
  "intencoesAno": "..."
}
```

**Tabela Neon:**

```sql
CREATE TABLE IF NOT EXISTS lunar_phases (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  phase_date DATE NOT NULL,
  moon_phase TEXT NOT NULL,
  zodiac_sign TEXT NOT NULL,
  energy_level INT,
  checks TEXT,
  observations TEXT,
  phase_energy TEXT,
  moon_intentions TEXT,
  week_intentions TEXT,
  year_intentions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. **Ilhas** (página `/ilha`)

```json
{
  "ilhaSelecionada": "ilha1",
  "dados": {
    "titulo": "...",
    "tag": "...",
    "descricao": "...",
    "energia": 7,
    "prioridade": 5
  }
}
```

**Tabela Neon:**

```sql
CREATE TABLE IF NOT EXISTS islands (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  island_key TEXT NOT NULL,
  title TEXT,
  tag TEXT,
  description TEXT,
  energy_level INT,
  priority INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. **Formulário de Contato** (`/api/form/submit`)

```json
{
  "name": "João",
  "email": "joao@example.com",
  "message": "..."
}
```

**Tabela:** Já existe `form_entries` genérica

### 7. **Inscrições** (`/api/subscribe`)

```json
{
  "email": "usuario@example.com"
}
```

**Tabela:** Usar `form_entries` existente com `type: 'subscribe'`

## 🔧 Passo a Passo de Implementação

### Passo 1: Expandir Schema Neon

Execute no seu banco Neon:

```bash
# Conectar ao Neon
psql $DATABASE_URL

# Executar arquivo:
\i infra/db/schema.sql
```

Depois adicione as novas tabelas em `infra/db/schema.sql`:

```sql
-- Insights mensais
CREATE TABLE IF NOT EXISTS monthly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL,
  month_number INT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_date
  ON monthly_insights (user_id, created_at DESC);

-- Insights trimestrais
CREATE TABLE IF NOT EXISTS quarterly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_date
  ON quarterly_insights (user_id, created_at DESC);

-- Insights anuais
CREATE TABLE IF NOT EXISTS annual_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  year INT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annual_insights_user_date
  ON annual_insights (user_id, created_at DESC);

-- Fases lunares
CREATE TABLE IF NOT EXISTS lunar_phases (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  phase_date DATE NOT NULL,
  moon_phase TEXT NOT NULL,
  zodiac_sign TEXT NOT NULL,
  energy_level INT,
  checks TEXT,
  observations TEXT,
  phase_energy TEXT,
  moon_intentions TEXT,
  week_intentions TEXT,
  year_intentions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lunar_phases_user_date
  ON lunar_phases (user_id, created_at DESC);

-- Ilhas
CREATE TABLE IF NOT EXISTS islands (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  island_key TEXT NOT NULL,
  title TEXT,
  tag TEXT,
  description TEXT,
  energy_level INT,
  priority INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_islands_user
  ON islands (user_id, island_key);
```

### Passo 2: Criar Helpers em `lib/forms.ts`

Adicione funções para cada tipo de input:

```typescript
// Insights mensais
export async function saveMonthlyInsight(
  userId: string,
  moonPhase: string,
  monthNumber: number,
  insight: string
) {
  const db = getDb();
  return db`
    INSERT INTO monthly_insights (user_id, moon_phase, month_number, insight)
    VALUES (${userId}, ${moonPhase}, ${monthNumber}, ${insight})
    RETURNING *
  `;
}

// Insights trimestrais
export async function saveQuarterlyInsight(userId: string, moonPhase: string, insight: string) {
  const db = getDb();
  return db`
    INSERT INTO quarterly_insights (user_id, moon_phase, insight)
    VALUES (${userId}, ${moonPhase}, ${insight})
    RETURNING *
  `;
}

// Insights anuais
export async function saveAnnualInsight(userId: string, insight: string) {
  const db = getDb();
  return db`
    INSERT INTO annual_insights (user_id, year, insight)
    VALUES (${userId}, ${new Date().getFullYear()}, ${insight})
    RETURNING *
  `;
}

// Fases lunares
export async function saveLunarPhase(
  userId: string,
  data: {
    data: string;
    faseLua: string;
    signo: string;
    energia?: number;
    checks?: string;
    observacoes?: string;
    energiaDaFase?: string;
    intencoesLua?: string;
    intencoesSemana?: string;
    intencoesAno?: string;
  }
) {
  const db = getDb();
  return db`
    INSERT INTO lunar_phases (
      user_id, phase_date, moon_phase, zodiac_sign, energy_level,
      checks, observations, phase_energy, moon_intentions,
      week_intentions, year_intentions
    )
    VALUES (
      ${userId}, ${data.data}, ${data.faseLua}, ${data.signo},
      ${data.energia ?? null}, ${data.checks ?? null}, 
      ${data.observacoes ?? null}, ${data.energiaDaFase ?? null},
      ${data.intencoesLua ?? null}, ${data.intencoesSemana ?? null},
      ${data.intencoesAno ?? null}
    )
    RETURNING *
  `;
}

// Ilhas
export async function saveIsland(
  userId: string,
  islandKey: string,
  data: {
    titulo?: string;
    tag?: string;
    descricao?: string;
    energia?: number | null;
    prioridade?: number | null;
  }
) {
  const db = getDb();
  return db`
    INSERT INTO islands (user_id, island_key, title, tag, description, energy_level, priority)
    VALUES (${userId}, ${islandKey}, ${data.titulo ?? null}, ${data.tag ?? null}, 
            ${data.descricao ?? null}, ${data.energia ?? null}, ${data.prioridade ?? null})
    ON CONFLICT (user_id, island_key) DO UPDATE SET
      title = EXCLUDED.title,
      tag = EXCLUDED.tag,
      description = EXCLUDED.description,
      energy_level = EXCLUDED.energy_level,
      priority = EXCLUDED.priority,
      updated_at = NOW()
    RETURNING *
  `;
}
```

### Passo 3: Atualizar Endpoints

**Exemplo: `/api/form/monthly-insight/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/auth';
import { saveMonthlyInsight } from '@/lib/forms'; // Novo import
import { appendToSheet } from '@/lib/sheets';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token || !validateToken(token)) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { moonPhase, monthNumber, insight } = body;

    if (!insight) {
      return NextResponse.json(
        { error: 'Insight é obrigatório' },
        { status: 400 }
      );
    }

    // Extrair userId do token
    const decoded = jwt.decode(token) as any;
    const userId = decoded?.userId || decoded?.id;

    // 1. Salvar no Neon
    if (userId) {
      await saveMonthlyInsight(userId, moonPhase, monthNumber, insight);
    }

    // 2. Manter compatibilidade com Sheets (temporário)
    const monthNames = ['Janeiro', 'Fevereiro', ...];
    const monthName = monthNames[(monthNumber - 1) % 12];

    await appendToSheet({
      timestamp: new Date().toISOString(),
      mes: `${monthName} (Mês #${monthNumber})`,
      fase: moonPhase,
      insight,
      tipo: 'insight_mensal',
    });

    return NextResponse.json({
      success: true,
      message: 'Insight salvo com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao salvar insight mensal:', error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}
```

### Passo 4: Extrair userId do Token

Em `lib/auth.ts`, adicione:

```typescript
import jwt from 'jsonwebtoken';

export function getUserIdFromToken(token: string): string | null {
  try {
    const decoded = jwt.decode(token) as any;
    return decoded?.userId || decoded?.id || null;
  } catch {
    return null;
  }
}
```

## 🗺️ Checklist de Implementação

- [ ] Expandir schema Neon com novas tabelas
- [ ] Adicionar funções helpers em `lib/forms.ts`
- [ ] Atualizar `/api/form/monthly-insight/route.ts`
- [ ] Atualizar `/api/form/quarterly-insight/route.ts`
- [ ] Atualizar `/api/form/annual-insight/route.ts`
- [ ] Atualizar `/api/form/lunar-phase/route.ts`
- [ ] Criar novo endpoint `/api/form/islands/route.ts`
- [ ] Testar cada endpoint com dados reais
- [ ] Verificar dados em Neon com: `SELECT * FROM monthly_insights;`
- [ ] Remover `appendToSheet` quando tudo estiver funcionando

## 📊 Queries Úteis para Neon

```sql
-- Ver todos os insights de um usuário
SELECT * FROM monthly_insights
WHERE user_id = 'seu-user-id'
ORDER BY created_at DESC;

-- Contar insights por tipo
SELECT 'monthly' as tipo, COUNT(*) as total FROM monthly_insights
UNION ALL
SELECT 'quarterly', COUNT(*) FROM quarterly_insights
UNION ALL
SELECT 'annual', COUNT(*) FROM annual_insights;

-- Backup completo
\COPY monthly_insights TO 'backup.csv' WITH CSV HEADER;
```

## 🚀 Próximos Passos

1. **Escolha a opção** (dupla persistência ou migração direta)
2. **Implemente tabelas** no Neon
3. **Atualize endpoints** um por um
4. **Teste cada um** manualmente
5. **Monitore logs** para erros
6. **Valide dados** em ambos (Sheets + Neon)
7. **Remova Sheets** quando confortável (ou mantenha para auditoria)
