# 🚀 Otimizações e Boas Práticas - Insights

## 📊 Índices Explicados

### Índices Criados

```sql
-- Índice 1: Busca por usuário e data (mais comum)
CREATE INDEX idx_monthly_insights_user_date 
  ON monthly_insights (user_id, created_at DESC);
```

**Uso:**
```sql
-- Busca rápida: "Todos os insights de um usuário, ordenados por data"
SELECT * FROM monthly_insights 
WHERE user_id = 123 
ORDER BY created_at DESC;
```

```sql
-- Índice 2: Busca por mês
CREATE INDEX idx_monthly_insights_user_month 
  ON monthly_insights (user_id, month_number);
```

**Uso:**
```sql
-- Busca rápida: "Todos os insights de um usuário em um mês"
SELECT * FROM monthly_insights 
WHERE user_id = 123 AND month_number = 1;
```

```sql
-- Índice 3: Busca por fase lunar
CREATE INDEX idx_monthly_insights_user_phase 
  ON monthly_insights (user_id, moon_phase);
```

**Uso:**
```sql
-- Busca rápida: "Todos os insights de Lua Nova de um usuário"
SELECT * FROM monthly_insights 
WHERE user_id = 123 AND moon_phase = 'luaNova';
```

---

## ⚡ Performance

### Antes vs Depois

```
Sem Índices:
- Buscar insights de um usuário: ~100-500ms ❌
- Buscar insight por mês: ~100-500ms ❌

Com Índices:
- Buscar insights de um usuário: ~1-5ms ✅
- Buscar insight por mês: ~1-5ms ✅
```

### Dicas de Performance

1. **Sempre filtrar por user_id primeiro**
```typescript
// ✅ BOM
SELECT * FROM monthly_insights 
WHERE user_id = 123 AND month_number = 1;

// ❌ RUIM (sem user_id)
SELECT * FROM monthly_insights 
WHERE month_number = 1;
```

2. **Limitar resultados**
```typescript
// ✅ BOM
SELECT * FROM monthly_insights 
WHERE user_id = 123 
LIMIT 12;  // Um ano

// ❌ RUIM (sem LIMIT)
SELECT * FROM monthly_insights 
WHERE user_id = 123;
```

3. **Usar paginação para grandes volumes**
```typescript
// ✅ BOM
const page = 1;
const limit = 20;
const offset = (page - 1) * limit;

SELECT * FROM monthly_insights 
WHERE user_id = 123 
ORDER BY created_at DESC 
LIMIT ${limit} OFFSET ${offset};
```

---

## 🔄 Constraints de Unicidade

### Por Que Usar?

```sql
-- Constraint: um insight por fase por mês
UNIQUE (user_id, moon_phase, month_number)
```

**Benefícios:**
- ✅ Previne duplicação
- ✅ Permite UPSERT (INSERT ... ON CONFLICT)
- ✅ Automaticamente indexado (performance)

**Exemplo:**
```typescript
// Primeira chamada - INSERT
INSERT INTO monthly_insights (user_id, moon_phase, month_number, insight)
VALUES (123, 'luaNova', 1, 'Insight 1');
// ↓ Resultado: 1 novo insight

// Segunda chamada - UPDATE (mesmo user, fase, mês)
INSERT INTO monthly_insights (user_id, moon_phase, month_number, insight)
VALUES (123, 'luaNova', 1, 'Insight atualizado')
ON CONFLICT (user_id, moon_phase, month_number)
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();
// ↓ Resultado: mesmo insight, atualizado
```

---

## 🛡️ Validação e Segurança

### CHECK Constraints

```sql
-- Garantir que moon_phase é válido
moon_phase TEXT CHECK (moon_phase IN (
  'luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'
))

-- Garantir que month_number está entre 1 e 12
month_number INT CHECK (month_number >= 1 AND month_number <= 12)

-- Garantir que quarter_number está entre 1 e 4
quarter_number INT CHECK (quarter_number >= 1 AND quarter_number <= 4)

-- Garantir que year é razoável
year INT CHECK (year >= 2000 AND year <= 2999)
```

### Validação Frontend

```typescript
// Validar antes de enviar para API
function validateMonthlyInsight(moonPhase, monthNumber, insight) {
  // Validar fase lunar
  const validPhases = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'];
  if (!validPhases.includes(moonPhase)) {
    throw new Error('Fase lunar inválida');
  }

  // Validar mês
  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error('Mês deve estar entre 1 e 12');
  }

  // Validar texto
  if (!insight || insight.trim().length === 0) {
    throw new Error('Insight não pode estar vazio');
  }

  // Validar tamanho
  if (insight.length > 5000) {
    throw new Error('Insight muito longo (máximo 5000 caracteres)');
  }

  return true;
}
```

---

## 💾 Otimização de Armazenamento

### Tamanho Estimado

```
Para 1 usuário com 3 anos de dados:

Mensais:
- 12 meses × 4 fases = 48 insights
- ~48 × 500 bytes = ~24 KB

Trimestrais:
- 3 anos × 4 trimestres × 4 fases = 48 insights
- ~48 × 500 bytes = ~24 KB

Anuais:
- 3 insights
- ~3 × 500 bytes = ~1.5 KB

Total: ~50 KB por usuário
1 milhão de usuários: ~50 GB (aceitável)
```

### Archiving (Para Futura Otimização)

