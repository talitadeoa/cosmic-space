# Queries Úteis para Validar Insights Multi-Ano

## 📊 Verificações Básicas

### 1. Ver Todos os Insights Anuais de um Usuário

```sql
SELECT 
  id,
  user_id,
  year,
  insight,
  created_at,
  updated_at
FROM annual_insights
WHERE user_id = YOUR_USER_ID
ORDER BY year DESC, created_at DESC;
```

**Esperado:** Múltiplos registros com diferentes anos (2023, 2024, 2025, etc.)

---

### 2. Ver Insights Anuais de um Ano Específico

```sql
SELECT 
  id,
  user_id,
  year,
  insight,
  created_at
FROM annual_insights
WHERE year = 2024
ORDER BY created_at DESC;
```

**Esperado:** Insight salvo para 2024

---

### 3. Ver Insights Trimestrais por Ano

```sql
SELECT 
  q.id,
  q.user_id,
  q.moon_phase,
  q.quarter_number,
  q.insight,
  q.created_at
FROM quarterly_insights q
WHERE q.user_id = YOUR_USER_ID
ORDER BY q.quarter_number DESC, q.created_at DESC;
```

**Esperado:** Insights agrupados por trimestre e fase lunar

---

### 4. Contar Insights por Ano

```sql
SELECT 
  year,
  COUNT(*) as total_insights
FROM annual_insights
GROUP BY year
ORDER BY year DESC;
```

**Esperado:**
```
year | total_insights
-----|---------------
2025 | 1
2024 | 1
2023 | 0
```

---

## 🔍 Validação de Dados

### 5. Verificar Integridade: Anos Válidos

```sql
SELECT 
  id,
  user_id,
  year,
  created_at
FROM annual_insights
WHERE year < 2000 OR year > 2999;
```

**Esperado:** Nenhum resultado (sem dados inválidos)

---

### 6. Verificar Constraint Única por Usuário/Ano

```sql
-- Isso deve dar erro (constraint violation)
INSERT INTO annual_insights (user_id, year, insight)
VALUES (123, 2024, 'Novo insight para 2024');

-- Se o insight de 2024 já existe, ele será atualizado:
INSERT INTO annual_insights (user_id, year, insight)
VALUES (123, 2024, 'Novo insight para 2024')
ON CONFLICT (user_id, year)
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();
```

**Esperado:** Sem erro, insight anterior é sobrescrito

---

### 7. Ver Último Insight de Cada Ano

```sql
SELECT DISTINCT ON (year)
  year,
  user_id,
  insight,
  created_at
FROM annual_insights
WHERE user_id = YOUR_USER_ID
ORDER BY year DESC, created_at DESC;
```

**Esperado:**
```
year | user_id | insight                    | created_at
-----|---------|----------------------------|-------------------
2025 | 123     | "Novos objetivos para..."  | 2025-12-15 10:30:00
2024 | 123     | "Continuei crescendo..."   | 2025-01-10 14:22:00
2023 | 123     | "Ano de aprendizado..."    | 2024-01-15 09:15:00
```

---

## 📈 Análise de Uso

### 8. Quantidade de Insights por Usuário por Ano

```sql
SELECT 
  ai.user_id,
  ai.year,
  COUNT(ai.id) as annual_count,
  COUNT(qi.id) as quarterly_count
FROM annual_insights ai
LEFT JOIN quarterly_insights qi ON ai.user_id = qi.user_id
GROUP BY ai.user_id, ai.year
ORDER BY ai.user_id, ai.year DESC;
```

**Esperado:**
```
user_id | year | annual_count | quarterly_count
--------|------|--------------|----------------
123     | 2025 | 1            | 4
123     | 2024 | 1            | 0
456     | 2024 | 1            | 2
```

---

### 9. Usuários com Insights Contínuos

```sql
SELECT 
  user_id,
  COUNT(DISTINCT year) as anos_com_insights,
  MIN(year) as ano_primeiro,
  MAX(year) as ano_ultimo,
  ARRAY_AGG(DISTINCT year ORDER BY year DESC) as anos
FROM annual_insights
GROUP BY user_id
HAVING COUNT(DISTINCT year) > 1
ORDER BY COUNT(DISTINCT year) DESC;
```

**Esperado:**
```
user_id | anos_com_insights | ano_primeiro | ano_ultimo | anos
--------|-------------------|--------------|------------|-------
123     | 3                 | 2023         | 2025       | {2025,2024,2023}
```

---

### 10. Distribuição de Insights por Fase Lunar

```sql
SELECT 
  moon_phase,
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM quarterly_insights
GROUP BY moon_phase
ORDER BY total DESC;
```

**Esperado:**
```
moon_phase  | total | usuarios_unicos
------------|-------|----------------
luaNova     | 45    | 12
luaCheia    | 38    | 11
luaCrescente| 32    | 10
luaMinguante| 28    | 9
```

---

## 🐛 Troubleshooting

### 11. Verificar se Dados Estão Sendo Salvos

**Antes de salvar:**
```sql
SELECT COUNT(*) as total FROM annual_insights WHERE user_id = 123;
-- Resultado: 2
```

