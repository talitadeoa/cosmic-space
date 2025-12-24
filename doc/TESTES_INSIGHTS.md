# ✅ Testes Rápidos - Insights

## 🧪 Testes SQL (Neon Console)

Copie e cole estes comandos no SQL Editor do Neon para testar a estrutura.

### Teste 1: Verificar Tabelas

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name
FROM information_schema.tables
WHERE table_name IN (
  'monthly_insights',
  'quarterly_insights',
  'annual_insights'
)
ORDER BY table_name;
```

**Resultado esperado:**

```
table_name
─────────────────────
annual_insights
monthly_insights
quarterly_insights
```

---

### Teste 2: Verificar Estrutura

```sql
-- Ver colunas de monthly_insights
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'monthly_insights'
ORDER BY ordinal_position;
```

**Resultado esperado:**

```
column_name   | data_type          | is_nullable | column_default
──────────────┼────────────────────┼─────────────┼───────────────
id            | bigint             | NO          |
user_id       | bigint             | NO          |
moon_phase    | text               | NO          |
month_number  | integer            | NO          |
insight       | text               | NO          |
created_at    | timestamp with...  | YES         | now()
updated_at    | timestamp with...  | YES         | now()
```

---

### Teste 3: Verificar Índices

```sql
-- Ver índices criados
SELECT indexname
FROM pg_indexes
WHERE tablename IN (
  'monthly_insights',
  'quarterly_insights',
  'annual_insights'
)
ORDER BY tablename, indexname;
```

**Resultado esperado:**

```
indexname
────────────────────────────────────
idx_annual_insights_user_date
idx_annual_insights_user_year
idx_monthly_insights_user_date
idx_monthly_insights_user_month
idx_monthly_insights_user_phase
idx_quarterly_insights_user_date
idx_quarterly_insights_user_phase
idx_quarterly_insights_user_quarter
```

---

### Teste 4: Inserir Dados de Teste

```sql
-- Inserir um insight mensal
INSERT INTO monthly_insights (user_id, moon_phase, month_number, insight)
VALUES (1, 'luaNova', 1, 'Test insight for January Luna Nova')
ON CONFLICT (user_id, moon_phase, month_number)
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW()
RETURNING id, user_id, moon_phase, month_number, insight, created_at;
```

**Resultado esperado:**

```
id | user_id | moon_phase | month_number | insight                          | created_at
───┼─────────┼────────────┼──────────────┼──────────────────────────────────┼────────────────
1  | 1       | luaNova    | 1            | Test insight for January Lun...  | 2024-12-13...
```

---

### Teste 5: Verificar Constraint de Unicidade

```sql
-- Tentar inserir duplicado (deve atualizar)
INSERT INTO monthly_insights (user_id, moon_phase, month_number, insight)
VALUES (1, 'luaNova', 1, 'Updated insight!')
ON CONFLICT (user_id, moon_phase, month_number)
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW()
RETURNING id, user_id, insight, updated_at;
```

**Resultado esperado:**

```
id | user_id | insight           | updated_at
───┼─────────┼───────────────────┼────────────────
1  | 1       | Updated insight!  | 2024-12-13... (novo timestamp)
```

---

### Teste 6: Inserir Todos os Dados de Teste

```sql
-- Executar o arquivo dados-teste-insights.sql
-- (Copie e cole todo o conteúdo do arquivo)
```

Depois verifique:

```sql
-- Contar insights por tipo
SELECT
  'Mensais' as tipo,
  COUNT(*) as total
FROM monthly_insights
WHERE user_id = 1

UNION ALL

SELECT
  'Trimestrais',
  COUNT(*)
FROM quarterly_insights
WHERE user_id = 1

UNION ALL

SELECT
  'Anuais',
  COUNT(*)