```sql
-- Criar tabela de arquivo (insights antigos)
CREATE TABLE monthly_insights_archive (
  LIKE monthly_insights INCLUDING ALL
) PARTITION BY RANGE (EXTRACT(YEAR FROM created_at));

-- Depois, mover dados antigos:
-- INSERT INTO monthly_insights_archive
-- SELECT * FROM monthly_insights
-- WHERE EXTRACT(YEAR FROM created_at) < 2023;
```

---

## 🔍 Queries Otimizadas

### Query 1: Obter Todos os Insights de um Usuário

```typescript
// ✅ OTIMIZADO
export async function getAllInsights(userId: string) {
  const db = getDb();
  
  const rows = await db`
    SELECT 
      'mensal'::TEXT as tipo,
      moon_phase,
      month_number::TEXT as periodo,
      insight,
      created_at
    FROM monthly_insights
    WHERE user_id = ${userId}
    
    UNION ALL
    
    SELECT 
      'trimestral'::TEXT,
      moon_phase,
      quarter_number::TEXT,
      insight,
      created_at
    FROM quarterly_insights
    WHERE user_id = ${userId}
    
    UNION ALL
    
    SELECT 
      'anual'::TEXT,
      NULL::TEXT,
      year::TEXT,
      insight,
      created_at
    FROM annual_insights
    WHERE user_id = ${userId}
    
    ORDER BY created_at DESC
    LIMIT 1000
  `;
  
  return rows;
}
```

### Query 2: Dashboard - Estatísticas

```typescript
export async function getInsightStats(userId: string) {
  const db = getDb();
  
  const stats = await db`
    SELECT 
      (SELECT COUNT(*) FROM monthly_insights WHERE user_id = ${userId})::INT as total_mensais,
      (SELECT COUNT(*) FROM quarterly_insights WHERE user_id = ${userId})::INT as total_trimestrais,
      (SELECT COUNT(*) FROM annual_insights WHERE user_id = ${userId})::INT as total_anuais,
      (SELECT COUNT(DISTINCT month_number) FROM monthly_insights WHERE user_id = ${userId})::INT as meses_preenchidos,
      (SELECT COUNT(DISTINCT quarter_number) FROM quarterly_insights WHERE user_id = ${userId})::INT as trimestres_preenchidos,
      (SELECT COUNT(DISTINCT year) FROM annual_insights WHERE user_id = ${userId})::INT as anos_preenchidos
  `;
  
  return stats[0];
}
```

### Query 3: Insights por Período

```typescript
export async function getInsightsByYear(userId: string, year: number) {
  const db = getDb();
  
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const rows = await db`
    SELECT 
      month_number,
      moon_phase,
      insight,
      created_at
    FROM monthly_insights
    WHERE user_id = ${userId}
      AND EXTRACT(YEAR FROM created_at) = ${year}
    ORDER BY month_number, 
      CASE 
        WHEN moon_phase = 'luaNova' THEN 1
        WHEN moon_phase = 'luaCrescente' THEN 2
        WHEN moon_phase = 'luaCheia' THEN 3
        WHEN moon_phase = 'luaMinguante' THEN 4
      END
  `;
  
  return rows;
}
```

---

## 🔐 Segurança

### Proteção Contra SQL Injection

```typescript
// ✅ SEGURO (usando parameterized queries)
const result = await db`
  SELECT * FROM monthly_insights
  WHERE user_id = ${userId}
    AND moon_phase = ${moonPhase}
    AND month_number = ${monthNumber}
`;

// ❌ INSEGURO (nunca fazer!)
const result = await db`
  SELECT * FROM monthly_insights
  WHERE user_id = '${userId}'
    AND moon_phase = '${moonPhase}'
`;
```

### Autorização

```typescript
// Sempre verificar se o usuário tem permissão
export async function getMonthlyInsight(userId: string, insightId: number) {
  const db = getDb();
  
  const insight = await db`
    SELECT * FROM monthly_insights
    WHERE id = ${insightId} AND user_id = ${userId}
  `;
  
  if (!insight.length) {
    throw new Error('Insight not found or unauthorized');
  }
  
  return insight[0];
}
```

---

## 📈 Escalabilidade Futura

### Se Crescer para Muitos Dados

```sql
-- Particionar por user_id (sharding)
CREATE TABLE monthly_insights_new (
  id BIGSERIAL,
  user_id BIGINT NOT NULL,
  moon_phase TEXT NOT NULL,
  month_number INT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY HASH (user_id) PARTITIONS 16;

-- Particionamento por data (para dados muito antigos)
CREATE TABLE monthly_insights_archive (
  id BIGSERIAL,
  user_id BIGINT NOT NULL,
  moon_phase TEXT NOT NULL,
  month_number INT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (EXTRACT(YEAR FROM created_at));
```

---

## ✅ Checklist de Otimização

- [ ] Todos os índices criados
- [ ] Constraints de check implementados
- [ ] Constraints de unicidade configurados
- [ ] Validação frontend implementada
- [ ] Validação backend implementada
- [ ] Queries testadas e otimizadas
- [ ] EXPLAIN ANALYZE executado nas queries principais
- [ ] Limites de resultado configurados (LIMIT)
- [ ] Paginação implementada para grandes volumes
- [ ] Logs de erro configurados
- [ ] Testes de carga realizados

---

## 📚 Referências

- PostgreSQL Docs: https://www.postgresql.org/docs/
- Neon Docs: https://neon.tech/docs/
- Query Optimization: https://www.postgresql.org/docs/current/sql-explain.html
