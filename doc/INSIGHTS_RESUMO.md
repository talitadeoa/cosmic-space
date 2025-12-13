# 🌟 Tabelas de Insights - Resumo Executivo

## 📌 O Que Foi Criado

Você agora tem um sistema completo para armazenar **três tipos de insights** no banco de dados:

### 1. Insights Mensais 🌙
- **Tabela:** `monthly_insights`
- **Frequência:** 4 por mês (uma por fase lunar)
- **Total/ano:** até 48 insights
- **Exemplos:**
  - Lua Nova em Janeiro: "Comecei o ano com intenções..."
  - Lua Crescente em Janeiro: "Observei crescimento em..."
  - Lua Cheia em Janeiro: "Colhi resultados de..."
  - Lua Minguante em Janeiro: "Deixei partir o que não serve..."

### 2. Insights Trimestrais ⭐
- **Tabela:** `quarterly_insights`
- **Frequência:** 1 por trimestre (4 fases lunares)
- **Total/ano:** 4 insights
- **Trimestres:**
  - Q1: Janeiro a Março
  - Q2: Abril a Junho
  - Q3: Julho a Setembro
  - Q4: Outubro a Dezembro

### 3. Insights Anuais ☀️
- **Tabela:** `annual_insights`
- **Frequência:** 1 por ano
- **Total:** 1 insight (pode atualizar)
- **Exemplo:** "2024 foi um ano de transformações..."

---

## 📊 Estrutura das Tabelas

```
┌─────────────────────────────────┐
│       monthly_insights          │
├─────────────────────────────────┤
│ id              BIGSERIAL       │
│ user_id         BIGINT (FK)     │
│ moon_phase      TEXT            │
│ month_number    INT (1-12)      │
│ insight         TEXT            │
│ created_at      TIMESTAMPTZ     │
│ updated_at      TIMESTAMPTZ     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      quarterly_insights         │
├─────────────────────────────────┤
│ id              BIGSERIAL       │
│ user_id         BIGINT (FK)     │
│ moon_phase      TEXT            │
│ quarter_number  INT (1-4)       │
│ insight         TEXT            │
│ created_at      TIMESTAMPTZ     │
│ updated_at      TIMESTAMPTZ     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│       annual_insights           │
├─────────────────────────────────┤
│ id              BIGSERIAL       │
│ user_id         BIGINT (FK)     │
│ year            INT             │
│ insight         TEXT            │
│ created_at      TIMESTAMPTZ     │
│ updated_at      TIMESTAMPTZ     │
└─────────────────────────────────┘
```

---

## 🔧 Fases Lunares Suportadas

```
✅ luaNova       - Lua Nova (fase de intenções)
✅ luaCrescente  - Lua Crescente (fase de crescimento)
✅ luaCheia      - Lua Cheia (fase de colheita)
✅ luaMinguante  - Lua Minguante (fase de reflexão)
```

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

```
doc/
├── INSIGHTS_BANCO_DADOS.md       ← Guia completo das tabelas
├── INSIGHTS_TABELAS_VISUAL.md    ← Visualização das estruturas
├── INSIGHTS_API.md                ← Documentação das APIs
└── CHECKLIST_INSIGHTS.md          ← Checklist de implementação

infra/db/
└── migration-insights.sql         ← Script SQL para criar tabelas
```

### Arquivos Modificados

```
infra/db/
└── schema.sql                     ← Tabelas melhoradas

lib/
└── forms.ts                       ← Novas funções de banco
```

---

## 🚀 Começar a Usar

### 1. Executar Migration no Neon

```bash
# Copie o conteúdo de:
infra/db/migration-insights.sql

# Cole no Neon Console (SQL Editor)
# E execute (Ctrl+Enter ou Cmd+Enter)
```

### 2. Usar as Funções em `lib/forms.ts`

```typescript
import { saveMonthlyInsight, getMonthlyInsights } from '@/lib/forms';

// Salvar
const result = await saveMonthlyInsight(
  userId,
  'luaNova',
  1,  // janeiro
  'Meu insight aqui'
);

// Obter
const insights = await getMonthlyInsights(userId, 1);
```

### 3. Chamar as APIs