**Após salvar insight:**
```sql
SELECT COUNT(*) as total FROM annual_insights WHERE user_id = 123;
-- Resultado: 3 (aumentou em 1)
```

---

### 12. Ver Insights Recentes de Todos os Usuários

```sql
SELECT 
  ai.id,
  ai.user_id,
  ai.year,
  ai.insight,
  ai.created_at,
  EXTRACT(EPOCH FROM (NOW() - ai.created_at)) / 60 as minutos_atras
FROM annual_insights ai
ORDER BY ai.created_at DESC
LIMIT 10;
```

**Esperado:** Insights recentes aparecem primeiro

---

### 13. Verificar Dados Órfãos (user não existe)

```sql
SELECT 
  ai.id,
  ai.user_id,
  ai.year
FROM annual_insights ai
LEFT JOIN users u ON ai.user_id = u.id
WHERE u.id IS NULL;
```

**Esperado:** Nenhum resultado (nenhum dado órfão)

---

## 🎯 Casos de Teste

### Caso 1: Novo Usuário com 3 Anos de Dados

```sql
-- Setup: User ID 999
INSERT INTO annual_insights (user_id, year, insight, created_at)
VALUES 
  (999, 2023, 'Ano 2023: aprendizado', NOW() - INTERVAL '2 years'),
  (999, 2024, 'Ano 2024: crescimento', NOW() - INTERVAL '1 year'),
  (999, 2025, 'Ano 2025: novos objetivos', NOW());

-- Verificação
SELECT * FROM annual_insights WHERE user_id = 999;
-- Esperado: 3 registros com anos diferentes
```

---

### Caso 2: Atualizar Insight do Mesmo Ano

```sql
-- Primeiro insight
INSERT INTO annual_insights (user_id, year, insight)
VALUES (999, 2024, 'Insight original')
ON CONFLICT (user_id, year)
DO UPDATE SET insight = EXCLUDED.insight;

-- Segundo insight (mesmo ano, mesmo usuário)
INSERT INTO annual_insights (user_id, year, insight)
VALUES (999, 2024, 'Insight atualizado')
ON CONFLICT (user_id, year)
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- Verificação
SELECT insight, updated_at FROM annual_insights 
WHERE user_id = 999 AND year = 2024;
-- Esperado: 1 registro com "Insight atualizado"
```

---

### Caso 3: Múltiplos Usuários, Mesmo Ano

```sql
INSERT INTO annual_insights (user_id, year, insight)
VALUES 
  (123, 2024, 'Insight do usuário 123'),
  (456, 2024, 'Insight do usuário 456'),
  (789, 2024, 'Insight do usuário 789');

-- Verificação
SELECT * FROM annual_insights WHERE year = 2024;
-- Esperado: 3 registros de usuários diferentes
```

---

## 📋 Checklist de Validação

- [ ] Criar insight para 2024
- [ ] Verificar que está salvo para 2024 (não 2025)
- [ ] Criar insight para 2023
- [ ] Verificar query #4: contar insights por ano
- [ ] Verificar query #7: último insight de cada ano
- [ ] Criar insight trimestral para Q3 2024
- [ ] Verificar constraint única (não duplicar)
- [ ] Testar atualização de insight existente
- [ ] Verificar índices estão sendo usados
- [ ] Validar dados no Google Sheets também

---

## 🚀 Performance

### Query Rápidas (com Índices)

```sql
-- Todos os insights de um usuário (< 1ms)
SELECT * FROM annual_insights 
WHERE user_id = 123;

-- Insights de um usuário em um ano (< 1ms)
SELECT * FROM annual_insights 
WHERE user_id = 123 AND year = 2024;

-- Últimos N insights (< 10ms)
SELECT * FROM annual_insights 
ORDER BY created_at DESC LIMIT 10;
```

### Queries Lentas (sem Índice)

```sql
-- Ruim: Sem filtro por user_id
SELECT * FROM annual_insights 
WHERE year = 2024;  -- ❌ LENTO se muitos usuários

-- Bom: Com user_id
SELECT * FROM annual_insights 
WHERE user_id = 123 AND year = 2024;  -- ✅ RÁPIDO
```

---

## 📞 Suporte

Se algo não funcionar:

1. **Verifique o YearContext**
   ```typescript
   const { selectedYear } = useYear();
   console.log('Selected Year:', selectedYear);
   ```

2. **Verifique o Network**
   - DevTools → Network → annual-insight
   - Request body deve conter `year`

3. **Verifique o Backend**
   - Logs: `console.error()` nos endpoints
   - Status HTTP da resposta

4. **Verifique o Banco**
   - Rode query #1 para ver todos os insights
   - Rode query #5 para validar dados

---

## 📚 Referência Completa

- **Tabela:** `annual_insights`
- **Constraint:** `UNIQUE (user_id, year)`
- **Índices:** `(user_id, year)`, `(user_id, created_at DESC)`
- **PostgreSQL version:** 14+
- **Próximas melhorias:** Leitura de insights históricos, timeline visual
