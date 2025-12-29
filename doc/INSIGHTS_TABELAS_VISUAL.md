# 📊 Tabelas de Insights - Resumo Visual

## 🎯 Três Tipos de Insights

```
┌─────────────────────────────────────────────────────────────────┐
│                    INSIGHTS DO FLUA                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🌙 MENSAIS (monthly_insights)                                 │
│  ├─ 1 por fase lunar, por mês                                  │
│  ├─ 4 fases × 12 meses = até 48 por ano                        │
│  └─ Refletem progresso mensal                                  │
│                                                                 │
│  ⭐ TRIMESTRAIS (quarterly_insights)                            │
│  ├─ 1 por fase lunar, por trimestre                            │
│  ├─ 4 fases × 4 trimestres = 16 por ano                        │
│  └─ Refletem progresso trimestral                              │
│                                                                 │
│  ☀️  ANUAIS (annual_insights)                                   │
│  ├─ 1 por ano                                                  │
│  ├─ 1 por ano                                                  │
│  └─ Refletem o aprendizado do ano                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estrutura das Tabelas

### monthly_insights

```sql
┌──────────────────────────────────────────┐
│         monthly_insights                 │
├──────────────────────────────────────────┤
│ id              BIGSERIAL PRIMARY KEY    │
│ user_id         BIGINT (FK users.id)    │
│ moon_phase      TEXT (4 valores)        │
│ month_number    INT (1-12)              │
│ insight         TEXT                    │
│ created_at      TIMESTAMPTZ             │
│ updated_at      TIMESTAMPTZ             │
├──────────────────────────────────────────┤
│ UNIQUE: (user_id, moon_phase, month)    │
│ INDEX: user_id, created_at DESC         │
│ INDEX: user_id, month_number            │
│ INDEX: user_id, moon_phase              │
└──────────────────────────────────────────┘
```

**Exemplo de dados:**

```
id | user_id | moon_phase   | month | insight                      | created_at
1  | 123     | luaNova      | 1     | "Intenções para janeiro..."  | 2024-01-02
2  | 123     | luaCrescente | 1     | "Vi crescimento em..."       | 2024-01-10
3  | 123     | luaCheia     | 1     | "Colhi resultados de..."     | 2024-01-18
4  | 123     | luaMinguante | 1     | "Deixei partir..."           | 2024-01-25
```

---

### quarterly_insights

```sql
┌──────────────────────────────────────────┐
│       quarterly_insights                 │
├──────────────────────────────────────────┤
│ id              BIGSERIAL PRIMARY KEY    │
│ user_id         BIGINT (FK users.id)    │
│ moon_phase      TEXT (4 valores)        │
│ quarter_number  INT (1-4)               │
│ insight         TEXT                    │
│ created_at      TIMESTAMPTZ             │
│ updated_at      TIMESTAMPTZ             │
├──────────────────────────────────────────┤
│ UNIQUE: (user_id, moon_phase, quarter)  │
│ INDEX: user_id, created_at DESC         │
│ INDEX: user_id, quarter_number          │
│ INDEX: user_id, moon_phase              │
└──────────────────────────────────────────┘
```

**Trimestres:**
| Trimestre | Meses | Período |
|-----------|-------|---------|
| 1 | Jan-Mar | Q1 |
| 2 | Abr-Jun | Q2 |
| 3 | Jul-Set | Q3 |
| 4 | Out-Dez | Q4 |

**Exemplo de dados:**

```
id | user_id | moon_phase   | quarter | insight                         | created_at
1  | 123     | luaNova      | 1       | "Plantei sementes no Q1..."     | 2024-01-05
2  | 123     | luaCrescente | 1       | "Crescimento em temas..."       | 2024-02-08
3  | 123     | luaCheia     | 1       | "Colheita do Q1 foi..."         | 2024-03-15
4  | 123     | luaMinguante | 1       | "Reflexões e aprendizados..."   | 2024-04-10
```

---

### annual_insights

```sql
┌──────────────────────────────────────────┐
│        annual_insights                   │
├──────────────────────────────────────────┤
│ id              BIGSERIAL PRIMARY KEY    │
│ user_id         BIGINT (FK users.id)    │
│ year            INT (2000-2999)         │
│ insight         TEXT                    │
│ created_at      TIMESTAMPTZ             │
│ updated_at      TIMESTAMPTZ             │
├──────────────────────────────────────────┤
│ UNIQUE: (user_id, year)                 │
│ INDEX: user_id, created_at DESC         │
│ INDEX: user_id, year                    │
└──────────────────────────────────────────┘
```

**Exemplo de dados:**

```
id | user_id | year | insight                                  | created_at
1  | 123     | 2024 | "2024 foi um ano de transformações..."  | 2024-12-31
2  | 123     | 2025 | "2025 vou focar em saúde mental..."    | 2025-01-01
```

---

## 🔗 Relacionamentos

```
                  users
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
  monthly_insights  quarterly_  annual_
                    insights    insights

