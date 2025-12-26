# 🌙 Guia de Uso: Tabela de Lunações com Emojis

## ✅ O que foi implementado

### 1. **Schema do Banco de Dados Atualizado**

A tabela `lunations` agora inclui:

- `moon_emoji` - Emoji da fase lunar (🌑 🌓 🌕 🌗)
- `zodiac_emoji` - Emoji do signo zodiacal (⚖️ 🧊 🐂 🦁 etc)

### 2. **Interface TypeScript Atualizada**

```typescript
export interface LunationData {
  lunation_date: string;
  moon_phase: string;
  moon_emoji?: string; // ✨ NOVO
  zodiac_sign: string;
  zodiac_emoji?: string; // ✨ NOVO
  illumination?: number;
  age_days?: number;
  description?: string;
  source?: string;
}
```

### 3. **Funções Atualizadas**

- `saveLunations()` - Agora salva os emojis
- `getLunations()` - Agora retorna os emojis

### 4. **API Atualizada**

GET `/api/moons/lunations` agora retorna:

```json
{
  "days": [
    {
      "date": "2025-10-21",
      "moonPhase": "Nova",
      "moonEmoji": "🌑",
      "sign": "Libra",
      "signEmoji": "⚖️",
      ...
    }
  ]
}
```

## 🚀 Como usar

### Passo 1: Aplicar a migração no banco de dados

Se a tabela `lunations` já existe no seu banco:

```bash
# Via psql
psql $DATABASE_URL -f infra/db/migration-add-emoji-lunations.sql

# Ou via Neon Console
# Cole o conteúdo do arquivo migration-add-emoji-lunations.sql
```

Se está criando do zero:

```bash
psql $DATABASE_URL -f infra/db/schema.sql
```

### Passo 2: Popular os dados fornecidos

Execute o script de seed:

```bash
npx tsx scripts/seed-lunations.ts
```

Saída esperada:

```
🌙 Iniciando seed de lunações...
📊 Total de registros: 4
✅ Lunações salvas com sucesso!
✨ Registros processados: 4
  → 2025-10-21: 🌑 Nova em ⚖️ Libra
  → 2025-10-29: 🌓 Crescente em 🧊 Aquário
  → 2025-11-05: 🌕 Cheia em 🐂 Touro
  → 2025-11-12: 🌗 Minguante em 🦁 Leão
```

### Passo 3: Verificar no LuaList

A sincronização com LuaList acontece automaticamente via API.

**No seu componente LuaList:**

```typescript
// A API já retorna os emojis
const response = await fetch('/api/moons/lunations?start=2025-10-01&end=2025-11-30');
const data = await response.json();

data.days.forEach((day) => {
  console.log(`${day.moonEmoji} ${day.moonPhase} em ${day.signEmoji} ${day.sign}`);
});
```

## 📊 Adicionar mais dados

### Via Script (recomendado)

Edite [scripts/seed-lunations.ts](scripts/seed-lunations.ts) e adicione mais entradas:

```typescript
const lunationsData: LunationData[] = [
  // ... dados existentes
  {
    lunation_date: '2025-11-20',
    moon_phase: 'Nova',
    moon_emoji: '🌑',
    zodiac_sign: 'Escorpião',
    zodiac_emoji: '♏',
    source: 'manual',
  },
  // ... mais dados
];
```

Depois execute:

```bash
npx tsx scripts/seed-lunations.ts
```

### Via API POST

```bash
curl -X POST http://localhost:3000/api/moons/lunations \
  -H "Content-Type: application/json" \
  -d '{
    "days": [
      {
        "date": "2025-12-04",
        "moonPhase": "Cheia",
        "moonEmoji": "🌕",
        "sign": "Gêmeos",
        "signEmoji": "♊"
      }
    ],
    "replace": false
  }'
```

## 🔄 Sincronização com LuaList

A sincronização acontece automaticamente quando o LuaList faz requisição para `/api/moons/lunations`:

1. **Prioridade:** Banco de dados (se disponível)
2. **Fallback:** Geração local (cálculo astronômico)

Para forçar uso do banco de dados:

```typescript
fetch('/api/moons/lunations?start=2025-10-01&end=2025-11-30&source=db');
```

## 🎨 Emojis Disponíveis

### Fases da Lua

- 🌑 Nova
- 🌓 Crescente
- 🌕 Cheia
- 🌗 Minguante

### Signos do Zodíaco

- ♈ Áries
- ♉ Touro
- ♊ Gêmeos
- ♋ Câncer
- ♌ Leão
- ♍ Virgem
- ♎ Libra
- ♏ Escorpião
- ♐ Sagitário
- ♑ Capricórnio
- ♒ Aquário
- ♓ Peixes

## 📝 Exemplo de Uso no Frontend

```typescript
import useSWR from 'swr';

function LuaList() {
  const { data } = useSWR('/api/moons/lunations?start=2025-10-01&end=2025-11-30');

  return (
    <div>
      {data?.days.map(day => (
        <div key={day.date} className="lunar-day">
          <span className="emoji">{day.moonEmoji}</span>
          <span className="phase">{day.moonPhase}</span>
          <span className="sign">{day.signEmoji} {day.sign}</span>
          <span className="date">{day.date}</span>
        </div>
      ))}
    </div>
  );
}
```

## ⚠️ Notas Importantes

1. **Conflitos de Data:** O sistema usa `ON CONFLICT (lunation_date)` - se você inserir a mesma data duas vezes, os dados serão atualizados.

2. **Source:** O campo `source` indica a origem:
   - `manual` - Dados inseridos manualmente
   - `generated` - Calculado automaticamente
   - `synced` - Importado de fonte externa

3. **Validação:** O sistema valida automaticamente ranges de data (máximo 550 dias).

## 🐛 Troubleshooting

### Erro: "DATABASE_URL não configurada"

```bash
# Adicione no .env.local
DATABASE_URL="postgresql://..."
```

### Dados não aparecem no LuaList

1. Verifique se o seed foi executado com sucesso
2. Confirme que o range de datas na API inclui seus dados
3. Verifique os logs do console para erros

### Emojis não aparecem

- Certifique-se de que seu terminal/navegador suporta UTF-8
- Verifique se os emojis foram salvos corretamente no banco

## 🔗 Arquivos Relacionados

- [infra/db/schema.sql](../infra/db/schema.sql) - Schema completo
- [infra/db/migration-add-emoji-lunations.sql](../infra/db/migration-add-emoji-lunations.sql) - Migração
- [lib/forms.ts](../lib/forms.ts) - Funções do banco
- [scripts/seed-lunations.ts](../scripts/seed-lunations.ts) - Script de seed
- [app/api/moons/lunations/route.ts](../app/api/moons/lunations/route.ts) - API
