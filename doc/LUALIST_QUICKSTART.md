# 🌙 Guia Rápido: Configuração Lualist com Banco de Dados

## ⚡ Resumo em 5 Minutos

Você já tem tudo implementado! Aqui está como usar:

### 1️⃣ **Criar Tabela no Banco** (primeira vez)

```sql
-- Execute no Neon Console:
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

### 2️⃣ **Preencher com Dados**

```bash
# Opção A: Sincronizar via script (recomendado)
node scripts/sync-lunations.js

# Opção B: Sincronizar com anos específicos
node scripts/sync-lunations.js --years=2024,2025

# Opção C: Limpar e resincronizar
node scripts/sync-lunations.js --years=2024,2025 --replace
```

### 3️⃣ **Usar em Componentes**

#### Opção A: Sincronização Automática (recomendado)

```typescript
import { LunationSync } from '@/components/LunationSync';

export default function App() {
  return (
    <>
      <LunationSync autoSync={true} />
      {/* Resto da app */}
    </>
  );
}
```

#### Opção B: Sincronização Manual

```typescript
import { useSyncLunations } from '@/components/LunationSync';

export function MyComponent() {
  const { sync } = useSyncLunations();

  return (
    <button onClick={() => sync(2024)}>
      Sincronizar 2024
    </button>
  );
}
```

#### Opção C: Hook de Leitura

```typescript
import { useLunations } from '@/hooks/useLunations';

export function MyComponent() {
  const { data, isLoading, fetch } = useLunations();

  useEffect(() => {
    fetch('2024-01-01', '2024-12-31', 'auto');
  }, []);

  return (
    <div>
      {data.map(day => (
        <p key={day.date}>
          {day.date}: {day.moonPhase} em {day.sign}
        </p>
      ))}
    </div>
  );
}
```

---

## 📦 O Que Foi Implementado

| Componente              | Local                              | Descrição                                   |
| ----------------------- | ---------------------------------- | ------------------------------------------- |
| 📊 **Tabela Lunations** | `infra/db/schema.sql`              | Armazena datas de lunações                  |
| 🔌 **API GET**          | `app/api/moons/lunations/route.ts` | Busca lunações (banco + fallback)           |
| 🔌 **API POST**         | `app/api/moons/lunations/route.ts` | Salva lunações no banco                     |
| 📚 **Funções DB**       | `lib/forms.ts`                     | `getLunations()`, `saveLunations()`         |
| 🎣 **Hook**             | `hooks/useLunations.ts`            | `useLunations()` / `useLunationsForRange()` |
| ⚙️ **Componente Sync**  | `components/LunationSync.tsx`      | Sincronização automática                    |
| 📝 **Script Sync**      | `scripts/sync-lunations.js`        | Sincronização manual                        |
| 📖 **Documentação**     | `doc/LUALIST_BANCO_DADOS.md`       | Documentação completa                       |

---

## 🎯 Fluxo de Dados

```
User opens LuaListScreen
         │
         ▼
fetchMoonCalendar()
         │
         ▼
/api/moons/lunations?source=auto
         │
    ┌────┴─────┐
    ▼          ▼
 DB Found    DB Empty
    │          │
    ✅         ▼
   Use      Generate Locally
  DB         (fallback)
 Data       │
    │       ▼
    │      Return Generated
    │
    └───────┬──────┘
            ▼
       UI Renders
```

---

## 📋 Checklist de Configuração

- [ ] Tabela `lunations` criada no Neon
- [ ] Script `sync-lunations.js` testado
- [ ] Dados sincronizados para 2024-2025
- [ ] LuaListScreen abrindo sem erros
- [ ] Componente `<LunationSync />` adicionado (opcional)
- [ ] API respondendo com dados do banco

---

## 🧪 Testes Rápidos

### Testar API

```bash
# Ver dados gerados (sem banco)
curl "http://localhost:3000/api/moons/lunations?start=2024-01-01&end=2024-01-31&source=generated"

# Ver dados do banco (se existirem)
curl "http://localhost:3000/api/moons/lunations?start=2024-01-01&end=2024-01-31&source=db"

# Auto (tenta banco primeiro)
curl "http://localhost:3000/api/moons/lunations?start=2024-01-01&end=2024-01-31"

# Salvar dados
curl -X POST http://localhost:3000/api/moons/lunations \
  -H "Content-Type: application/json" \
  -d '{
    "days": [
      {
        "date": "2024-12-13",
        "moonPhase": "Lua Crescente",
        "sign": "Sagitário",
        "illumination": 65.5,
        "ageDays": 15.3
      }
    ],
    "action": "append"
  }'
```

### Testar no Banco

```bash
psql $DATABASE_URL

-- Ver quantos registros existem
SELECT COUNT(*) FROM lunations;