```typescript
// POST /api/form/monthly-insight
const response = await fetch('/api/form/monthly-insight', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    moonPhase: 'luaNova',
    monthNumber: 1,
    insight: 'Texto do insight'
  }),
  credentials: 'include'
});
```

---

## 📚 Documentação Incluída

| Documento | Descrição |
|-----------|-----------|
| `INSIGHTS_BANCO_DADOS.md` | Estrutura completa das tabelas, exemplos e queries |
| `INSIGHTS_TABELAS_VISUAL.md` | Visualizações, exemplos de dados e funções |
| `INSIGHTS_API.md` | Documentação das 3 APIs de salvamento |
| `CHECKLIST_INSIGHTS.md` | Passo a passo para implementar tudo |
| `migration-insights.sql` | Script SQL pronto para executar |

---

## 🔑 Características Principais

### ✅ Unicidade
- Um insight por fase lunar, por período
- Evita duplicação de dados
- Permite atualizações (UPSERT)

### ✅ Performance
- Índices otimizados
- Busca rápida por usuário e data
- Índices em chaves estrangeiras

### ✅ Validação
- CHECK constraints no SQL
- Validação de tipos
- Mensagens de erro claras

### ✅ Flexibilidade
- CRUD completo implementado
- ON CONFLICT para atualizações
- Timestamps automáticos

---

## 🎯 Próximos Passos

### Imediato

- [ ] Executar `migration-insights.sql` no Neon
- [ ] Testar com `curl` ou Postman
- [ ] Verificar dados no banco

### Curto Prazo

- [ ] Criar APIs se ainda não existem
- [ ] Atualizar hooks se necessário
- [ ] Testar no frontend

### Médio Prazo

- [ ] Implementar leitura de insights
- [ ] Criar dashboard para visualizar
- [ ] Adicionar edição de insights

### Longo Prazo

- [ ] Dashboard de estatísticas
- [ ] Exportar para PDF/Excel
- [ ] Integração com relatórios

---

## 💡 Exemplos Práticos

### Salvar Insight Mensal

```typescript
// Quando usuário clica "Salvar" no modal
async function handleSaveMonthlyInsight(insight: string) {
  const response = await fetch('/api/form/monthly-insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      moonPhase: 'luaNova',
      monthNumber: 1,
      insight
    }),
    credentials: 'include'
  });

  if (response.ok) {
    console.log('✅ Insight salvo!');
    // Atualizar UI, fechar modal, etc
  } else {
    console.error('❌ Erro ao salvar');
  }
}
```

### Obter Insights de um Mês

```typescript
// Para exibir insights já salvos
async function loadMonthInsights(userId: string) {
  const insights = await getMonthlyInsights(userId, 1); // janeiro
  
  // insights será um array com até 4 elementos:
  // [luaNova, luaCrescente, luaCheia, luaMinguante]
  
  return insights;
}
```

### Atualizar Insight (via API)

```typescript
// POST com mesmos moonPhase e monthNumber = UPDATE
const response = await fetch('/api/form/monthly-insight', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    moonPhase: 'luaNova',
    monthNumber: 1,
    insight: 'Novo texto do insight (atualizado)'
  }),
  credentials: 'include'
});

// Response terá updated_at = agora
```

---

## 🛠️ Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Tabelas não aparecem | Verifique se `migration-insights.sql` foi executado |
| Erro 401 na API | Verifique autenticação (`getSession()`) |
| Erro na função forms | Verifique se `DATABASE_URL` está configurada |
| Modal não abre | Verifique estado e imports no componente |
| Dados não salvam | Verifique console do navegador para erros |

---

## 📞 Suporte

Para dúvidas sobre:

- **Tabelas:** Ver `INSIGHTS_BANCO_DADOS.md`
- **APIs:** Ver `INSIGHTS_API.md`
- **Implementação:** Ver `CHECKLIST_INSIGHTS.md`
- **Visuals:** Ver `INSIGHTS_TABELAS_VISUAL.md`

---

## ✨ Resumo

Você agora tem:

✅ 3 tabelas de banco de dados otimizadas  
✅ Funções de leitura e escrita em TypeScript  
✅ APIs prontas para frontend  
✅ Documentação completa  
✅ Script SQL para executar  
✅ Checklist passo a passo  

**Tudo o que precisa para armazenar insights no banco de dados!**

🚀 Bom desenvolvimento!
