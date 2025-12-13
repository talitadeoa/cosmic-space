# 🌙 Configuração de Lualist com Banco de Dados

## Visão Geral

A configuração permite que **LuaListScreen** receba dados de **datas de lunações, fases da lua e signos zodiacais** através do banco de dados PostgreSQL (Neon) ou da API local.

### Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    LuaListScreen (UI)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ fetchMoonCalendar()
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            /api/moons/lunations (GET)                       │
│  - Tenta buscar do banco primeiro (source=auto)             │
│  - Gera localmente se não encontrar                         │
│  - Retorna: data, moonPhase, sign, illumination, etc       │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
   ┌─────────────┐          ┌──────────────────┐
   │   Neon DB   │          │  Geração Local   │
   │ (lunations) │          │   (fallback)     │
   └─────────────┘          └──────────────────┘
```

---

## 📋 Componentes Implementados

### 1. **Schema do Banco de Dados** (`infra/db/schema.sql`)

Nova tabela `lunations`:

```sql
CREATE TABLE IF NOT EXISTS lunations (
  id BIGSERIAL PRIMARY KEY,
  lunation_date DATE NOT NULL UNIQUE,
  moon_phase TEXT NOT NULL,              -- 'Lua Nova', 'Lua Crescente', etc
  zodiac_sign TEXT NOT NULL,             -- 'Áries', 'Touro', etc
  illumination DECIMAL(5, 2),            -- 0-100 (percentual)
  age_days DECIMAL(6, 3),                -- idade em dias (0-29.5)
  description TEXT,
  source TEXT DEFAULT 'generated',       -- 'generated' | 'synced' | 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lunations_date ON lunations (lunation_date DESC);
CREATE INDEX IF NOT EXISTS idx_lunations_phase ON lunations (moon_phase);
CREATE INDEX IF NOT EXISTS idx_lunations_sign ON lunations (zodiac_sign);
```

### 2. **Funções no Banco** (`lib/forms.ts`)

```typescript
// Salvar múltiplas lunações com replace automático
async function saveLunations(lunations: LunationData[]): Promise<any[]>

// Buscar lunações por range de datas
async function getLunations(startDate: string, endDate: string): Promise<LunationData[]>

// Deletar lunações de um range específico
async function deleteLunations(startDate: string, endDate: string): Promise<number>
```

### 3. **API de Lunações** (`app/api/moons/lunations/route.ts`)

#### GET `/api/moons/lunations`

**Query Parameters:**
- `start`: Data inicial (ISO YYYY-MM-DD) ✅ Obrigatório
- `end`: Data final (ISO YYYY-MM-DD) ✅ Obrigatório
- `source`: `'auto'` | `'db'` | `'generated'` (padrão: `'auto'`)

**Resposta:**
```json
{
  "days": [
    {
      "date": "2024-12-13",
      "moonPhase": "Lua Crescente",
      "sign": "Sagitário",
      "illumination": 65.5,
      "ageDays": 15.3,
      "description": null,
      "source": "database" | "app/api/moons/lunations (geração local)"
    }
  ],
  "generatedAt": "2024-12-13T10:30:00.000Z",
  "source": "database" | "app/api/moons/lunations (geração local)",
  "range": { "start": "2024-01-01", "end": "2024-12-31" }
}
```

#### POST `/api/moons/lunations`

**Body:**
```json
{
  "days": [
    {
      "date": "2024-12-13",
      "moonPhase": "Lua Crescente",
      "sign": "Sagitário",
      "illumination": 65.5,
      "ageDays": 15.3,
      "description": "Novo ciclo"
    }
  ],
  "action": "replace" | "append"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "365 lunações salvas com sucesso",
  "count": 365
}
```

### 4. **Hook para Lunações** (`hooks/useLunations.ts`)

```typescript
// Buscar lunações via API
const lunations = useLunations();
await lunations.fetch('2024-01-01', '2024-12-31', 'auto');

// Ou usar com hook automático
const { data, isLoading, error, source } = useLunationsForRange(
  '2024-01-01',
  '2024-12-31',
  true
);
```

### 5. **Script de Sincronização** (`scripts/sync-lunations.js`)

Sincroniza lunações do backend local para o banco de dados.

---

## 🚀 Como Usar

### Passo 1: Criar a Tabela no Banco

Execute o SQL em seu banco Neon:

```bash
# Via console Neon (web) ou psql:
psql $DATABASE_URL < infra/db/schema.sql
```

Ou copie e execute apenas a tabela `lunations`:

```sql
CREATE TABLE IF NOT EXISTS lunations (
  id BIGSERIAL PRIMARY KEY,
  lunation_date DATE NOT NULL UNIQUE,
  moon_phase TEXT NOT NULL,
  zodiac_sign TEXT NOT NULL,
  illumination DECIMAL(5, 2),
  age_days DECIMAL(6, 3),
  description TEXT,
  source TEXT DEFAULT 'generated',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lunations_date ON lunations (lunation_date DESC);
CREATE INDEX IF NOT EXISTS idx_lunations_phase ON lunations (moon_phase);
CREATE INDEX IF NOT EXISTS idx_lunations_sign ON lunations (zodiac_sign);
```

### Passo 2: Sincronizar Dados (Opcional)

Preencher o banco com lunações dos últimos 3 anos:

```bash
# Sincronizar anos padrão (ano anterior, atual e próximo)
node scripts/sync-lunations.js

# Sincronizar anos específicos
node scripts/sync-lunations.js --years=2024,2025

# Sincronizar com replace (limpar e recriar)
node scripts/sync-lunations.js --years=2024,2025 --replace
```

### Passo 3: Testar a API

```bash
# Buscar lunações do banco (fallback para geração local)
curl "http://localhost:3000/api/moons/lunations?start=2024-01-01&end=2024-12-31"

# Forçar buscar apenas do banco
curl "http://localhost:3000/api/moons/lunations?start=2024-01-01&end=2024-12-31&source=db"

# Forçar geração local
curl "http://localhost:3000/api/moons/lunations?start=2024-01-01&end=2024-12-31&source=generated"
```

### Passo 4: Usar em LuaListScreen

LuaListScreen já usa `fetchMoonCalendar()` que automaticamente:

1. Tenta buscar `/api/moons/lunations` primeiro
2. Se houver dados no banco, usa eles
3. Se não houver, gera localmente e usa o fallback

**Nenhuma alteração é necessária em LuaListScreen!**

---

## 🔧 Integração Avançada

### Usar o Hook `useLunations`

```typescript
import { useLunations } from '@/hooks/useLunations';

export function MyComponent() {
  const lunations = useLunations();

  useEffect(() => {
    lunations.fetch('2024-01-01', '2024-12-31', 'auto');
  }, []);

  if (lunations.isLoading) return <div>Carregando...</div>;
  if (lunations.error) return <div>Erro: {lunations.error}</div>;

  return (
    <div>
      <p>Fonte: {lunations.source}</p>
      <p>Total: {lunations.data.length} dias</p>
      {lunations.data.map((day) => (
        <div key={day.date}>
          {day.date} - {day.moonPhase} ({day.sign})
        </div>
      ))}
    </div>
  );
}
```

### Sincronizar Automaticamente

Adicionar no `useEffect` do seu componente:

```typescript
useEffect(() => {
  async function syncLunations() {
    const year = new Date().getFullYear();
    try {
      // Gerar dados localmente
      const response = await fetch(
        `/api/moons/lunations?start=${year}-01-01&end=${year}-12-31&source=generated`
      );
      const { days } = await response.json();

      // Salvar no banco
      await fetch('/api/moons/lunations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, action: 'replace' }),
      });

      console.log('✅ Lunações sincronizadas');
    } catch (error) {
      console.error('❌ Erro ao sincronizar:', error);
    }
  }

  syncLunations();
}, []);
```

---

## 📊 Estrutura de Dados

### Tipo `LunationData`

```typescript
interface LunationData {
  lunation_date: string;      // "2024-12-13"
  moon_phase: string;         // "Lua Nova", "Lua Crescente", etc
  zodiac_sign: string;        // "Áries", "Touro", etc
  illumination?: number;      // 0-100 (percentual)
  age_days?: number;          // 0-29.53 (idade em dias)
  description?: string;       // Optional description
  source?: string;            // 'generated' | 'synced' | 'manual'
}
```

### Fases Lunares Suportadas

- ✅ **Lua Nova** (new moon)
- ✅ **Lua Crescente** (waxing crescent)
- ✅ **Lua Cheia** (full moon)
- ✅ **Lua Minguante** (waning crescent)

### Signos Zodiacais Suportados

- Capricórnio (20 dez - 20 jan)
- Aquário (21 jan - 19 fev)
- Peixes (20 fev - 20 mar)
- Áries (21 mar - 20 abr)
- Touro (21 abr - 20 mai)
- Gêmeos (21 mai - 21 jun)
- Câncer (22 jun - 22 jul)
- Leão (23 jul - 22 ago)
- Virgem (23 ago - 22 set)
- Libra (23 set - 22 out)
- Escorpião (23 out - 21 nov)
- Sagitário (22 nov - 21 dez)

---

## 🎯 Casos de Uso

### 1. **Visualização em LuaListScreen**

LuaListScreen mostra um calendário lunar completo com:
- Datas das lunações
- Fases da lua (Nova, Crescente, Cheia, Minguante)
- Signos zodiacais
- Iluminação percentual

### 2. **Insights Personalizados**

Vincular insights do usuário a lunações específicas:

```typescript
// Usuário cria um insight para a Lua Cheia em Sagitário
await saveMonthlyInsight(userId, 'Lua Cheia', 12, 'Meu insight...');

// Mais tarde, obter toda a lunação com contexto
const lunation = await getLunations('2024-12-12', '2024-12-14');
// Retorna: { date, moonPhase, sign, illumination, ... }
```

### 3. **Sincronização Automática**

Cada vez que o usuário acessa a aplicação:

```typescript
// AutoSyncLunar.tsx (melhorado)
useEffect(() => {
  async function syncYearToDb() {
    const year = new Date().getFullYear();
    
    // Buscar do banco (retorna vazio se não existir)
    const dbData = await getLunations(`${year}-01-01`, `${year}-12-31`);
    
    if (dbData.length === 0) {
      // Gerar e sincronizar
      const generated = await fetch(
        `/api/moons/lunations?start=${year}-01-01&end=${year}-12-31&source=generated`
      );
      const { days } = await generated.json();
      
      await fetch('/api/moons/lunations', {
        method: 'POST',
        body: JSON.stringify({ days, action: 'append' }),
      });
    }
  }

  syncYearToDb();
}, []);
```

---

## 📈 Performance

### Otimizações Implementadas

✅ **Índices no Banco**
- `idx_lunations_date` - Busca por range de datas (rápido)
- `idx_lunations_phase` - Filtro por fase lunar
- `idx_lunations_sign` - Filtro por signo

✅ **Fallback Inteligente**
- Tenta banco primeiro (rápido se populado)
- Gera localmente se vazio (sem latência de rede)
- Cache no cliente possível via localStorage

✅ **Limite de Dias**
- Máximo 550 dias por requisição (3-4KB de dados)
- Múltiplos anos? Fazer requisições separadas

---

## 🐛 Troubleshooting

### "Erro ao buscar lunações"

**Solução 1:** Verificar se tabela existe
```sql
SELECT * FROM lunations LIMIT 1;
```

**Solução 2:** Forçar geração local
```bash
curl "http://localhost:3000/api/moons/lunations?source=generated&start=2024-01-01&end=2024-12-31"
```

### "Dados em branco na LuaListScreen"

**Causa:** Banco vazio e geração falhando
**Solução:** Executar script de sincronização
```bash
node scripts/sync-lunations.js --replace
```

### "Discrepâncias entre anos"

**Solução:** Limpar e resincronizar
```bash
node scripts/sync-lunations.js --years=2023,2024,2025 --replace
```

---

## 📚 Referências Rápidas

| Função | Arquivo | Descrição |
|--------|---------|-----------|
| `getLunations()` | `lib/forms.ts` | Busca do banco |
| `saveLunations()` | `lib/forms.ts` | Salva no banco |
| `useLunations()` | `hooks/useLunations.ts` | Hook React |
| GET `/api/moons/lunations` | `app/api/moons/lunations/route.ts` | API de leitura |
| POST `/api/moons/lunations` | `app/api/moons/lunations/route.ts` | API de escrita |
| Sync script | `scripts/sync-lunations.js` | Sincronização manual |

---

## ✨ Próximos Passos Recomendados

1. ✅ **Executar script de sincronização** para popular ano atual
2. ✅ **Testar LuaListScreen** com dados do banco
3. ✅ **Integrar AutoSyncLunar** para manter sempre atualizado
4. ✅ **Adicionar endpoint de cache** para melhor performance
5. ✅ **Documentar pattern** para novos componentes

---

**Criado em:** 13 de dezembro de 2024  
**Última atualização:** 13 de dezembro de 2024