FROM annual_insights
WHERE user_id = 1;
```

**Resultado esperado:**

```
tipo        | total
────────────┼───────
Anuais      | 2
Mensais     | 8
Trimestrais | 16
```

---

## 🧪 Testes de API (curl ou Postman)

### Teste 1: Salvar Insight Mensal

```bash
curl -X POST http://localhost:3000/api/form/monthly-insight \
  -H "Content-Type: application/json" \
  -d '{
    "moonPhase": "luaNova",
    "monthNumber": 1,
    "insight": "Test insight for January"
  }' \
  -H "Cookie: session=your_session_token"
```

**Resultado esperado (200 OK):**

```json
{
  "id": 1,
  "user_id": 123,
  "moon_phase": "luaNova",
  "month_number": 1,
  "insight": "Test insight for January",
  "created_at": "2024-12-13T...",
  "updated_at": "2024-12-13T..."
}
```

---

### Teste 2: Salvar Insight Trimestral

```bash
curl -X POST http://localhost:3000/api/form/quarterly-insight \
  -H "Content-Type: application/json" \
  -d '{
    "moonPhase": "luaCrescente",
    "quarterNumber": 1,
    "insight": "Q1 was great!"
  }' \
  -H "Cookie: session=your_session_token"
```

**Resultado esperado (200 OK):**

```json
{
  "id": 1,
  "user_id": 123,
  "moon_phase": "luaCrescente",
  "quarter_number": 1,
  "insight": "Q1 was great!",
  "created_at": "2024-12-13T...",
  "updated_at": "2024-12-13T..."
}
```

---

### Teste 3: Salvar Insight Anual

```bash
curl -X POST http://localhost:3000/api/form/annual-insight \
  -H "Content-Type: application/json" \
  -d '{
    "insight": "2024 was transformative",
    "year": 2024
  }' \
  -H "Cookie: session=your_session_token"
```

**Resultado esperado (200 OK):**

```json
{
  "id": 1,
  "user_id": 123,
  "year": 2024,
  "insight": "2024 was transformative",
  "created_at": "2024-12-13T...",
  "updated_at": "2024-12-13T..."
}
```

---

### Teste 4: Erro de Validação

```bash
curl -X POST http://localhost:3000/api/form/monthly-insight \
  -H "Content-Type: application/json" \
  -d '{
    "moonPhase": "invalidPhase",
    "monthNumber": 1,
    "insight": "This should fail"
  }' \
  -H "Cookie: session=your_session_token"
```

**Resultado esperado (400 Bad Request):**

```json
{
  "error": "Invalid moon phase"
}
```

---

### Teste 5: Sem Autenticação

```bash
curl -X POST http://localhost:3000/api/form/monthly-insight \
  -H "Content-Type: application/json" \
  -d '{
    "moonPhase": "luaNova",
    "monthNumber": 1,
    "insight": "Should fail"
  }'
```

**Resultado esperado (401 Unauthorized):**

```json
{
  "error": "Unauthorized"
}
```

---

## 🧪 Testes de Função TypeScript

### Teste 1: Salvar Mensal

```typescript
import { saveMonthlyInsight } from '@/lib/forms';

// Teste
const result = await saveMonthlyInsight(
  '1', // userId
  'luaNova',
  1, // janeiro
  'Test insight'
);

console.log(result);
// Output:
// {
//   id: 1,
//   user_id: 1,
//   moon_phase: 'luaNova',
//   month_number: 1,
//   insight: 'Test insight',
//   created_at: '2024-12-13T...',
//   updated_at: '2024-12-13T...'
// }
```

---

### Teste 2: Obter Mensais

```typescript
import { getMonthlyInsights } from '@/lib/forms';

// Teste
const insights = await getMonthlyInsights('1', 1); // user 1, January

console.log(insights);
// Output:
// [
//   { id: 1, moon_phase: 'luaNova', insight: '...', created_at: '...' },
//   { id: 2, moon_phase: 'luaCrescente', insight: '...', created_at: '...' },
//   { id: 3, moon_phase: 'luaCheia', insight: '...', created_at: '...' },
//   { id: 4, moon_phase: 'luaMinguante', insight: '...', created_at: '...' }
// ]
```

---

### Teste 3: Obter Específico

```typescript
import { getMonthlyInsight } from '@/lib/forms';

