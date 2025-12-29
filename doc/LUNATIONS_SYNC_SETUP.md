# Sincronização de Lunações com Google Sheets

## 🎯 Estratégia

```
Google Sheets (fonte única - atualiza 1x/ano)
         ↓
npm run sync:sheets (sincroniza dados)
         ↓
Database (cache para o app)
         ↓
App (lê do DB - rápido)
```

## 📋 Setup

### 1. Variáveis de Ambiente (.env.local)

```env
# Google Service Account (para autenticação)
GOOGLE_SA_EMAIL=sua-service-account@seu-projeto.iam.gserviceaccount.com
GOOGLE_SA_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# ID do Sheets com lunações
GOOGLE_LUNATIONS_SHEET_ID=seu-sheet-id-aqui

# Database URL
DATABASE_URL=sua-url-neon-aqui
```

### 2. Google Sheets Format

Crie uma abinha chamada **"Lunações"** com as colunas:

| Data       | FasedaLua | LuaEmoji | Signo   | SignoEmoji |
| ---------- | --------- | -------- | ------- | ---------- |
| 21/10/2025 | Nova      | 🌑       | Libra   | ⚖️         |
| 29/10/2025 | Crescente | 🌓       | Aquário | 🧊         |
| 05/11/2025 | Cheia     | 🌕       | Touro   | 🐂         |

## 🚀 Como Usar

### Sincronizar (execute 1x/ano):

```bash
npm run sync:sheets
```

Isso vai:

1. Ler todos os dados do Google Sheets
2. Converter datas de DD/MM/YYYY → YYYY-MM-DD
3. Salvar/atualizar no banco de dados
4. Exibir relatório de sucesso

### Acessar Lunações via API:

```bash
# Todas as lunações
curl http://localhost:3000/api/lunations

# Resposta:
{
  "success": true,
  "count": 60,
  "data": [
    {
      "id": 1,
      "lunation_date": "2025-10-21",
      "moon_phase": "Nova",
      "moon_emoji": "🌑",
      "zodiac_sign": "Libra",
      "zodiac_emoji": "⚖️",
      "source": "google-sheets",
      ...
    }
  ]
}
```

## 📚 No seu App (React/TypeScript)

```typescript
// hooks/useLunations.ts
import { useEffect, useState } from 'react';
import type { LunationData } from '@/lib/forms';

export function useLunations() {
  const [lunations, setLunations] = useState<LunationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lunations')
      .then((res) => res.json())
      .then((data) => setLunations(data.data))
      .finally(() => setLoading(false));
  }, []);

  return { lunations, loading };
}
```

```typescript
// seu-componente.tsx
import { useLunations } from "@/hooks/useLunations";

export function LunationList() {
  const { lunations } = useLunations();

  return (
    <div>
      {lunations.map((lunation) => (
        <div key={lunation.lunation_date}>
          <h3>
            {lunation.moon_emoji} {lunation.moon_phase}
          </h3>
          <p>
            {lunation.zodiac_emoji} {lunation.zodiac_sign}
          </p>
          <p>{lunation.lunation_date}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔐 Obtendo Credenciais do Google

1. Vá para [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Habilite "Google Sheets API"
4. Crie Service Account:
   - Service Accounts → Create Service Account
   - Nome: `flua-lunations-sync`
   - Grant Basic Editor role
   - Create JSON key
5. Copie `GOOGLE_SA_EMAIL` e `GOOGLE_SA_KEY` para `.env.local`
6. Compartilhe o Google Sheets com o email do Service Account

## 📊 Campos de LunationData

```typescript
interface LunationData {
  lunation_date: string; // ISO YYYY-MM-DD
  moon_phase: string; // "Nova", "Crescente", etc
  moon_emoji?: string; // "🌑", "🌓", etc
  zodiac_sign: string; // "Libra", "Aquário", etc
  zodiac_emoji?: string; // "⚖️", "🧊", etc
  illumination?: number; // 0-100 (opcional)
  age_days?: number; // dias da fase (opcional)
  description?: string; // anotações (opcional)
  source?: string; // "google-sheets"
}
```

## ✅ Checklist de Setup

- [ ] Google Sheets criada com aba "Lunações"
- [ ] Service Account criado no Google Cloud
- [ ] `GOOGLE_SA_EMAIL` adicionado ao `.env.local`
- [ ] `GOOGLE_SA_KEY` adicionado ao `.env.local`
- [ ] `GOOGLE_LUNATIONS_SHEET_ID` adicionado ao `.env.local`
- [ ] `DATABASE_URL` configurada (Neon)
- [ ] Sheet compartilhado com o email da Service Account
- [ ] `npm run sync:sheets` executado com sucesso
- [ ] API `/api/lunations` respondendo com dados

## 🎉 Pronto!

Agora você tem um fluxo super simples:

- Google Sheets é a fonte única de verdade
- Sincroniza 1x/ano (quando atualiza)
- App lê do DB (rápido, offline)
- Sem sync automático, sem exports, sem complexidade

Bora sincronizar? 🚀