Cada tabela tem:
- FK para users (ON DELETE CASCADE)
- Índices para busca rápida
- Constraints de unicidade
- Timestamps de criação/atualização
```

---

## 📝 Funções Disponíveis em `lib/forms.ts`

### Salvar Insights

```typescript
// Mensais
saveMonthlyInsight(userId, moonPhase, monthNumber, insight) → Promise<InsightRow>

// Trimestrais
saveQuarterlyInsight(userId, moonPhase, quarterNumber, insight) → Promise<InsightRow>

// Anuais
saveAnnualInsight(userId, insight, year?) → Promise<InsightRow>
```

### Obter Insights

```typescript
// Mensais
getMonthlyInsights(userId, monthNumber?) → Promise<InsightRow[]>
getMonthlyInsight(userId, moonPhase, monthNumber) → Promise<InsightRow | null>

// Trimestrais
getQuarterlyInsights(userId, quarterNumber?) → Promise<InsightRow[]>
getQuarterlyInsight(userId, moonPhase, quarterNumber) → Promise<InsightRow | null>

// Anuais
getAnnualInsight(userId, year?) → Promise<InsightRow | null>
getAnnualInsights(userId) → Promise<InsightRow[]>

// Todos combinados
getAllInsights(userId) → Promise<CombinedInsightRow[]>
```

---

## 💾 Exemplo de Uso

### Frontend (React)

```typescript
import { saveMonthlyInsight, getMonthlyInsights } from '@/lib/forms';

// Salvar um insight
const result = await saveMonthlyInsight(
  userId,
  'luaNova', // fase lunar
  1, // janeiro
  'Meu insight aqui...'
);

// Obter insights do mês
const insights = await getMonthlyInsights(userId, 1);
```

### API Route (Next.js)

```typescript
// app/api/form/monthly-insight/route.ts
import { saveMonthlyInsight } from '@/lib/forms';

export async function POST(request: Request) {
  const { moonPhase, monthNumber, insight } = await request.json();
  const userId = session.user.id;

  const result = await saveMonthlyInsight(userId, moonPhase, monthNumber, insight);

  return Response.json(result);
}
```

---

## ✅ Dados Importantes

### Fases Lunares (enum)

- `luaNova` - Lua Nova
- `luaCrescente` - Lua Crescente
- `luaCheia` - Lua Cheia
- `luaMinguante` - Lua Minguante

### Restrições

- `month_number`: 1-12
- `quarter_number`: 1-4
- `year`: 2000-2999
- `moon_phase`: deve ser um dos 4 valores acima

### Constraints de Unicidade

- **Monthly**: Um insight por (user, fase, mês)
- **Quarterly**: Um insight por (user, fase, trimestre)
- **Annual**: Um insight por (user, ano)

---

## 🚀 Próximos Passos

1. **Executar migrations** no banco Neon
2. **Testar funções** com dados de teste
3. **Integrar com APIs** de salvamento
4. **Exibir insights** na interface
5. **Editar insights** existentes
6. **Deletar insights** quando necessário

---

## 📚 Arquivos Relacionados

- `infra/db/schema.sql` - Definições das tabelas
- `lib/forms.ts` - Funções de banco de dados
- `hooks/useMonthlyInsights.ts` - Hook para insights mensais
- `hooks/useQuarterlyInsights.ts` - Hook para insights trimestrais
- `hooks/useAnnualInsights.ts` - Hook para insights anuais
- `components/MonthlyInsightModal.tsx` - Modal de entrada mensal
- `components/QuarterlyInsightModal.tsx` - Modal de entrada trimestral
- `components/AnnualInsightModal.tsx` - Modal de entrada anual
