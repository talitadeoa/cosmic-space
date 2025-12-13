# 🔌 APIs de Insights - Guia de Integração

## 📋 Visão Geral

As três APIs de insights permitem salvar e recuperar os três tipos de insights:
- **POST** `/api/form/monthly-insight` - Salvar insight mensal
- **POST** `/api/form/quarterly-insight` - Salvar insight trimestral
- **POST** `/api/form/annual-insight` - Salvar insight anual

## 🔐 Autenticação

Todas as APIs requerem um usuário autenticado via sessão.

```typescript
const session = await getSession();
if (!session?.user?.id) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## 1️⃣ POST `/api/form/monthly-insight`

Salva um insight mensal para uma fase lunar específica em um mês.

### Request

```json
{
  "moonPhase": "luaNova",
  "monthNumber": 1,
  "insight": "Comecei o ano com intenções claras..."
}
```

### Request Parameters

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `moonPhase` | string | Sim | Uma das 4 fases: `luaNova`, `luaCrescente`, `luaCheia`, `luaMinguante` |
| `monthNumber` | number | Sim | Número do mês: 1-12 |
| `insight` | string | Sim | Texto do insight (mínimo 1 caractere) |

### Response (200 OK)

```json
{
  "id": 1,
  "user_id": 123,
  "moon_phase": "luaNova",
  "month_number": 1,
  "insight": "Comecei o ano com intenções claras...",
  "created_at": "2024-01-02T10:30:00Z",
  "updated_at": "2024-01-02T10:30:00Z"
}
```

### Response (400 Bad Request)

```json
{
  "error": "Missing required fields: insight"
}
```

### Response (401 Unauthorized)

```json
{
  "error": "Unauthorized"
}
```

### Response (500 Internal Server Error)

```json
{
  "error": "Failed to save insight"
}
```

### Exemplo de Uso (Frontend)

```typescript
async function saveMonthlyInsight(
  moonPhase: string,
  monthNumber: number,
  insight: string
) {
  const response = await fetch('/api/form/monthly-insight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      moonPhase,
      monthNumber,
      insight,
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Erro ao salvar');
  }

  return response.json();
}
```

### Implementação (Backend - route.ts)

```typescript
// app/api/form/monthly-insight/route.ts
import { getSession } from '@/lib/auth';
import { saveMonthlyInsight } from '@/lib/forms';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { moonPhase, monthNumber, insight } = await request.json();

    // Validação
    if (!moonPhase || !monthNumber || !insight) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (![
      'luaNova',
      'luaCrescente',
      'luaCheia',
      'luaMinguante',
    ].includes(moonPhase)) {
      return Response.json(
        { error: 'Invalid moon phase' },
        { status: 400 }
      );
    }

    if (monthNumber < 1 || monthNumber > 12) {
      return Response.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Salvar
    const result = await saveMonthlyInsight(
      session.user.id,
      moonPhase,
      monthNumber,
      insight
    );

    return Response.json(result);
  } catch (error) {
    console.error('Error saving monthly insight:', error);
    return Response.json(
      { error: 'Failed to save insight' },
      { status: 500 }
    );
  }
}
```

---

## 2️⃣ POST `/api/form/quarterly-insight`

Salva um insight trimestral para uma fase lunar específica em um trimestre.

### Request

```json
{
  "moonPhase": "luaCrescente",
  "quarterNumber": 1,
  "insight": "O trimestre trouxe crescimento em diversas áreas..."
}
```

### Request Parameters

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `moonPhase` | string | Sim | Uma das 4 fases: `luaNova`, `luaCrescente`, `luaCheia`, `luaMinguante` |
| `quarterNumber` | number | Sim | Número do trimestre: 1-4 |
| `insight` | string | Sim | Texto do insight (mínimo 1 caractere) |

### Response (200 OK)

```json
{
  "id": 5,
  "user_id": 123,
  "moon_phase": "luaCrescente",
  "quarter_number": 1,
  "insight": "O trimestre trouxe crescimento em diversas áreas...",
  "created_at": "2024-01-10T14:22:00Z",
  "updated_at": "2024-01-10T14:22:00Z"
}
```

### Trimestres Mapping

| Trimestre | Meses | Período |
|-----------|-------|---------|
| 1 | Janeiro a Março | Q1 |
| 2 | Abril a Junho | Q2 |
| 3 | Julho a Setembro | Q3 |
| 4 | Outubro a Dezembro | Q4 |

### Exemplo de Uso (Frontend)

```typescript
async function saveQuarterlyInsight(
  moonPhase: string,
  quarterNumber: number,
  insight: string
) {
  const response = await fetch('/api/form/quarterly-insight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      moonPhase,
      quarterNumber,
      insight,
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Erro ao salvar');
  }

  return response.json();
}
```

### Implementação (Backend - route.ts)

```typescript
// app/api/form/quarterly-insight/route.ts
import { getSession } from '@/lib/auth';
import { saveQuarterlyInsight } from '@/lib/forms';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { moonPhase, quarterNumber, insight } = await request.json();

    // Validação
    if (!moonPhase || !quarterNumber || !insight) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (![
      'luaNova',
      'luaCrescente',
      'luaCheia',
      'luaMinguante',
    ].includes(moonPhase)) {
      return Response.json(
        { error: 'Invalid moon phase' },
        { status: 400 }
      );
    }

    if (quarterNumber < 1 || quarterNumber > 4) {
      return Response.json(
        { error: 'Quarter must be between 1 and 4' },
        { status: 400 }
      );
    }

    // Salvar
    const result = await saveQuarterlyInsight(
      session.user.id,
      moonPhase,
      quarterNumber,
      insight
    );

    return Response.json(result);
  } catch (error) {
    console.error('Error saving quarterly insight:', error);
    return Response.json(
      { error: 'Failed to save insight' },
      { status: 500 }
    );
  }
}
```

---

## 3️⃣ POST `/api/form/annual-insight`

Salva um insight anual para o ano atual (ou ano especificado).

### Request

```json
{
  "insight": "2024 foi um ano de transformações profundas...",
  "year": 2024
}
```

### Request Parameters

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `insight` | string | Sim | Texto do insight (mínimo 1 caractere) |
| `year` | number | Não | Ano do insight (padrão: ano atual) |

### Response (200 OK)

```json
{
  "id": 1,
  "user_id": 123,
  "year": 2024,
  "insight": "2024 foi um ano de transformações profundas...",
  "created_at": "2024-12-31T23:59:00Z",
  "updated_at": "2024-12-31T23:59:00Z"
}
```

### Exemplo de Uso (Frontend)

```typescript
async function saveAnnualInsight(
  insight: string,
  year?: number
) {
  const response = await fetch('/api/form/annual-insight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      insight,
      year,
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Erro ao salvar');
  }

  return response.json();
}
```

### Implementação (Backend - route.ts)

```typescript
// app/api/form/annual-insight/route.ts
import { getSession } from '@/lib/auth';
import { saveAnnualInsight } from '@/lib/forms';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { insight, year } = await request.json();

    // Validação
    if (!insight) {
      return Response.json(
        { error: 'Missing required field: insight' },
        { status: 400 }
      );
    }

    const y = year ?? new Date().getFullYear();

    if (y < 2000 || y > 2999) {
      return Response.json(
        { error: 'Year must be between 2000 and 2999' },
        { status: 400 }
      );
    }

    // Salvar
    const result = await saveAnnualInsight(
      session.user.id,
      insight,
      y
    );

    return Response.json(result);
  } catch (error) {
    console.error('Error saving annual insight:', error);
    return Response.json(
      { error: 'Failed to save insight' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Fluxo Completo (Frontend)

### Exemplo: Modal de Insight Mensal

```typescript
// Em um componente React
import { useState } from 'react';

export default function MonthlyInsightModal({ 
  isOpen, 
  monthNumber,
  moonPhase,
  onClose,
  onSuccess 
}) {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/form/monthly-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moonPhase,
          monthNumber,
          insight,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      // Sucesso
      const result = await response.json();
      onSuccess(result);
      setInsight('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={isOpen ? 'modal open' : 'modal'}>
      <div className="modal-content">
        <h2>Insight - {moonPhase}</h2>
        
        <textarea
          value={insight}
          onChange={(e) => setInsight(e.target.value)}
          placeholder="Escreva seu insight..."
          disabled={isLoading}
        />

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading || !insight.trim()}
          >
            {isLoading ? 'Salvando...' : 'Salvar Insight'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 📊 Tratamento de Erros

### Validação de Input

```typescript
// Validar fase lunar
const validPhases = [
  'luaNova',
  'luaCrescente',
  'luaCheia',
  'luaMinguante',
];

if (!validPhases.includes(moonPhase)) {
  throw new Error('Fase lunar inválida');
}

// Validar mês
if (monthNumber < 1 || monthNumber > 12) {
  throw new Error('Mês deve estar entre 1 e 12');
}

// Validar trimestre
if (quarterNumber < 1 || quarterNumber > 4) {
  throw new Error('Trimestre deve estar entre 1 e 4');
}

// Validar texto
if (!insight || insight.trim().length === 0) {
  throw new Error('Insight não pode estar vazio');
}
```

---

## 🔄 Fluxo de Atualização

Se um insight já existe para a mesma (fase, período), será atualizado:

```typescript
// Primeira chamada - INSERT
POST /api/form/monthly-insight
{ moonPhase: 'luaNova', monthNumber: 1, insight: 'Primeiro insight' }

// Response 200
{ id: 1, ... }

// Segunda chamada - UPDATE (mesmo moonPhase, monthNumber)
POST /api/form/monthly-insight
{ moonPhase: 'luaNova', monthNumber: 1, insight: 'Insight atualizado' }

// Response 200 (mesmo id, insight atualizado, updated_at renovado)
{ id: 1, insight: 'Insight atualizado', updated_at: '2024-01-15T...' }
```

---

## 📚 Referências

- `lib/forms.ts` - Funções de banco de dados
- `infra/db/schema.sql` - Definição das tabelas
- `hooks/useMonthlyInsights.ts` - Hook para gerenciar insights mensais
- `hooks/useQuarterlyInsights.ts` - Hook para gerenciar insights trimestrais
- `hooks/useAnnualInsights.ts` - Hook para gerenciar insights anuais