// Teste
const insight = await getMonthlyInsight('1', 'luaNova', 1);

console.log(insight);
// Output:
// {
//   id: 1,
//   moon_phase: 'luaNova',
//   month_number: 1,
//   insight: 'Test insight',
//   created_at: '2024-12-13T...',
//   updated_at: '2024-12-13T...'
// }
```

---

## 🧪 Testes de Frontend

### Teste 1: Abrir Modal

```typescript
// No seu componente
const [isOpen, setIsOpen] = useState(false);

// Teste: clicar para abrir
<button onClick={() => setIsOpen(true)}>
  Open Modal
</button>

// Resultado: Modal deve aparecer na tela
```

---

### Teste 2: Salvar via Hook

```typescript
import { useMonthlyInsights } from '@/hooks/useMonthlyInsights';

function TestComponent() {
  const { saveInsight, isLoading, error } = useMonthlyInsights();

  async function handleTest() {
    try {
      const result = await saveInsight('luaNova', 1, 'Test insight');
      console.log('✅ Success:', result);
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }

  return <button onClick={handleTest}>Test Save</button>;
}
```

---

### Teste 3: Verificar no DevTools

```javascript
// No console do browser (F12)

// Ver se a requisição foi feita
console.log('Check Network tab for POST /api/form/monthly-insight');

// Ver resposta
fetch('/api/form/monthly-insight', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    moonPhase: 'luaNova',
    monthNumber: 1,
    insight: 'Test',
  }),
  credentials: 'include',
})
  .then((r) => r.json())
  .then((data) => console.log('Response:', data))
  .catch((e) => console.error('Error:', e));
```

---

## 📋 Checklist de Testes

### Banco de Dados

- [ ] Tabelas criadas
- [ ] Índices criados
- [ ] Constraints verificados
- [ ] Dados de teste inseridos
- [ ] Unicidade funcionando (UPDATE em duplicado)

### Backend

- [ ] Funções em `lib/forms.ts` importam sem erro
- [ ] Pode salvar mensal
- [ ] Pode salvar trimestral
- [ ] Pode salvar anual
- [ ] Pode obter dados
- [ ] Validação funciona

### APIs

- [ ] POST `/api/form/monthly-insight` retorna 200
- [ ] POST `/api/form/quarterly-insight` retorna 200
- [ ] POST `/api/form/annual-insight` retorna 200
- [ ] Erro 401 sem autenticação
- [ ] Erro 400 com dados inválidos
- [ ] Dados salvos no banco

### Frontend

- [ ] Modal abre
- [ ] Modal fecha
- [ ] Texto pode ser digitado
- [ ] Botão "Salvar" ativa requisição
- [ ] Loading state aparece
- [ ] Sucesso/erro é mostrado
- [ ] Dados salvos verificáveis no banco

### Performance

- [ ] Salvamento < 1 segundo
- [ ] Sem erro no console
- [ ] Sem avisos de performance
- [ ] Índices utilizados (verificar EXPLAIN)

---

## 🚀 Próximo Passo

Após todos os testes passarem:

1. Remova dados de teste

```sql
DELETE FROM monthly_insights WHERE user_id IN (1, 2);
DELETE FROM quarterly_insights WHERE user_id IN (1, 2);
DELETE FROM annual_insights WHERE user_id IN (1, 2);
```

2. Faça commit dos arquivos

```bash
git add .
git commit -m "feat: add insights tables and functions"
```

3. Deploy para produção

---

## 📊 Resultado Final

✅ Banco de dados com 3 tabelas otimizadas  
✅ Funções de CRUD em TypeScript  
✅ APIs de salvamento funcionando  
✅ Componentes React integrados  
✅ Tudo testado e validado

**Pronto para usar! 🎉**