-- Ver dados de janeiro de 2024
SELECT lunation_date, moon_phase, zodiac_sign
FROM lunations
WHERE lunation_date >= '2024-01-01' AND lunation_date < '2024-02-01'
ORDER BY lunation_date;
```

---

## ⚙️ Variáveis de Ambiente

Nenhuma variável adicional necessária! Já usa:

- `DATABASE_URL` (existente)

Opcional:

- `API_URL` (para script `sync-lunations.js`)

---

## 🐛 Diagnóstico

### "Tabela não existe"

```bash
# Verificar
psql $DATABASE_URL -c "SELECT * FROM lunations LIMIT 1;"

# Se erro, criar:
psql $DATABASE_URL < infra/db/schema.sql
```

### "Nenhum dado no banco"

```bash
# Sincronizar
node scripts/sync-lunations.js

# Verificar
psql $DATABASE_URL -c "SELECT COUNT(*) FROM lunations;"
```

### "API retorna erro"

```bash
# Testar geração local
curl "http://localhost:3000/api/moons/lunations?start=2024-01-01&end=2024-01-31&source=generated"

# Se funcionar, problema é no banco
# Se não funcionar, problema é na API local
```

---

## 📚 Arquivos Principais

```
cosmic-space/
├── infra/db/
│   └── schema.sql                          ← Tabela lunations
├── app/api/moons/
│   └── lunations/
│       └── route.ts                        ← GET/POST /api/moons/lunations
├── lib/
│   └── forms.ts                            ← saveLunations(), getLunations()
├── hooks/
│   └── useLunations.ts                     ← useLunations(), useLunationsForRange()
├── components/
│   └── LunationSync.tsx                    ← <LunationSync /> e useSyncLunations()
├── scripts/
│   └── sync-lunations.js                   ← node scripts/sync-lunations.js
└── doc/
    └── LUALIST_BANCO_DADOS.md              ← Documentação completa
```

---

## 🎓 Exemplos de Uso

### Exemplo 1: Componente com Sincronização Automática

```typescript
'use client';

import { LunationSync } from '@/components/LunationSync';
import { LuaListScreen } from '@/app/cosmos/screens/LuaListScreen';

export default function CosmosPage() {
  return (
    <>
      {/* Sincroniza lunações automaticamente em background */}
      <LunationSync
        autoSync={true}
        years={[2024, 2025]}
        verbose={true}
      />

      {/* LuaListScreen usa dados do banco automaticamente */}
      <LuaListScreen />
    </>
  );
}
```

### Exemplo 2: Botão de Sincronização Manual

```typescript
'use client';

import { useSyncLunations } from '@/components/LunationSync';
import { useState } from 'react';

export function SyncButton() {
  const { sync, isSyncing, lastError } = useSyncLunations();
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <div>
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
      />

      <button
        onClick={() => sync(year, true)}
        disabled={isSyncing}
      >
        {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
      </button>

      {lastError && <p style={{ color: 'red' }}>{lastError}</p>}
    </div>
  );
}
```

### Exemplo 3: Filtrar Lunações por Signo

```typescript
'use client';

import { useLunations } from '@/hooks/useLunations';
import { useEffect, useMemo } from 'react';

export function LunationsBySign() {
  const lunations = useLunations();

  useEffect(() => {
    lunations.fetch('2024-01-01', '2024-12-31', 'db');
  }, []);

  const bySign = useMemo(() => {
    const map = new Map<string, typeof lunations.data>();
    lunations.data.forEach(day => {
      if (!map.has(day.sign)) map.set(day.sign, []);
      map.get(day.sign)!.push(day);
    });
    return map;
  }, [lunations.data]);

  return (
    <div>
      {Array.from(bySign.entries()).map(([sign, days]) => (
        <div key={sign}>
          <h3>{sign}</h3>
          <ul>
            {days.map(day => (
              <li key={day.date}>
                {day.date}: {day.moonPhase}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

---

## 🚀 Próximos Passos

1. **Criar tabela** no Neon
2. **Sincronizar dados** com `node scripts/sync-lunations.js`
3. **Testar LuaListScreen** - deve funcionar automaticamente
4. **(Opcional) Adicionar `<LunationSync />`** em layout principal
5. **Monitorar** - verifique logs em caso de erro

---

## 📞 Suporte

Se tiver problemas:

1. Verifique se tabela existe: `SELECT * FROM lunations LIMIT 1;`
2. Teste API diretamente: `curl http://localhost:3000/api/moons/lunations?...`
3. Veja logs: `node scripts/sync-lunations.js` (com output)
4. Verifique `DATABASE_URL` está correto

---

**Status:** ✅ Implementado e Pronto para Usar  
**Data:** 13 de dezembro de 2024  
**Versão:** 1.0
